#!/bin/bash

# Nova Universe - Setup Script
# Automates the installation and configuration of the unified ITSM application

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
APP_NAME="Nova Universe"
APP_DIR="apps/nova-universe"
API_URL=${API_URL:-"http://localhost:3000"}
AUTH_URL=${AUTH_URL:-"http://localhost:3000/api/v1/helix"}
APP_URL=${APP_URL:-"http://localhost:3001"}

# Functions
log_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

log_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

log_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

check_prerequisites() {
    log_info "Checking prerequisites..."
    
    # Check Node.js version
    if ! command -v node &> /dev/null; then
        log_error "Node.js is not installed. Please install Node.js 18+ and try again."
        exit 1
    fi
    
    NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
    if [ "$NODE_VERSION" -lt 18 ]; then
        log_error "Node.js version 18+ is required. Current version: $(node -v)"
        exit 1
    fi
    
    # Check npm
    if ! command -v npm &> /dev/null; then
        log_error "npm is not installed. Please install npm and try again."
        exit 1
    fi
    
    log_success "Prerequisites check passed"
}

setup_environment() {
    log_info "Setting up environment configuration..."
    
    if [ ! -f ".env.local" ]; then
        if [ -f ".env.example" ]; then
            cp .env.example .env.local
            log_success "Created .env.local from .env.example"
        else
            log_warning ".env.example not found, creating basic .env.local"
            cat > .env.local << EOF
# Nova Universe Environment Configuration
NEXT_PUBLIC_APP_NAME="Nova Universe"
NEXT_PUBLIC_APP_VERSION="1.0.0"
NEXT_PUBLIC_APP_URL="$APP_URL"

# API Configuration
NEXT_PUBLIC_API_URL="$API_URL"
NEXT_PUBLIC_WEBSOCKET_URL="ws://localhost:3000"
NEXT_PUBLIC_AUTH_URL="$AUTH_URL"

# Feature Flags
NEXT_PUBLIC_MODULE_CORE_ENABLED="true"
NEXT_PUBLIC_MODULE_PULSE_ENABLED="true"
NEXT_PUBLIC_MODULE_ORBIT_ENABLED="true"
NEXT_PUBLIC_MODULE_BEACON_ENABLED="true"
NEXT_PUBLIC_MODULE_LORE_ENABLED="true"
NEXT_PUBLIC_MODULE_SYNTH_ENABLED="true"

# PWA Configuration
NEXT_PUBLIC_PWA_ENABLED="true"
NEXT_PUBLIC_PWA_NAME="Nova Universe"
NEXT_PUBLIC_PWA_SHORT_NAME="Nova"

# Development
NODE_ENV="development"
NEXT_PUBLIC_DEBUG_MODE="true"
EOF
        fi
    else
        log_info ".env.local already exists, skipping..."
    fi
}

install_dependencies() {
    log_info "Installing dependencies..."
    
    if [ -f "package-lock.json" ]; then
        npm ci
    else
        npm install
    fi
    
    log_success "Dependencies installed successfully"
}

setup_git_hooks() {
    log_info "Setting up Git hooks..."
    
    if [ -d ".git" ]; then
        # Create pre-commit hook
        cat > .git/hooks/pre-commit << 'EOF'
#!/bin/sh
# Nova Universe pre-commit hook

echo "Running pre-commit checks..."

# Run linting
npm run lint
if [ $? -ne 0 ]; then
    echo "ESLint failed. Please fix the errors before committing."
    exit 1
fi

# Run type checking
npm run type-check
if [ $? -ne 0 ]; then
    echo "TypeScript type checking failed. Please fix the errors before committing."
    exit 1
fi

echo "Pre-commit checks passed!"
EOF
        
        chmod +x .git/hooks/pre-commit
        log_success "Git hooks set up successfully"
    else
        log_warning "Not a Git repository, skipping Git hooks setup"
    fi
}

build_application() {
    log_info "Building application for production..."
    
    npm run build
    
    if [ $? -eq 0 ]; then
        log_success "Application built successfully"
    else
        log_error "Build failed. Please check the errors above."
        exit 1
    fi
}

run_tests() {
    log_info "Running tests..."
    
    if npm run test 2>/dev/null; then
        log_success "All tests passed"
    else
        log_warning "Tests failed or no tests found. Consider adding tests for production readiness."
    fi
}

display_info() {
    echo ""
    echo -e "${GREEN}🎉 ${APP_NAME} setup completed successfully!${NC}"
    echo ""
    echo -e "${BLUE}📋 Next steps:${NC}"
    echo "1. Review and update the .env.local file with your specific configuration"
    echo "2. Ensure the Nova Platform API server is running at: $API_URL"
    echo "3. Start the development server: npm run dev"
    echo "4. Open your browser to: $APP_URL"
    echo ""
    echo -e "${BLUE}📚 Available commands:${NC}"
    echo "  npm run dev          - Start development server"
    echo "  npm run build        - Build for production"
    echo "  npm run start        - Start production server"
    echo "  npm run lint         - Run ESLint"
    echo "  npm run type-check   - Run TypeScript checking"
    echo "  npm run test         - Run tests"
    echo ""
    echo -e "${BLUE}🔗 Useful links:${NC}"
    echo "  Application: $APP_URL"
    echo "  API Server: $API_URL"
    echo "  Documentation: ./README.md"
    echo ""
}

# Main execution
main() {
    echo -e "${GREEN}"
    echo "╔══════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════╗"
    echo "║                                                                                                                                                                                                              ║"
    echo "║  ███╗   ██╗ ██████╗ ██╗   ██╗ █████╗     ██╗   ██╗███╗   ██╗██╗██╗   ██╗███████╗██████╗ ███████╗███████╗                                                                                                   ║"
    echo "║  ████╗  ██║██╔═══██╗██║   ██║██╔══██╗    ██║   ██║████╗  ██║██║██║   ██║██╔════╝██╔══██╗██╔════╝██╔════╝                                                                                                   ║"
    echo "║  ██╔██╗ ██║██║   ██║██║   ██║███████║    ██║   ██║██╔██╗ ██║██║██║   ██║█████╗  ██████╔╝███████╗█████╗                                                                                                     ║"
    echo "║  ██║╚██╗██║██║   ██║╚██╗ ██╔╝██╔══██║    ██║   ██║██║╚██╗██║██║╚██╗ ██╔╝██╔══╝  ██╔══██╗╚════██║██╔══╝                                                                                                     ║"
    echo "║  ██║ ╚████║╚██████╔╝ ╚████╔╝ ██║  ██║    ╚██████╔╝██║ ╚████║██║ ╚████╔╝ ███████╗██║  ██║███████║███████╗                                                                                                   ║"
    echo "║  ╚═╝  ╚═══╝ ╚═════╝   ╚═══╝  ╚═╝  ╚═╝     ╚═════╝ ╚═╝  ╚═══╝╚═╝  ╚═══╝  ╚══════╝╚═╝  ╚═╝╚══════╝╚══════╝                                                                                                   ║"
    echo "║                                                                                                                                                                                                              ║"
    echo "║                                                                   Enterprise ITSM Platform                                                                                                                   ║"
    echo "║                                                                                                                                                                                                              ║"
    echo "╚══════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════╝"
    echo -e "${NC}"
    echo ""
    
    log_info "Starting $APP_NAME setup..."
    
    # Check if we're in the right directory
    if [ ! -f "package.json" ]; then
        log_error "package.json not found. Please run this script from the Nova Universe app directory."
        exit 1
    fi
    
    # Run setup steps
    check_prerequisites
    setup_environment
    install_dependencies
    setup_git_hooks
    
    # Ask user if they want to build and test
    echo ""
    read -p "$(echo -e ${YELLOW}Would you like to build the application and run tests? [y/N]: ${NC})" -n 1 -r
    echo ""
    
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        build_application
        run_tests
    fi
    
    display_info
}

# Check if script is being sourced or executed
if [[ "${BASH_SOURCE[0]}" == "${0}" ]]; then
    main "$@"
fi