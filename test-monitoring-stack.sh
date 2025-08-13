#!/bin/bash

# Nova Sentinel Monitoring Stack Test Script
# Tests the complete monitoring infrastructure deployment

set -e

echo "🚀 Nova Sentinel Monitoring Stack Test"
echo "======================================"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Test results
TESTS_PASSED=0
TESTS_FAILED=0

log_info() {
    echo -e "${BLUE}ℹ️  $1${NC}"
}

log_success() {
    echo -e "${GREEN}✅ $1${NC}"
    ((TESTS_PASSED++))
}

log_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

log_error() {
    echo -e "${RED}❌ $1${NC}"
    ((TESTS_FAILED++))
}

# Test 1: Check if Docker is running
test_docker() {
    log_info "Testing Docker availability..."
    if docker ps >/dev/null 2>&1; then
        log_success "Docker is running"
    else
        log_error "Docker is not running or not accessible"
        return 1
    fi
}

# Test 2: Check Nova Universe API availability
test_nova_api() {
    log_info "Testing Nova Universe API..."
    if curl -s -o /dev/null -w "%{http_code}" http://localhost:3000/api/health | grep -q "200"; then
        log_success "Nova API is responding"
    else
        log_error "Nova API is not responding on port 3000"
    fi
}

# Test 3: Check if monitoring database schema exists
test_database_schema() {
    log_info "Testing monitoring database schema..."
    
    # Check if we can connect to the database
    if which psql >/dev/null 2>&1; then
        if psql $DATABASE_URL -c "\dt monitoring_*" >/dev/null 2>&1; then
            log_success "Monitoring database schema exists"
        else
            log_error "Monitoring database schema not found"
        fi
    else
        log_warning "psql not available, skipping database schema test"
    fi
}

# Test 4: Start monitoring stack with Docker Compose
test_monitoring_stack() {
    log_info "Testing monitoring stack deployment..."
    
    if [ -f "docker-compose.monitoring.yml" ]; then
        log_info "Starting monitoring stack..."
        docker-compose -f docker-compose.monitoring.yml up -d
        
        # Wait for services to start
        sleep 30
        
        # Test Uptime Kuma
        if curl -s -o /dev/null -w "%{http_code}" http://localhost:3001 | grep -q "200\|302"; then
            log_success "Uptime Kuma is running on port 3001"
        else
            log_error "Uptime Kuma is not responding on port 3001"
        fi
        
        # Test Redis
        if docker exec nova-monitoring-redis redis-cli ping | grep -q "PONG"; then
            log_success "Redis is responding"
        else
            log_error "Redis is not responding"
        fi
        
        # Test Grafana
        if curl -s -o /dev/null -w "%{http_code}" http://localhost:3002 | grep -q "200\|302"; then
            log_success "Grafana is running on port 3002"
        else
            log_warning "Grafana is not responding on port 3002 (may still be starting)"
        fi
        
    else
        log_error "docker-compose.monitoring.yml not found"
    fi
}

# Test 5: Test monitoring API endpoints
test_monitoring_endpoints() {
    log_info "Testing monitoring API endpoints..."
    
    local base_url="http://localhost:3000/api/monitoring"
    
    # Test health endpoint
    if curl -s "$base_url/health" | grep -q "status"; then
        log_success "Monitoring health endpoint is working"
    else
        log_error "Monitoring health endpoint failed"
    fi
    
    # Test monitors endpoint
    if curl -s "$base_url/monitors" >/dev/null 2>&1; then
        log_success "Monitors endpoint is accessible"
    else
        log_error "Monitors endpoint failed"
    fi
    
    # Test public status endpoint
    if curl -s "$base_url/public/status" >/dev/null 2>&1; then
        log_success "Public status endpoint is accessible"
    else
        log_error "Public status endpoint failed"
    fi
}

# Test 6: Test frontend components compilation
test_frontend_compilation() {
    log_info "Testing frontend component compilation..."
    
    # Test Core app TypeScript compilation
    if [ -d "apps/core/nova-core" ]; then
        cd apps/core/nova-core
        if npm run type-check >/dev/null 2>&1 || npx tsc --noEmit >/dev/null 2>&1; then
            log_success "Core monitoring components compile successfully"
        else
            log_error "Core monitoring components have TypeScript errors"
        fi
        cd ../../..
    fi
    
    # Test Pulse app TypeScript compilation
    if [ -d "apps/pulse/nova-pulse" ]; then
        cd apps/pulse/nova-pulse
        if npm run type-check >/dev/null 2>&1 || npx tsc --noEmit >/dev/null 2>&1; then
            log_success "Pulse monitoring components compile successfully"
        else
            log_error "Pulse monitoring components have TypeScript errors"
        fi
        cd ../../..
    fi
    
    # Test Orbit app TypeScript compilation
    if [ -d "apps/orbit" ]; then
        cd apps/orbit
        if npm run type-check >/dev/null 2>&1 || npx tsc --noEmit >/dev/null 2>&1; then
            log_success "Orbit monitoring components compile successfully"
        else
            log_error "Orbit monitoring components have TypeScript errors"
        fi
        cd ../..
    fi
}

# Test 7: Test notification system
test_notifications() {
    log_info "Testing notification system..."
    
    # Check if notification service exists
    if [ -f "apps/api/lib/notifications.ts" ]; then
        log_success "Notification service exists"
    else
        log_error "Notification service not found"
    fi
    
    # Test notification endpoint
    if curl -s -X POST "http://localhost:3000/api/monitoring/notifications/test" \
        -H "Content-Type: application/json" \
        -d '{"type":"email","endpoint":"test@example.com"}' >/dev/null 2>&1; then
        log_success "Notification test endpoint is accessible"
    else
        log_warning "Notification test endpoint not responding (API may need to be running)"
    fi
}

# Test 8: Test Uptime Kuma integration
test_kuma_integration() {
    log_info "Testing Uptime Kuma integration..."
    
    # Check if Kuma client exists
    if [ -f "apps/api/lib/uptime-kuma.ts" ]; then
        log_success "Uptime Kuma client exists"
    else
        log_error "Uptime Kuma client not found"
    fi
    
    # Test Kuma webhook endpoint
    if curl -s -X POST "http://localhost:3000/api/monitoring/kuma/webhook" \
        -H "Content-Type: application/json" \
        -d '{"test":true}' >/dev/null 2>&1; then
        log_success "Kuma webhook endpoint is accessible"
    else
        log_warning "Kuma webhook endpoint not responding (API may need to be running)"
    fi
}

# Test 9: Check environment configuration
test_environment() {
    log_info "Testing environment configuration..."
    
    if [ -f ".env.monitoring" ]; then
        log_success "Monitoring environment file exists"
    else
        log_warning "Monitoring environment file not found (.env.monitoring)"
    fi
    
    # Check for required environment variables
    if [ -n "$DATABASE_URL" ]; then
        log_success "DATABASE_URL is set"
    else
        log_warning "DATABASE_URL not set"
    fi
}

# Test 10: Test monitoring dashboard UI components
test_ui_components() {
    log_info "Testing monitoring UI components..."
    
    local components=(
        "apps/core/nova-core/src/components/monitoring/MonitoringDashboard.tsx"
        "apps/core/nova-core/src/components/monitoring/NotificationSettings.tsx"
        "apps/pulse/nova-pulse/src/components/monitoring/TechnicianMonitoringDashboard.tsx"
        "apps/orbit/src/components/monitoring/PublicStatusPage.tsx"
    )
    
    for component in "${components[@]}"; do
        if [ -f "$component" ]; then
            log_success "$(basename "$component") exists"
        else
            log_error "$(basename "$component") not found"
        fi
    done
}

# Cleanup function
cleanup() {
    log_info "Cleaning up test environment..."
    if [ -f "docker-compose.monitoring.yml" ]; then
        docker-compose -f docker-compose.monitoring.yml down >/dev/null 2>&1 || true
    fi
}

# Main test execution
main() {
    echo "Starting Nova Sentinel monitoring stack tests..."
    echo ""
    
    # Run all tests
    test_docker
    test_environment
    test_database_schema
    test_ui_components
    test_frontend_compilation
    test_nova_api
    test_monitoring_stack
    test_monitoring_endpoints
    test_notifications
    test_kuma_integration
    
    echo ""
    echo "======================================"
    echo "Test Results Summary:"
    echo "======================================"
    echo -e "${GREEN}Tests Passed: $TESTS_PASSED${NC}"
    echo -e "${RED}Tests Failed: $TESTS_FAILED${NC}"
    
    if [ $TESTS_FAILED -eq 0 ]; then
        echo ""
        echo -e "${GREEN}🎉 All critical tests passed! Nova Sentinel is ready for deployment.${NC}"
        echo ""
        echo "Next steps:"
        echo "1. Configure environment variables in .env.monitoring"
        echo "2. Run: docker-compose -f docker-compose.monitoring.yml up -d"
        echo "3. Access Uptime Kuma at http://localhost:3001"
        echo "4. Access Nova monitoring at http://localhost:3000/monitoring"
        echo "5. Configure notification channels in the admin interface"
        exit 0
    else
        echo ""
        echo -e "${RED}⚠️  Some tests failed. Please review the errors above.${NC}"
        exit 1
    fi
}

# Set up trap for cleanup
trap cleanup EXIT

# Run main function
main
