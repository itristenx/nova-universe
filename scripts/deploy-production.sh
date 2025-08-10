#!/bin/bash

#!/usr/bin/env bash
set -euo pipefail

# Nova Universe - Production Deployment Script
# Deploy to production with monitoring, alerting, and AI capabilities

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"
cd "$PROJECT_ROOT"

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
NC='\033[0m'

log_info() { echo -e "${BLUE}ℹ️  $1${NC}"; }
log_success() { echo -e "${GREEN}✅ $1${NC}"; }
log_warning() { echo -e "${YELLOW}⚠️  $1${NC}"; }
log_error() { echo -e "${RED}❌ $1${NC}"; exit 1; }
log_header() { echo -e "${PURPLE}$1${NC}"; }

# Deployment environment
ENVIRONMENT="${1:-production}"
BACKUP_BEFORE_DEPLOY="${BACKUP_BEFORE_DEPLOY:-true}"
HEALTH_CHECK_TIMEOUT="${HEALTH_CHECK_TIMEOUT:-300}"

# Pre-deployment checks
run_pre_checks() {
    log_header "🔍 Pre-Deployment Checks"
    echo "========================"
    
    # Check Docker
    if ! command -v docker >/dev/null 2>&1; then
        log_error "Docker is required for production deployment"
    fi
    
    # Check Docker Compose
    if ! command -v docker-compose >/dev/null 2>&1 && ! docker compose version >/dev/null 2>&1; then
        log_error "Docker Compose is required for production deployment"
    fi
    
    # Check environment files
    REQUIRED_ENV_FILES=(
        ".env.production.template"
        "apps/api/.env"
        ".env.monitoring"
        ".env.ai-fabric"
    )
    
    for env_file in "${REQUIRED_ENV_FILES[@]}"; do
        if [ ! -f "$env_file" ]; then
            log_error "Required environment file missing: $env_file"
        fi
    done
    
    # Check for production secrets
    if [ ! -f "apps/api/.env" ] || ! grep -q "JWT_SECRET" apps/api/.env; then
        log_warning "Production secrets may not be configured"
        log_info "Run: bash scripts/generate-production-secrets.sh"
    fi
    
    # Check SSL certificates
    if [ ! -f "nginx/ssl/cert.pem" ] || [ ! -f "nginx/ssl/key.pem" ]; then
        log_warning "SSL certificates not found. Using self-signed certificates"
    fi
    
    log_success "Pre-deployment checks passed"
    echo ""
}

# Backup current deployment
backup_deployment() {
    if [ "$BACKUP_BEFORE_DEPLOY" = "true" ]; then
        log_header "💾 Creating Backup"
        echo "=================="
        
        BACKUP_DIR="backups/$(date +%Y%m%d_%H%M%S)"
        mkdir -p "$BACKUP_DIR"
        
        # Backup database
        if docker ps | grep -q postgres; then
            log_info "Backing up database..."
            docker exec nova-postgres pg_dumpall -U postgres > "$BACKUP_DIR/database.sql"
        fi
        
        # Backup volumes
        log_info "Backing up volumes..."
        docker run --rm -v nova_uploads:/data -v "$PWD/$BACKUP_DIR":/backup alpine tar czf /backup/uploads.tar.gz -C /data . || true
        docker run --rm -v nova_logs:/data -v "$PWD/$BACKUP_DIR":/backup alpine tar czf /backup/logs.tar.gz -C /data . || true
        
        # Backup environment files
        log_info "Backing up configuration..."
        cp apps/api/.env "$BACKUP_DIR/api.env" 2>/dev/null || true
        cp .env.monitoring "$BACKUP_DIR/monitoring.env" 2>/dev/null || true
        cp .env.ai-fabric "$BACKUP_DIR/ai-fabric.env" 2>/dev/null || true
        
        log_success "Backup created: $BACKUP_DIR"
        echo ""
    fi
}

# Build production images
build_images() {
    log_header "🏗️  Building Production Images"
    echo "=============================="
    
    # Build API image
    log_info "Building Nova API..."
    docker build -f apps/api/Dockerfile.prod -t nova-api:latest apps/api/
    
    # Build Core UI image
    log_info "Building Nova Core UI..."
    docker build -f apps/core/nova-core/Dockerfile.prod -t nova-core:latest apps/core/nova-core/
    
    # Build Comms image
    log_info "Building Nova Comms..."
    docker build -f apps/comms/nova-comms/Dockerfile -t nova-comms:latest apps/comms/nova-comms/
    
    # Build Beacon image
    log_info "Building Nova Beacon..."
    docker build -f apps/beacon/nova-beacon/Dockerfile -t nova-beacon:latest apps/beacon/nova-beacon/
    
    log_success "All images built successfully"
    echo ""
}

# Deploy services
deploy_services() {
    log_header "🚀 Deploying Services"
    echo "====================="
    
    # Pull latest base images
    log_info "Pulling base images..."
    docker-compose -f docker-compose.prod.yml pull postgres redis nginx
    
    # Start infrastructure services first
    log_info "Starting infrastructure services..."
    docker-compose -f docker-compose.prod.yml up -d postgres redis
    
    # Wait for database
    log_info "Waiting for database to be ready..."
    sleep 15
    
    # Run database migrations
    log_info "Running database migrations..."
    if [ -f "scripts/production-db-setup.sh" ]; then
        bash scripts/production-db-setup.sh
    fi
    
    # Start application services
    log_info "Starting application services..."
    docker-compose -f docker-compose.prod.yml up -d nova-api nova-core nova-comms nova-beacon
    
    # Start monitoring stack
    log_info "Starting monitoring services..."
    docker-compose -f docker-compose.monitoring.yml up -d
    
    # Start AI Fabric if configured
    if [ -f ".env.ai-fabric" ] && grep -q "OPENAI_API_KEY" .env.ai-fabric; then
        log_info "Starting AI Fabric services..."
        docker-compose -f docker-compose.ai-fabric.yml up -d
    fi
    
    # Start reverse proxy last
    log_info "Starting reverse proxy..."
    docker-compose -f docker-compose.prod.yml up -d nginx
    
    log_success "All services deployed"
    echo ""
}

# Health check
health_check() {
    log_header "🔍 Health Check"
    echo "==============="
    
    local timeout=$HEALTH_CHECK_TIMEOUT
    local elapsed=0
    local interval=10
    
    log_info "Waiting for services to be healthy (timeout: ${timeout}s)..."
    
    while [ $elapsed -lt $timeout ]; do
        local healthy=true
        
        # Check API health
        if ! curl -sf http://localhost/api/health >/dev/null 2>&1; then
            healthy=false
        fi
        
        # Check Core UI
        if ! curl -sf http://localhost >/dev/null 2>&1; then
            healthy=false
        fi
        
        # Check Sentinel
        if ! curl -sf http://localhost:3002/api/status >/dev/null 2>&1; then
            healthy=false
        fi
        
        if [ "$healthy" = true ]; then
            log_success "All services are healthy"
            return 0
        fi
        
        echo -n "."
        sleep $interval
        elapsed=$((elapsed + interval))
    done
    
    log_error "Health check failed - services did not become healthy within ${timeout}s"
}

# Post-deployment tasks
post_deployment() {
    log_header "⚙️  Post-Deployment Tasks"
    echo "========================"
    
    # Verify SSL certificates
    log_info "Checking SSL certificate..."
    if curl -k -sf https://localhost >/dev/null 2>&1; then
        log_success "HTTPS is working"
    else
        log_warning "HTTPS check failed"
    fi
    
    # Run system validation
    log_info "Running system validation..."
    if [ -f "validate-implementation.sh" ]; then
        bash validate-implementation.sh || log_warning "Validation script found issues"
    fi
    
    # Create admin user if needed
    log_info "Checking admin user..."
    cd apps/api
    node cli.js users || log_warning "Could not check admin users"
    cd "$PROJECT_ROOT"
    
    # Display service URLs
    echo ""
    log_header "🌐 Production URLs"
    echo "=================="
    echo "• Admin Interface:   https://localhost"
    echo "• API Documentation: https://localhost/api/docs"
    echo "• Monitoring:        https://localhost/sentinel"
    echo "• Alerting:          https://localhost/goalert"
    echo ""
    
    log_success "Production deployment complete!"
    echo ""
}

# Rollback function
rollback() {
    log_header "🔄 Rolling Back Deployment"
    echo "=========================="
    
    # Find latest backup
    LATEST_BACKUP=$(ls -1 backups/ | sort -r | head -n1)
    
    if [ -z "$LATEST_BACKUP" ]; then
        log_error "No backup found for rollback"
    fi
    
    log_info "Rolling back to: $LATEST_BACKUP"
    
    # Stop current services
    docker-compose -f docker-compose.prod.yml down
    
    # Restore database
    if [ -f "backups/$LATEST_BACKUP/database.sql" ]; then
        log_info "Restoring database..."
        docker-compose -f docker-compose.prod.yml up -d postgres
        sleep 10
        docker exec -i nova-postgres psql -U postgres < "backups/$LATEST_BACKUP/database.sql"
    fi
    
    # Restore volumes
    if [ -f "backups/$LATEST_BACKUP/uploads.tar.gz" ]; then
        log_info "Restoring uploads..."
        docker run --rm -v nova_uploads:/data -v "$PWD/backups/$LATEST_BACKUP":/backup alpine tar xzf /backup/uploads.tar.gz -C /data
    fi
    
    # Restart services
    docker-compose -f docker-compose.prod.yml up -d
    
    log_success "Rollback complete"
}

# Main deployment function
main() {
    log_header "🚀 Nova Universe Production Deployment"
    echo "======================================"
    echo "Environment: $ENVIRONMENT"
    echo ""
    
    run_pre_checks
    backup_deployment
    build_images
    deploy_services
    health_check
    post_deployment
}

# Handle script arguments
case "${1:-deploy}" in
    "deploy"|"production")
        main
        ;;
    "rollback")
        rollback
        ;;
    "health")
        health_check
        ;;
    "--help"|"-h"|"help")
        echo "Nova Universe Production Deployment"
        echo ""
        echo "Usage: $0 [command]"
        echo ""
        echo "Commands:"
        echo "  deploy      Full production deployment (default)"
        echo "  rollback    Rollback to previous backup"
        echo "  health      Run health check only"
        echo "  help        Show this help"
        echo ""
        echo "Environment Variables:"
        echo "  BACKUP_BEFORE_DEPLOY=false    Skip backup creation"
        echo "  HEALTH_CHECK_TIMEOUT=600      Health check timeout in seconds"
        echo ""
        ;;
    *)
        log_error "Unknown command: $1. Use '$0 help' for usage."
        ;;
esac

# Configuration
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"
DEPLOYMENT_ID="deploy_$(date +%Y%m%d_%H%M%S)"
LOG_FILE="/var/log/nova-deployment.log"
BACKUP_DIR="${BACKUP_DIR:-$PROJECT_ROOT/backups}"
HEALTHCHECK_TIMEOUT=300
ROLLBACK_ENABLED=true

# Environment configuration
ENVIRONMENT="${ENVIRONMENT:-production}"
DOCKER_REGISTRY="${DOCKER_REGISTRY:-}"
IMAGE_TAG="${IMAGE_TAG:-latest}"
COMPOSE_FILE="${COMPOSE_FILE:-docker-compose.prod.yml}"

# Functions
log() {
    local level=$1
    shift
    local message="$*"
    local timestamp=$(date '+%Y-%m-%d %H:%M:%S')
    
    case $level in
        INFO)
            echo -e "${BLUE}[INFO]${NC} $message"
            ;;
        SUCCESS)
            echo -e "${GREEN}[SUCCESS]${NC} $message"
            ;;
        WARNING)
            echo -e "${YELLOW}[WARNING]${NC} $message"
            ;;
        ERROR)
            echo -e "${RED}[ERROR]${NC} $message"
            ;;
        STEP)
            echo -e "${PURPLE}[STEP]${NC} $message"
            ;;
    esac
    
    # Log to file
    echo "[$timestamp] [$level] $message" >> "$LOG_FILE"
}

check_prerequisites() {
    log STEP "Checking deployment prerequisites..."
    
    # Check if Docker is available
    if ! command -v docker &> /dev/null; then
        log ERROR "Docker is required but not installed"
        exit 1
    fi
    
    # Check if Docker Compose is available
    if ! command -v docker-compose &> /dev/null; then
        log ERROR "Docker Compose is required but not installed"
        exit 1
    fi
    
    # Check if required files exist
    local required_files=(
        "$PROJECT_ROOT/$COMPOSE_FILE"
        "$PROJECT_ROOT/apps/api/.env.production.template"
        "$PROJECT_ROOT/nginx/nginx.conf"
    )
    
    for file in "${required_files[@]}"; do
        if [ ! -f "$file" ]; then
            log ERROR "Required file not found: $file"
            exit 1
        fi
    done
    
    # Check if environment variables are set
    local required_env_vars=(
        "SESSION_SECRET"
        "JWT_SECRET"
        "POSTGRES_PASSWORD"
    )
    
    for var in "${required_env_vars[@]}"; do
        if [ -z "${!var:-}" ]; then
            log ERROR "Required environment variable not set: $var"
            log INFO "Please run: source scripts/generate-production-secrets.sh"
            exit 1
        fi
    done
    
    log SUCCESS "Prerequisites check passed"
}

backup_current_deployment() {
    if [ "$ROLLBACK_ENABLED" == "true" ]; then
        log STEP "Creating backup of current deployment..."
        
        # Create backup directory
        mkdir -p "$BACKUP_DIR/$DEPLOYMENT_ID"
        
        # Backup database
        if docker-compose -f "$COMPOSE_FILE" exec -T postgres pg_dump -U "${POSTGRES_USER:-nova_user}" "${POSTGRES_DB:-nova_universe}" > "$BACKUP_DIR/$DEPLOYMENT_ID/database.sql" 2>/dev/null; then
            log SUCCESS "Database backup created"
        else
            log WARNING "Database backup failed (service might not be running)"
        fi
        
        # Backup current environment files
        if [ -f "$PROJECT_ROOT/apps/api/.env" ]; then
            cp "$PROJECT_ROOT/apps/api/.env" "$BACKUP_DIR/$DEPLOYMENT_ID/api.env"
            log SUCCESS "Environment backup created"
        fi
        
        # Backup current docker-compose state
        docker-compose -f "$COMPOSE_FILE" config > "$BACKUP_DIR/$DEPLOYMENT_ID/docker-compose-backup.yml" 2>/dev/null || true
        
        log SUCCESS "Backup created: $BACKUP_DIR/$DEPLOYMENT_ID"
    fi
}

build_images() {
    log STEP "Building Docker images..."
    
    # Build API image
    log INFO "Building Nova API image..."
    if docker build -f "$PROJECT_ROOT/apps/api/Dockerfile.prod" -t "nova-universe/api:$IMAGE_TAG" "$PROJECT_ROOT/apps/api/"; then
        log SUCCESS "Nova API image built successfully"
    else
        log ERROR "Failed to build Nova API image"
        exit 1
    fi
    
    # Build Core image
    log INFO "Building Nova Core image..."
    if docker build -f "$PROJECT_ROOT/apps/core/Dockerfile.prod" -t "nova-universe/core:$IMAGE_TAG" "$PROJECT_ROOT/apps/core/"; then
        log SUCCESS "Nova Core image built successfully"
    else
        log ERROR "Failed to build Nova Core image"
        exit 1
    fi
    
    # Build Orbit image
    log INFO "Building Nova Orbit image..."
    if docker build -f "$PROJECT_ROOT/apps/orbit/Dockerfile.prod" -t "nova-universe/orbit:$IMAGE_TAG" "$PROJECT_ROOT/apps/orbit/"; then
        log SUCCESS "Nova Orbit image built successfully"
    else
        log ERROR "Failed to build Nova Orbit image"
        exit 1
    fi
    
    log SUCCESS "All images built successfully"
}

deploy_services() {
    log STEP "Deploying services..."
    
    cd "$PROJECT_ROOT"
    
    # Pull external images
    log INFO "Pulling external images..."
    docker-compose -f "$COMPOSE_FILE" pull postgres mongodb redis elasticsearch nginx prometheus grafana
    
    # Deploy services with rolling update
    log INFO "Starting deployment..."
    
    # Deploy infrastructure services first
    docker-compose -f "$COMPOSE_FILE" up -d postgres mongodb redis elasticsearch
    
    # Wait for databases to be ready
    wait_for_services_health "postgres mongodb redis elasticsearch" 60
    
    # Run database migrations
    log INFO "Running database migrations..."
    bash "$SCRIPT_DIR/production-db-setup.sh" --backup
    
    # Deploy application services
    docker-compose -f "$COMPOSE_FILE" up -d nova-api nova-core nova-orbit
    
    # Wait for application services
    wait_for_services_health "nova-api nova-core nova-orbit" 120
    
    # Deploy reverse proxy
    docker-compose -f "$COMPOSE_FILE" up -d nginx
    
    # Deploy monitoring services
    docker-compose -f "$COMPOSE_FILE" up -d prometheus grafana
    
    log SUCCESS "Services deployed successfully"
}

wait_for_services_health() {
    local services="$1"
    local timeout="$2"
    
    log INFO "Waiting for services to be healthy: $services"
    
    local start_time=$(date +%s)
    
    for service in $services; do
        log INFO "Checking health of $service..."
        
        while true; do
            local current_time=$(date +%s)
            local elapsed=$((current_time - start_time))
            
            if [ $elapsed -gt $timeout ]; then
                log ERROR "Timeout waiting for $service to be healthy"
                return 1
            fi
            
            if docker-compose -f "$COMPOSE_FILE" ps "$service" | grep -q "healthy\|Up"; then
                log SUCCESS "$service is healthy"
                break
            fi
            
            log INFO "Waiting for $service... (${elapsed}s/${timeout}s)"
            sleep 10
        done
    done
    
    log SUCCESS "All services are healthy"
}

run_health_checks() {
    log STEP "Running comprehensive health checks..."
    
    local health_endpoints=(
        "http://localhost/nginx-health"
        "http://localhost/api/health"
        "http://localhost/admin/api/health"
    )
    
    for endpoint in "${health_endpoints[@]}"; do
        log INFO "Checking: $endpoint"
        
        if curl -f -s -m 10 "$endpoint" > /dev/null; then
            log SUCCESS "Health check passed: $endpoint"
        else
            log ERROR "Health check failed: $endpoint"
            return 1
        fi
    done
    
    # Check database connectivity
    if docker-compose -f "$COMPOSE_FILE" exec -T nova-api node -e "
        const { PrismaClient } = require('@prisma/client');
        const prisma = new PrismaClient();
        prisma.\$connect().then(() => {
            console.log('Database connection successful');
            process.exit(0);
        }).catch((error) => {
            console.error('Database connection failed:', error);
            process.exit(1);
        });
    "; then
        log SUCCESS "Database connectivity check passed"
    else
        log ERROR "Database connectivity check failed"
        return 1
    fi
    
    log SUCCESS "All health checks passed"
}

run_smoke_tests() {
    log STEP "Running smoke tests..."
    
    # Test API endpoints
    local api_tests=(
        "GET /api/health"
        "GET /api/server/status"
    )
    
    for test in "${api_tests[@]}"; do
        local method=$(echo "$test" | cut -d' ' -f1)
        local path=$(echo "$test" | cut -d' ' -f2)
        
        log INFO "Testing: $method $path"
        
        if curl -X "$method" -f -s -m 10 "http://localhost$path" > /dev/null; then
            log SUCCESS "Smoke test passed: $method $path"
        else
            log ERROR "Smoke test failed: $method $path"
            return 1
        fi
    done
    
    log SUCCESS "All smoke tests passed"
}

cleanup_old_images() {
    log STEP "Cleaning up old Docker images..."
    
    # Remove dangling images
    docker image prune -f > /dev/null 2>&1 || true
    
    # Remove old Nova Universe images (keep latest 3)
    for image in nova-universe/api nova-universe/core nova-universe/orbit; do
        local old_images=$(docker images "$image" --format "table {{.Repository}}:{{.Tag}}" | tail -n +2 | head -n -3)
        if [ -n "$old_images" ]; then
            echo "$old_images" | xargs -r docker rmi > /dev/null 2>&1 || true
        fi
    done
    
    log SUCCESS "Image cleanup completed"
}

rollback_deployment() {
    log ERROR "Deployment failed. Starting rollback..."
    
    if [ "$ROLLBACK_ENABLED" == "true" ] && [ -d "$BACKUP_DIR/$DEPLOYMENT_ID" ]; then
        # Stop current services
        docker-compose -f "$COMPOSE_FILE" down
        
        # Restore database
        if [ -f "$BACKUP_DIR/$DEPLOYMENT_ID/database.sql" ]; then
            log INFO "Restoring database..."
            docker-compose -f "$COMPOSE_FILE" up -d postgres
            sleep 30
            docker-compose -f "$COMPOSE_FILE" exec -T postgres psql -U "${POSTGRES_USER:-nova_user}" -d "${POSTGRES_DB:-nova_universe}" < "$BACKUP_DIR/$DEPLOYMENT_ID/database.sql"
        fi
        
        # Restore environment
        if [ -f "$BACKUP_DIR/$DEPLOYMENT_ID/api.env" ]; then
            cp "$BACKUP_DIR/$DEPLOYMENT_ID/api.env" "$PROJECT_ROOT/apps/api/.env"
        fi
        
        # Start previous version
        docker-compose -f "$COMPOSE_FILE" up -d
        
        log SUCCESS "Rollback completed"
    else
        log WARNING "Rollback not possible (backup not available or disabled)"
    fi
}

send_deployment_notification() {
    local status="$1"
    local message="Nova Universe deployment $DEPLOYMENT_ID: $status"
    
    # Send to Slack (if configured)
    if [ -n "${SLACK_WEBHOOK_URL:-}" ]; then
        curl -X POST -H 'Content-type: application/json' \
            --data "{\"text\":\"$message\"}" \
            "$SLACK_WEBHOOK_URL" > /dev/null 2>&1 || true
    fi
    
    log INFO "Deployment notification sent: $status"
}

show_deployment_summary() {
    log SUCCESS "Deployment completed successfully!"
    echo ""
    echo "🚀 Nova Universe Production Deployment Summary"
    echo "============================================="
    echo "Deployment ID: $DEPLOYMENT_ID"
    echo "Environment: $ENVIRONMENT"
    echo "Image Tag: $IMAGE_TAG"
    echo "Timestamp: $(date)"
    echo ""
    echo "Services Status:"
    docker-compose -f "$COMPOSE_FILE" ps
    echo ""
    echo "Access URLs:"
    echo "• Main Application: https://your-domain.com"
    echo "• Admin Interface: https://your-domain.com/admin"
    echo "• API Health: https://your-domain.com/api/health"
    echo "• Monitoring: https://your-domain.com:3003 (Grafana)"
    echo ""
    echo "Next Steps:"
    echo "1. Verify all services are working correctly"
    echo "2. Check monitoring dashboards"
    echo "3. Run additional integration tests"
    echo "4. Update DNS/Load Balancer if needed"
}

show_usage() {
    echo "Usage: $0 [OPTIONS]"
    echo ""
    echo "Options:"
    echo "  --no-backup       Skip backup creation"
    echo "  --no-rollback     Disable automatic rollback on failure"
    echo "  --tag TAG         Use specific image tag (default: latest)"
    echo "  --environment ENV Set deployment environment (default: production)"
    echo "  --help            Show this help message"
    echo ""
    echo "Environment Variables:"
    echo "  SESSION_SECRET    JWT session secret (required)"
    echo "  JWT_SECRET        JWT signing secret (required)"
    echo "  POSTGRES_PASSWORD Database password (required)"
    echo "  SLACK_WEBHOOK_URL Slack notification webhook (optional)"
}

# Main execution
main() {
    local skip_backup=false
    
    # Parse command line arguments
    while [[ $# -gt 0 ]]; do
        case $1 in
            --no-backup)
                skip_backup=true
                shift
                ;;
            --no-rollback)
                ROLLBACK_ENABLED=false
                shift
                ;;
            --tag)
                IMAGE_TAG="$2"
                shift 2
                ;;
            --environment)
                ENVIRONMENT="$2"
                shift 2
                ;;
            --help)
                show_usage
                exit 0
                ;;
            *)
                log ERROR "Unknown option: $1"
                show_usage
                exit 1
                ;;
        esac
    done
    
    echo "🚀 Nova Universe Production Deployment"
    echo "======================================"
    echo "Deployment ID: $DEPLOYMENT_ID"
    echo "Environment: $ENVIRONMENT"
    echo "Image Tag: $IMAGE_TAG"
    echo ""
    
    # Trap to handle failures
    trap 'rollback_deployment; send_deployment_notification "FAILED"; exit 1' ERR
    
    # Main deployment flow
    check_prerequisites
    
    if [ "$skip_backup" == "false" ]; then
        backup_current_deployment
    fi
    
    build_images
    deploy_services
    run_health_checks
    run_smoke_tests
    cleanup_old_images
    
    # Success notification
    send_deployment_notification "SUCCESS"
    show_deployment_summary
    
    log SUCCESS "Production deployment completed successfully!"
}

# Run main function with all arguments
main "$@"
