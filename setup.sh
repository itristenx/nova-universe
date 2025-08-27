#!/usr/bin/env bash
set -euo pipefail

# Nova Universe - Simplified Setup Script
# One-command setup for development and production

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

# Check system requirements
check_requirements() {
    log_header "🔍 Checking System Requirements"
    echo "================================"
    
    # Check Node.js
    if command -v node >/dev/null 2>&1; then
        NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
        if [ "$NODE_VERSION" -ge 18 ]; then
            log_success "Node.js v$(node -v) found"
        else
            log_error "Node.js 18+ required. Found v$(node -v)"
            exit 1
        fi
    else
        log_error "Node.js not found. Please install Node.js 18+"
        exit 1
    fi
    
    # Check package manager
    if command -v pnpm >/dev/null 2>&1; then
        log_success "pnpm $(pnpm -v) found"
        PACKAGE_MANAGER="pnpm"
    elif command -v npm >/dev/null 2>&1; then
        log_success "npm $(npm -v) found"
        PACKAGE_MANAGER="npm"
    else
        log_error "No package manager found. Please install npm or pnpm"
        exit 1
    fi
    
    # Check Docker
    if command -v docker >/dev/null 2>&1; then
        log_success "Docker $(docker --version | cut -d' ' -f3 | cut -d',' -f1) found"
        HAS_DOCKER=true
    else
        log_warning "Docker not found. Some features may not work"
        HAS_DOCKER=false
    fi
    
    # Check Docker Compose
    if command -v docker-compose >/dev/null 2>&1; then
        log_success "Docker Compose found"
    elif docker compose version >/dev/null 2>&1; then
        log_success "Docker Compose (v2) found"
    else
        log_warning "Docker Compose not found. Some features may not work"
    fi
    
    echo ""
}

# Install dependencies
install_dependencies() {
    log_header "📦 Installing Dependencies"
    echo "=========================="
    
    log_info "Installing workspace dependencies..."
    if [ "$PACKAGE_MANAGER" = "pnpm" ]; then
        pnpm install --frozen-lockfile
    else
        npm ci
    fi
    
    log_success "Dependencies installed"
    echo ""
}

# Setup environment files
setup_environment() {
    log_header "⚙️  Setting Up Environment"
    echo "========================="
    
    # Create .env file if it doesn't exist
    if [ ! -f ".env" ]; then
        if [ -f "env.template" ]; then
            log_info "Creating .env from template"
            cp "env.template" ".env"
            log_warning "Please review and customize .env file"
        elif [ -f ".env.example" ]; then
            log_info "Creating .env from example"
            cp ".env.example" ".env"
            log_warning "Please review and customize .env file"
        else
            log_info "Creating basic .env file"
            cat > .env << EOF
# Nova Universe Environment Configuration
NODE_ENV=development
PORT=3000
HOST=localhost

# Database Configuration
POSTGRES_DB=nova_universe
POSTGRES_USER=nova_admin
POSTGRES_PASSWORD=nova_password
POSTGRES_PORT=5432

# MongoDB Configuration
MONGO_ROOT_USERNAME=admin
MONGO_ROOT_PASSWORD=mongo_secure_pass_2024
MONGO_DB=nova_logs
MONGO_PORT=27017

# Redis Configuration
REDIS_PASSWORD=redis_secure_pass_2024
REDIS_PORT=6379

# Organization Configuration
ORGANIZATION_NAME=Nova ITSM
ADMIN_EMAIL=admin@example.com
ADMIN_PASSWORD=admin123

# Security
JWT_SECRET=your-super-secure-jwt-secret-key-here
EOF
        fi
    else
        log_info ".env file already exists"
    fi
    
    log_success "Environment setup complete"
    echo ""
}

# Start database services
start_database() {
    log_header "🗄️  Starting Database Services"
    echo "============================="
    
    if [ "$HAS_DOCKER" = true ]; then
        log_info "Starting core database services..."
        
        # Start only core services (no profiles)
        docker-compose up -d postgres mongodb redis
        
        # Wait for services to be ready
        log_info "Waiting for services to be ready..."
        sleep 15
        
        log_success "Core database services started!"
        
        # Display service URLs
        echo ""
        log_header "🌐 Service URLs"
        echo "==============="
        echo "• PostgreSQL:     localhost:5432"
        echo "• MongoDB:        localhost:27017"
        echo "• Redis:          localhost:6379"
        echo ""
        
    else
        log_warning "Docker not available. Please setup databases manually"
        log_info "Database requirements:"
        log_info "- PostgreSQL 15+ on port 5432"
        log_info "- MongoDB 7+ on port 27017"
        log_info "- Redis 7+ on port 6379"
    fi
    
    echo ""
}

# Start optional services
start_optional_services() {
    log_header "🚀 Starting Optional Services"
    echo "============================="
    
    if [ "$HAS_DOCKER" = true ]; then
        log_info "Starting optional services (full profile)..."
        
        # Start services with full profile
        docker-compose --profile full up -d
        
        log_success "Optional services started!"
        
        # Display additional service URLs
        echo ""
        log_header "🌐 Additional Service URLs"
        echo "=========================="
        echo "• pgAdmin:        http://localhost:8080"
        echo "• Mongo Express:  http://localhost:8081"
        echo "• Elasticsearch:  http://localhost:9200"
        echo "• Kibana:         http://localhost:5601"
        echo ""
        
    else
        log_warning "Docker not available. Optional services not started"
    fi
    
    echo ""
}

# Setup database schema
setup_database_schema() {
    log_header "🗃️  Setting Up Database Schema"
    echo "=============================="
    
    if [ "$HAS_DOCKER" = true ]; then
        log_info "Running database migrations..."
        
        # Check if Prisma is available
        if [ -f "prisma/schema.prisma" ]; then
            log_info "Found Prisma schema, running migrations..."
            cd prisma
            npx prisma migrate deploy
            npx prisma generate
            cd "$PROJECT_ROOT"
            log_success "Database schema setup complete"
        else
            log_warning "No Prisma schema found. Skipping migrations."
        fi
        
    else
        log_warning "Docker not available. Please run migrations manually"
    fi
    
    echo ""
}

# Start development servers
start_dev_servers() {
    log_header "🖥️  Starting Development Servers"
    echo "================================="
    
    log_info "Starting unified UI in development mode..."
    
    # Start the unified app
    cd apps/unified
    if [ "$PACKAGE_MANAGER" = "pnpm" ]; then
        pnpm dev &
    else
        npm run dev &
    fi
    UNIFIED_PID=$!
    cd "$PROJECT_ROOT"
    
    log_success "Development servers started!"
    echo ""
    log_header "🌐 Development URLs"
    echo "===================="
    echo "• Unified UI:      http://localhost:5173"
    echo "• Setup Wizard:    http://localhost:5173/setup"
    echo ""
    log_info "Unified UI PID: $UNIFIED_PID"
    echo ""
}

# Health check
run_health_check() {
    log_header "🔍 Running Health Check"
    echo "======================="
    
    # Wait a moment for services to fully start
    sleep 5
    
    if [ "$HAS_DOCKER" = true ]; then
        log_info "Checking Docker services..."
        docker-compose ps
        
        log_info "Checking database connections..."
        # Simple health check - try to connect to PostgreSQL
        if command -v psql >/dev/null 2>&1; then
            if PGPASSWORD=nova_password psql -h localhost -U nova_admin -d nova_universe -c "SELECT 1;" >/dev/null 2>&1; then
                log_success "PostgreSQL connection successful"
            else
                log_warning "PostgreSQL connection failed"
            fi
        fi
    fi
    
    echo ""
}

# Setup completion message
show_completion() {
    log_header "🎉 Setup Complete!"
    echo "=================="
    echo ""
    log_success "Nova Universe is now running!"
    echo ""
    echo "Next steps:"
    echo "1. Visit http://localhost:5173 to access the unified interface"
    echo "2. Run the setup wizard at http://localhost:5173/setup"
    echo "3. Configure your organization and admin user"
    echo ""
    echo "Useful commands:"
    echo "• View logs:       docker-compose logs -f"
    echo "• Stop services:   docker-compose down"
    echo "• Start full:      docker-compose --profile full up -d"
    echo "• Start minimal:   docker-compose up -d postgres mongodb redis"
    echo ""
    log_info "For more help, see: docs/quickstart.md"
    echo ""
}

# Main setup function
main() {
    clear
    log_header "🌟 Nova Universe Setup"
    echo "======================"
    echo "Enterprise Help Desk Platform"
    echo ""
    
    check_requirements
    install_dependencies
    setup_environment
    start_database
    setup_database_schema
    start_dev_servers
    run_health_check
    show_completion
}

# Handle script arguments
case "${1:-}" in
    "--help"|"-h"|"help")
        echo "Nova Universe Setup Script"
        echo ""
        echo "Usage: $0 [option]"
        echo ""
        echo "Options:"
        echo "  --help, -h        Show this help message"
        echo "  --minimal         Start only core services (postgres, mongodb, redis)"
        echo "  --full            Start all services including monitoring tools"
        echo "  --no-docker       Setup without Docker"
        echo ""
        echo "Examples:"
        echo "  $0                Complete setup with core services"
        echo "  $0 --full         Complete setup with all services"
        echo "  $0 --minimal      Minimal setup (core services only)"
        echo "  $0 --no-docker    Setup without Docker"
        ;;
    "--minimal")
        log_info "Running minimal setup (core services only)"
        check_requirements
        install_dependencies
        setup_environment
        start_database
        setup_database_schema
        start_dev_servers
        show_completion
        ;;
    "--full")
        log_info "Running full setup (all services)"
        check_requirements
        install_dependencies
        setup_environment
        start_database
        start_optional_services
        setup_database_schema
        start_dev_servers
        run_health_check
        show_completion
        ;;
    "--no-docker")
        log_info "Running setup without Docker"
        HAS_DOCKER=false
        main
        ;;
    *)
        main
        ;;
esac
