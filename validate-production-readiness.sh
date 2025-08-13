#!/usr/bin/env bash
set -euo pipefail

# Nova Universe - Production Readiness Validation Script
# Validates that the system is ready for production deployment

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
log_error() { echo -e "${RED}❌ $1${NC}"; }
log_header() { echo -e "${PURPLE}$1${NC}"; }

# Validation results
CHECKS_PASSED=0
CHECKS_FAILED=0
WARNINGS=0

check() {
    local description="$1"
    local command="$2"
    local required="${3:-true}"
    
    echo -n "Checking $description... "
    
    if eval "$command" >/dev/null 2>&1; then
        echo -e "${GREEN}✅${NC}"
        ((CHECKS_PASSED++))
        return 0
    else
        if [ "$required" = "true" ]; then
            echo -e "${RED}❌${NC}"
            ((CHECKS_FAILED++))
            return 1
        else
            echo -e "${YELLOW}⚠️${NC}"
            ((WARNINGS++))
            return 0
        fi
    fi
}

# System requirements
validate_system() {
    log_header "🔍 System Requirements"
    echo "======================"
    
    check "Node.js 18+" "node -v | grep -E 'v1[89]|v[2-9][0-9]'" true
    check "Docker installed" "command -v docker" true
    check "Docker Compose installed" "command -v docker-compose || docker compose version" true
    check "Git installed" "command -v git" true
    check "Curl installed" "command -v curl" true
    
    # Check Docker daemon
    check "Docker daemon running" "docker ps" true
    
    # Check available ports
    check "Port 3000 available" "! netstat -tuln 2>/dev/null | grep -q ':3000'" false
    check "Port 3001 available" "! netstat -tuln 2>/dev/null | grep -q ':3001'" false
    check "Port 3002 available" "! netstat -tuln 2>/dev/null | grep -q ':3002'" false
    check "Port 8081 available" "! netstat -tuln 2>/dev/null | grep -q ':8081'" false
    
    echo ""
}

# Project structure
validate_structure() {
    log_header "📁 Project Structure"
    echo "===================="
    
    check "Main directories exist" "[ -d apps ] && [ -d scripts ] && [ -d docs ]" true
    check "API app exists" "[ -d apps/api ]" true
    check "Core app exists" "[ -d apps/core/nova-core ]" true
    check "Comms app exists" "[ -d apps/comms/nova-comms ]" true
    check "Beacon app exists" "[ -d apps/beacon/nova-beacon ]" true
    
    # Scripts
    check "Setup script exists" "[ -f setup.sh ]" true
    check "Teardown script exists" "[ -f teardown.sh ]" true
    check "Deploy script exists" "[ -f scripts/deploy-production.sh ]" true
    
    # Docker files
    check "Main docker-compose exists" "[ -f docker-compose.yml ]" true
    check "Production docker-compose exists" "[ -f docker-compose.prod.yml ]" true
    check "Monitoring docker-compose exists" "[ -f docker-compose.monitoring.yml ]" true
    
    echo ""
}

# CLI functionality
validate_cli() {
    log_header "🔧 CLI Functionality"
    echo "===================="
    
    check "CLI script exists" "[ -f apps/api/cli.js ]" true
    check "CLI is executable" "cd apps/api && node cli.js help" true
    
    # Check for enhanced CLI commands
    if [ -f apps/api/cli.js ]; then
        check "Health command available" "grep -q 'health' apps/api/cli.js" true
        check "Start command available" "grep -q 'start' apps/api/cli.js" true
        check "Status command available" "grep -q 'status' apps/api/cli.js" true
        check "Password change available" "grep -q 'passwd' apps/api/cli.js" true
    fi
    
    echo ""
}

# Configuration files
validate_configuration() {
    log_header "⚙️  Configuration"
    echo "================="
    
    # Package files
    check "Root package.json exists" "[ -f package.json ]" true
    check "pnpm workspace config exists" "[ -f pnpm-workspace.yaml ]" true
    
    # Environment templates
    check "Production env template exists" "[ -f .env.production.template ]" false
    check "Monitoring env exists" "[ -f .env.monitoring ]" false
    check "AI Fabric env exists" "[ -f .env.ai-fabric ]" false
    
    # API configuration
    check "API package.json exists" "[ -f apps/api/package.json ]" true
    check "API env example exists" "[ -f apps/api/.env.example ]" false
    
    # Core configuration
    check "Core package.json exists" "[ -f apps/core/nova-core/package.json ]" true
    
    echo ""
}

# Dependencies
validate_dependencies() {
    log_header "📦 Dependencies"
    echo "==============="
    
    check "Root node_modules exists" "[ -d node_modules ]" false
    check "API dependencies installed" "[ -d apps/api/node_modules ] || [ -f pnpm-lock.yaml ]" false
    check "Core dependencies installed" "[ -d apps/core/nova-core/node_modules ] || [ -f pnpm-lock.yaml ]" false
    
    # Check for key packages
    if [ -f apps/api/package.json ]; then
        check "Express dependency" "grep -q 'express' apps/api/package.json" true
        check "PostgreSQL dependency" "grep -q 'pg' apps/api/package.json" true
        check "JWT dependency" "grep -q 'jsonwebtoken' apps/api/package.json" true
    fi
    
    echo ""
}

# API routes and setup
validate_api() {
    log_header "🔌 API Routes"
    echo "============="
    
    check "Main API index exists" "[ -f apps/api/index.js ]" true
    check "Setup routes exist" "[ -f apps/api/routes/setup.js ]" true
    check "Setup router registered" "grep -q 'setupRouter' apps/api/index.js" true
    
    # Check for new routes
    if [ -f apps/api/routes/setup.js ]; then
        check "Sentinel test endpoint" "grep -q 'test-sentinel' apps/api/routes/setup.js" true
        check "GoAlert test endpoint" "grep -q 'test-goalert' apps/api/routes/setup.js" true
        check "Setup complete endpoint" "grep -q '/complete' apps/api/routes/setup.js" true
    fi
    
    echo ""
}

# Frontend components
validate_frontend() {
    log_header "🎨 Frontend Components"
    echo "======================"
    
    # Setup wizard
    check "Setup wizard exists" "[ -d apps/core/nova-core/src/components/setup-wizard ]" true
    check "ServicesStep exists" "[ -f apps/core/nova-core/src/components/setup-wizard/steps/ServicesStep.tsx ]" true
    check "SetupContext exists" "[ -f apps/core/nova-core/src/components/setup-wizard/SetupContext.tsx ]" true
    
    # Admin panels
    check "Sentinel admin panel exists" "[ -f apps/core/nova-core/src/components/monitoring/SentinelAdminPanel.tsx ]" true
    check "GoAlert admin panel exists" "[ -f apps/core/nova-core/src/components/goalert/GoAlertAdminPanel.tsx ]" true
    
    # Check for enhanced setup wizard
    if [ -f apps/core/nova-core/src/components/setup-wizard/steps/ServicesStep.tsx ]; then
        check "Sentinel config in ServicesStep" "grep -q 'sentinelEnabled' apps/core/nova-core/src/components/setup-wizard/steps/ServicesStep.tsx" true
        check "GoAlert config in ServicesStep" "grep -q 'goalertEnabled' apps/core/nova-core/src/components/setup-wizard/steps/ServicesStep.tsx" true
    fi
    
    echo ""
}

# Monitoring setup
validate_monitoring() {
    log_header "📊 Monitoring & Alerting"
    echo "========================"
    
    check "Monitoring directory exists" "[ -d monitoring ]" true
    check "Sentinel config exists" "[ -f monitoring/sentinel/docker-compose.yml ] || [ -f docker-compose.monitoring.yml ]" true
    check "GoAlert directory exists" "[ -d monitoring/goalert ]" false
    
    # Check for monitoring scripts
    check "Monitoring test script exists" "[ -f test-monitoring-stack.sh ]" false
    check "Validation script exists" "[ -f validate-implementation.sh ]" false
    
    echo ""
}

# Documentation
validate_documentation() {
    log_header "📚 Documentation"
    echo "================="
    
    check "README.md exists" "[ -f README.md ]" true
    check "Quickstart guide exists" "[ -f docs/quickstart.md ]" true
    check "Deployment guide exists" "[ -f docs/DEPLOYMENT_GUIDE.md ] || [ -f docs/SIMPLE_DEPLOYMENT.md ]" true
    
    # Check documentation quality
    if [ -f README.md ]; then
        check "README mentions setup.sh" "grep -q 'setup.sh' README.md" true
        check "README mentions CLI" "grep -q 'cli.js' README.md" true
    fi
    
    # Check for simplified docs
    check "Documentation cleanup done" "! [ -d docs/project_docs ]" false
    
    echo ""
}

# Scripts
validate_scripts() {
    log_header "� Scripts & Automation"
    echo "======================="
    
    check "Setup script exists" "[ -f setup.sh ]" true
    check "Teardown script exists" "[ -f teardown.sh ]" true
    check "Test environment script exists" "[ -f setup-test-env.sh ]" true
    check "Deploy script exists" "[ -f scripts/deploy-production.sh ]" true
    
    # Check script permissions
    check "Scripts are executable" "[ -x setup.sh ] && [ -x teardown.sh ] && [ -x setup-test-env.sh ]" true
    
    # Check enhanced teardown options
    if [ -f teardown.sh ]; then
        check "Teardown has restart option" "grep -q 'restart' teardown.sh" true
        check "Teardown has shutdown option" "grep -q 'shutdown' teardown.sh" true
    fi
    
    # Check test environment features
    if [ -f setup-test-env.sh ]; then
        check "Test env supports multiple environments" "grep -q 'integration\\|e2e' setup-test-env.sh" true
        check "Test env has port management" "grep -q 'BASE_PORT' setup-test-env.sh" true
        check "Test env has cleanup options" "grep -q 'clean-all' setup-test-env.sh" true
    fi
    
    echo ""
}

# Production readiness
validate_production() {
    log_header "🚀 Production Readiness"
    echo "======================="
    
    # Docker images
    check "Production Dockerfiles exist" "[ -f apps/api/Dockerfile.prod ] && [ -f apps/core/nova-core/Dockerfile.prod ]" false
    check "Development Dockerfiles exist" "[ -f apps/api/Dockerfile.dev ] && [ -f apps/core/nova-core/Dockerfile.dev ]" true
    
    # Security
    check "No hardcoded secrets in git" "! git log --oneline -n 50 | xargs git show | grep -E '(password|secret|key).*=.*[a-zA-Z0-9]{10}'" false
    
    echo ""
}

# Test environment capabilities
validate_test_environments() {
    log_header "🧪 Test Environment Capabilities"
    echo "================================"
    
    check "Test environment setup script exists" "[ -f setup-test-env.sh ]" true
    check "Test environment script is executable" "[ -x setup-test-env.sh ]" true
    
    # Check npm scripts for test environments
    if [ -f package.json ]; then
        check "npm test:env script exists" "grep -q 'test:env' package.json" true
        check "npm test:env:integration script exists" "grep -q 'test:env:integration' package.json" true
        check "npm test:env:e2e script exists" "grep -q 'test:env:e2e' package.json" true
    fi
    
    # Check for development Dockerfiles needed for test environments
    check "API dev Dockerfile exists" "[ -f apps/api/Dockerfile.dev ]" true
    check "Core dev Dockerfile exists" "[ -f apps/core/nova-core/Dockerfile.dev ]" true
    check "Beacon dev Dockerfile exists" "[ -f apps/beacon/nova-beacon/Dockerfile.dev ]" true
    check "Comms dev Dockerfile exists" "[ -f apps/comms/nova-comms/Dockerfile.dev ]" true
    
    # Check for test documentation
    check "Test environment documentation exists" "[ -f docs/TEST_ENVIRONMENTS.md ]" true
    
    echo ""
}

# Generate report
generate_report() {
    log_header "📋 Validation Report"
    echo "===================="
    echo ""
    
    local total=$((CHECKS_PASSED + CHECKS_FAILED))
    local percentage=$((CHECKS_PASSED * 100 / total))
    
    echo "Results:"
    log_success "$CHECKS_PASSED checks passed"
    
    if [ $CHECKS_FAILED -gt 0 ]; then
        log_error "$CHECKS_FAILED checks failed"
    fi
    
    if [ $WARNINGS -gt 0 ]; then
        log_warning "$WARNINGS warnings"
    fi
    
    echo ""
    echo "Overall Score: $percentage% ($CHECKS_PASSED/$total)"
    
    if [ $percentage -ge 90 ]; then
        log_success "🎉 Nova Universe is production ready!"
        echo ""
        echo "Next steps:"
        echo "1. Run: ./setup.sh"
        echo "2. Complete setup wizard at http://localhost:3001/setup"
        echo "3. For production: bash scripts/deploy-production.sh"
        exit 0
    elif [ $percentage -ge 75 ]; then
        log_warning "⚠️  Nova Universe is mostly ready, but some issues need attention"
        exit 1
    else
        log_error "❌ Nova Universe needs more work before production deployment"
        exit 1
    fi
}

# Main validation
main() {
    clear
    log_header "🔍 Nova Universe Production Readiness Check"
    echo "============================================="
    echo "Validating deployment readiness..."
    echo ""
    
    validate_system
    validate_structure
    validate_cli
    validate_configuration
    validate_dependencies
    validate_api
    validate_frontend
    validate_monitoring
    validate_documentation
    validate_scripts
    validate_production
    validate_test_environments
    
    generate_report
}

# Handle arguments
case "${1:-}" in
    "--help"|"-h"|"help")
        echo "Nova Universe Production Readiness Validation"
        echo ""
        echo "Usage: $0 [option]"
        echo ""
        echo "Options:"
        echo "  --help, -h        Show this help message"
        echo "  --quick           Quick validation (skip optional checks)"
        echo "  --system-only     Check system requirements only"
        echo ""
        ;;
    "--quick")
        log_info "Running quick validation..."
        validate_system
        validate_structure
        validate_cli
        generate_report
        ;;
    "--system-only")
        log_info "Checking system requirements only..."
        validate_system
        ;;
    *)
        main
        ;;
esac
