#!/usr/bin/env bash
set -euo pipefail

# Nova Universe - Complete Teardown Script
# Safely remove all services and data

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"
cd "$PROJECT_ROOT"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
NC='\033[0m' # No Color

# Logging functions
log_info() { echo -e "${BLUE}ℹ️  $1${NC}"; }
log_success() { echo -e "${GREEN}✅ $1${NC}"; }
log_warning() { echo -e "${YELLOW}⚠️  $1${NC}"; }
log_error() { echo -e "${RED}❌ $1${NC}"; }
log_header() { echo -e "${PURPLE}$1${NC}"; }

# Ask for confirmation
confirm_teardown() {
    log_header "⚠️  Nova Universe Teardown"
    echo "=========================="
    echo ""
    log_warning "This will completely remove Nova Universe and ALL DATA"
    echo ""
    echo "This includes:"
    echo "• All Docker containers and volumes"
    echo "• Database data (tickets, users, configurations)"
    echo "• Monitoring data (metrics, alerts, logs)"
    echo "• Uploaded files and attachments"
    echo "• Environment configurations"
    echo ""
    
    read -p "Are you sure you want to continue? Type 'YES' to confirm: " confirmation
    
    if [ "$confirmation" != "YES" ]; then
        log_info "Teardown cancelled"
        exit 0
    fi
    
    echo ""
    log_warning "Starting teardown in 5 seconds... Press Ctrl+C to cancel"
    sleep 5
}

# Stop all services
stop_services() {
    log_header "🛑 Stopping Services"
    echo "===================="
    
    # Stop main services
    if [ -f "docker-compose.yml" ]; then
        log_info "Stopping main services..."
        docker-compose down --remove-orphans || log_warning "Main services may already be stopped"
    fi
    
    # Stop monitoring services
    if [ -f "docker-compose.monitoring.yml" ]; then
        log_info "Stopping monitoring services..."
        docker-compose -f docker-compose.monitoring.yml down --remove-orphans || log_warning "Monitoring services may already be stopped"
    fi
    
    # Stop AI Fabric services
    if [ -f "docker-compose.ai-fabric.yml" ]; then
        log_info "Stopping AI Fabric services..."
        docker-compose -f docker-compose.ai-fabric.yml down --remove-orphans || log_warning "AI Fabric services may already be stopped"
    fi
    
    # Stop production services
    if [ -f "docker-compose.prod.yml" ]; then
        log_info "Stopping production services..."
        docker-compose -f docker-compose.prod.yml down --remove-orphans || log_warning "Production services may already be stopped"
    fi
    
    # Stop GoAlert if it exists
    if [ -d "monitoring/goalert" ] && [ -f "monitoring/goalert/docker-compose.yml" ]; then
        log_info "Stopping GoAlert..."
        cd monitoring/goalert
        docker-compose down --remove-orphans || log_warning "GoAlert may already be stopped"
        cd "$PROJECT_ROOT"
    fi
    
    log_success "All services stopped"
    echo ""
}

# Remove Docker volumes and data
remove_volumes() {
    log_header "🗑️  Removing Data Volumes"
    echo "========================="
    
    # Get all Nova-related volumes
    VOLUMES=$(docker volume ls -q | grep -E "(nova|goalert|sentinel|postgres|redis|elasticsearch)" || true)
    
    if [ -n "$VOLUMES" ]; then
        log_info "Removing Docker volumes..."
        echo "$VOLUMES" | xargs docker volume rm -f || log_warning "Some volumes may already be removed"
        log_success "Docker volumes removed"
    else
        log_info "No Nova-related volumes found"
    fi
    
    echo ""
}

# Remove Docker images
remove_images() {
    log_header "🐳 Removing Docker Images"
    echo "========================="
    
    # Get all Nova-related images
    IMAGES=$(docker images --format "table {{.Repository}}:{{.Tag}}" | grep -E "(nova|goalert|sentinel)" | awk '{print $1}' || true)
    
    if [ -n "$IMAGES" ]; then
        log_info "Removing Nova Docker images..."
        echo "$IMAGES" | xargs docker rmi -f || log_warning "Some images may already be removed"
        log_success "Docker images removed"
    else
        log_info "No Nova-related images found"
    fi
    
    echo ""
}

# Clean up local files
cleanup_files() {
    log_header "🧹 Cleaning Up Files"
    echo "===================="
    
    # Remove node_modules (optional)
    read -p "Remove node_modules directories? (y/N): " remove_modules
    if [[ $remove_modules =~ ^[Yy]$ ]]; then
        log_info "Removing node_modules..."
        find . -name "node_modules" -type d -exec rm -rf {} + 2>/dev/null || true
        log_success "node_modules removed"
    fi
    
    # Remove environment files (optional)
    read -p "Remove environment files (.env)? (y/N): " remove_env
    if [[ $remove_env =~ ^[Yy]$ ]]; then
        log_info "Removing .env files..."
        find . -name ".env" -not -name ".env.example" -type f -delete || true
        find . -name ".env.*" -not -name "*.example" -not -name "*.template" -type f -delete || true
        log_success "Environment files removed"
    fi
    
    # Remove logs (optional)
    read -p "Remove log files? (y/N): " remove_logs
    if [[ $remove_logs =~ ^[Yy]$ ]]; then
        log_info "Removing log files..."
        find . -name "*.log" -type f -delete || true
        find . -name "logs" -type d -exec rm -rf {} + 2>/dev/null || true
        log_success "Log files removed"
    fi
    
    # Remove temporary files
    log_info "Removing temporary files..."
    find . -name ".DS_Store" -type f -delete 2>/dev/null || true
    find . -name "*.tmp" -type f -delete 2>/dev/null || true
    find . -name ".cache" -type d -exec rm -rf {} + 2>/dev/null || true
    
    echo ""
}

# Docker system cleanup
docker_cleanup() {
    log_header "🔧 Docker System Cleanup"
    echo "========================"
    
    read -p "Run Docker system cleanup? This will remove unused containers, networks, and images (y/N): " cleanup_docker
    if [[ $cleanup_docker =~ ^[Yy]$ ]]; then
        log_info "Running Docker system cleanup..."
        docker system prune -f || log_warning "Docker cleanup may have encountered issues"
        log_success "Docker system cleanup complete"
    fi
    
    echo ""
}

# Show completion message
show_completion() {
    log_header "🎯 Teardown Complete"
    echo "===================="
    echo ""
    log_success "Nova Universe has been completely removed!"
    echo ""
    echo "What was removed:"
    echo "• All Docker containers and services"
    echo "• Database data and volumes"
    echo "• Monitoring and alerting data"
    echo "• Container images (if selected)"
    echo "• Local files (if selected)"
    echo ""
    echo "To reinstall Nova Universe:"
    echo "• Run: ./setup.sh"
    echo "• Or follow the quickstart guide: docs/quickstart.md"
    echo ""
    log_info "Thank you for using Nova Universe!"
    echo ""
}

# Main teardown function
main() {
    confirm_teardown
    stop_services
    remove_volumes
    remove_images
    cleanup_files
    docker_cleanup
    show_completion
}

# Handle script arguments
case "${1:-}" in
    "--help"|"-h"|"help")
        echo "Nova Universe Teardown Script"
        echo ""
        echo "Usage: $0 [option]"
        echo ""
        echo "Options:"
        echo "  --help, -h        Show this help message"
        echo "  --force           Skip confirmation (dangerous!)"
        echo "  --services-only   Only stop services, keep data"
        echo ""
        echo "Example:"
        echo "  $0                Interactive teardown"
        echo "  $0 --services-only    Stop services only"
        ;;
    "--force")
        log_warning "Force mode enabled - skipping confirmation"
        stop_services
        remove_volumes
        remove_images
        show_completion
        ;;
    "--services-only")
        log_info "Stopping services only (keeping data)"
        stop_services
        log_success "Services stopped. Data preserved."
        ;;
    *)
        main
        ;;
esac
