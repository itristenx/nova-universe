#!/bin/bash

# Nova Universe - Comprehensive UI Testing Suite Execution Script
# This script provides various options for running the complete testing suite

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# Configuration
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$SCRIPT_DIR"
TEST_DIR="$PROJECT_ROOT/tests"
RESULTS_DIR="$PROJECT_ROOT/test-results"

# Default settings
WORKERS=4
RETRIES=2
TIMEOUT=180000
HEADED=false
DEBUG=false
GENERATE_REPORT=true

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

print_header() {
    echo -e "${PURPLE}================================${NC}"
    echo -e "${PURPLE}$1${NC}"
    echo -e "${PURPLE}================================${NC}"
}

# Function to check prerequisites
check_prerequisites() {
    print_status "Checking prerequisites..."
    
    # Check if Node.js is installed
    if ! command -v node &> /dev/null; then
        print_error "Node.js is not installed. Please install Node.js 18+ and try again."
        exit 1
    fi
    
    # Check Node.js version
    NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
    if [ "$NODE_VERSION" -lt 18 ]; then
        print_error "Node.js version 18+ is required. Current version: $(node -v)"
        exit 1
    fi
    
    # Check if npm is available
    if ! command -v npm &> /dev/null; then
        print_error "npm is not installed. Please install npm and try again."
        exit 1
    fi
    
    # Check if we're in the right directory
    if [ ! -f "$PROJECT_ROOT/package.json" ]; then
        print_error "package.json not found. Please run this script from the project root."
        exit 1
    fi
    
    print_success "Prerequisites check passed"
}

# Function to install dependencies
install_dependencies() {
    print_status "Installing dependencies..."
    
    cd "$PROJECT_ROOT"
    
    if [ ! -d "node_modules" ]; then
        npm install
        print_success "Dependencies installed"
    else
        print_status "Dependencies already installed"
    fi
    
    # Install Playwright browsers
    print_status "Installing Playwright browsers..."
    npm run test:ui:install-deps
    print_success "Playwright browsers installed"
}

# Function to check services
check_services() {
    print_status "Checking required services..."
    
    # Check if UI server is running
    if curl -s http://localhost:5173 > /dev/null 2>&1; then
        print_success "UI server is running on http://localhost:5173"
    else
        print_warning "UI server is not running on http://localhost:5173"
        print_status "You may need to start the UI server with: npm run dev"
    fi
    
    # Check if API server is running
    if curl -s http://localhost:3000/health > /dev/null 2>&1; then
        print_success "API server is running on http://localhost:3000"
    else
        print_warning "API server is not running on http://localhost:3000"
        print_status "You may need to start the API server"
    fi
    
    # Check if database is accessible
    if [ -n "$TEST_DATABASE_URL" ]; then
        print_status "Database URL configured: $TEST_DATABASE_URL"
    else
        print_warning "TEST_DATABASE_URL not set. Some tests may be skipped."
    fi
}

# Function to run specific test suite
run_test_suite() {
    local suite_name="$1"
    local suite_description="$2"
    
    print_header "Running $suite_name Tests"
    print_status "$suite_description"
    
    cd "$PROJECT_ROOT"
    
    case $suite_name in
        "authentication")
            npm run test:ui:auth
            ;;
        "database")
            npm run test:ui:database
            ;;
        "api-health")
            npm run test:ui:api-health
            ;;
        "dashboard")
            npm run test:ui:dashboard
            ;;
        "tickets")
            npm run test:ui:tickets
            ;;
        "workflows")
            npm run test:ui:workflows
            ;;
        "accessibility")
            npm run test:ui:accessibility-full
            ;;
        "performance")
            npm run test:ui:performance-full
            ;;
        "security")
            npm run test:ui:security-full
            ;;
        "mobile")
            npm run test:ui:mobile-full
            ;;
        *)
            print_error "Unknown test suite: $suite_name"
            return 1
            ;;
    esac
    
    print_success "$suite_name tests completed"
}

# Function to run comprehensive test suite
run_comprehensive_tests() {
    print_header "Running Comprehensive Test Suite"
    
    cd "$PROJECT_ROOT"
    
    # Build command with options
    local cmd="node ui-test-runner.cjs"
    cmd="$cmd --workers $WORKERS"
    cmd="$cmd --retries $RETRIES"
    cmd="$cmd --timeout $TIMEOUT"
    
    if [ "$HEADED" = true ]; then
        cmd="$cmd --headed"
    fi
    
    if [ "$DEBUG" = true ]; then
        cmd="$cmd --debug"
    fi
    
    if [ "$GENERATE_REPORT" = false ]; then
        cmd="$cmd --no-report"
    fi
    
    print_status "Executing: $cmd"
    eval "$cmd"
}

# Function to run smoke tests
run_smoke_tests() {
    print_header "Running Smoke Tests"
    print_status "Quick validation of core functionality"
    
    cd "$PROJECT_ROOT"
    npm run test:ui:smoke
}

# Function to run regression tests
run_regression_tests() {
    print_header "Running Regression Tests"
    print_status "Comprehensive validation of all core features"
    
    cd "$PROJECT_ROOT"
    npm run test:ui:regression
}

# Function to show test reports
show_reports() {
    print_header "Test Reports"
    
    if [ -d "$RESULTS_DIR" ]; then
        print_status "Test results available in: $RESULTS_DIR"
        
        # List available reports
        if [ -f "$RESULTS_DIR/comprehensive-report.html" ]; then
            print_success "HTML Report: $RESULTS_DIR/comprehensive-report.html"
        fi
        
        if [ -f "$RESULTS_DIR/comprehensive-report.json" ]; then
            print_success "JSON Report: $RESULTS_DIR/comprehensive-report.json"
        fi
        
        if [ -f "$RESULTS_DIR/test-summary.md" ]; then
            print_success "Markdown Summary: $RESULTS_DIR/test-summary.md"
        fi
        
        # Open HTML report if available
        if [ -f "$RESULTS_DIR/comprehensive-report.html" ] && command -v open &> /dev/null; then
            print_status "Opening HTML report..."
            open "$RESULTS_DIR/comprehensive-report.html"
        fi
    else
        print_warning "No test results found. Run tests first."
    fi
}

# Function to clean up test results
cleanup_results() {
    print_status "Cleaning up test results..."
    
    if [ -d "$RESULTS_DIR" ]; then
        rm -rf "$RESULTS_DIR"
        print_success "Test results cleaned up"
    else
        print_status "No test results to clean up"
    fi
}

# Function to show help
show_help() {
    cat << EOF
Nova Universe - Comprehensive UI Testing Suite

Usage: $0 [OPTIONS] [COMMAND]

Commands:
    all                     Run all tests (comprehensive suite)
    smoke                   Run smoke tests (quick validation)
    regression              Run regression tests (core features)
    auth                    Run authentication tests
    database                Run database tests
    api                     Run API tests
    dashboard               Run dashboard tests
    tickets                 Run ticket management tests
    workflows               Run end-to-end workflow tests
    accessibility           Run accessibility tests
    performance             Run performance tests
    security                Run security tests
    mobile                  Run mobile tests
    reports                 Show test reports
    cleanup                 Clean up test results
    help                    Show this help message

Options:
    -w, --workers N         Number of parallel workers (default: 4)
    -r, --retries N         Number of retries for failed tests (default: 2)
    -t, --timeout N         Test timeout in milliseconds (default: 180000)
    -H, --headed            Run tests in headed mode (visible browser)
    -d, --debug            Run tests in debug mode
    -n, --no-report         Skip generating test reports
    -i, --install           Install dependencies before running tests
    -c, --check             Check prerequisites and services

Examples:
    $0 all                    # Run all tests
    $0 smoke                  # Run smoke tests
    $0 auth --headed         # Run auth tests with visible browser
    $0 performance --workers 2 # Run performance tests with 2 workers
    $0 --install all         # Install dependencies and run all tests

Environment Variables:
    TEST_BASE_URL           UI server URL (default: http://localhost:5173)
    TEST_API_URL            API server URL (default: http://localhost:3000)
    TEST_DATABASE_URL       Database connection URL
    TEST_USER_EMAIL         Test user email
    TEST_USER_PASSWORD      Test user password
    TEST_ADMIN_EMAIL        Test admin email
    TEST_ADMIN_PASSWORD     Test admin password

EOF
}

# Main execution
main() {
    local command=""
    local install_deps=false
    local check_services=false
    
    # Parse command line arguments
    while [[ $# -gt 0 ]]; do
        case $1 in
            all|smoke|regression|auth|database|api|dashboard|tickets|workflows|accessibility|performance|security|mobile|reports|cleanup|help)
                command="$1"
                shift
                ;;
            -w|--workers)
                WORKERS="$2"
                shift 2
                ;;
            -r|--retries)
                RETRIES="$2"
                shift 2
                ;;
            -t|--timeout)
                TIMEOUT="$2"
                shift 2
                ;;
            -H|--headed)
                HEADED=true
                shift
                ;;
            -d|--debug)
                DEBUG=true
                shift
                ;;
            -n|--no-report)
                GENERATE_REPORT=false
                shift
                ;;
            -i|--install)
                install_deps=true
                shift
                ;;
            -c|--check)
                check_services=true
                shift
                ;;
            *)
                print_error "Unknown option: $1"
                show_help
                exit 1
                ;;
        esac
    done
    
    # Check prerequisites
    check_prerequisites
    
    # Install dependencies if requested
    if [ "$install_deps" = true ]; then
        install_dependencies
    fi
    
    # Check services if requested
    if [ "$check_services" = true ]; then
        check_services
        exit 0
    fi
    
    # Execute command
    case $command in
        "all")
            run_comprehensive_tests
            ;;
        "smoke")
            run_smoke_tests
            ;;
        "regression")
            run_regression_tests
            ;;
        "auth")
            run_test_suite "authentication" "Authentication and authorization tests"
            ;;
        "database")
            run_test_suite "database" "Database connectivity and integration tests"
            ;;
        "api")
            run_test_suite "api-health" "API health and integration tests"
            ;;
        "dashboard")
            run_test_suite "dashboard" "Dashboard and navigation tests"
            ;;
        "tickets")
            run_test_suite "tickets" "Ticket management tests"
            ;;
        "workflows")
            run_test_suite "workflows" "End-to-end workflow tests"
            ;;
        "accessibility")
            run_test_suite "accessibility" "Accessibility compliance tests"
            ;;
        "performance")
            run_test_suite "performance" "Performance and load tests"
            ;;
        "security")
            run_test_suite "security" "Security testing"
            ;;
        "mobile")
            run_test_suite "mobile" "Mobile and responsive design tests"
            ;;
        "reports")
            show_reports
            ;;
        "cleanup")
            cleanup_results
            ;;
        "help"|"")
            show_help
            ;;
        *)
            print_error "Unknown command: $command"
            show_help
            exit 1
            ;;
    esac
    
    print_success "Test execution completed"
}

# Run main function with all arguments
main "$@"
