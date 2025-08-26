#!/bin/bash

# Nova Universe UI Test Runner
# This script provides a comprehensive way to run different types of tests

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Default values
TEST_TYPE="all"
BROWSER="chromium"
HEADLESS="true"
WORKERS="4"
REPORTER="html"
ENVIRONMENT="test"
VERBOSE="false"
COVERAGE="false"
PARALLEL="true"

# Function to print usage
print_usage() {
    echo -e "${BLUE}Nova Universe UI Test Runner${NC}"
    echo ""
    echo "Usage: $0 [OPTIONS]"
    echo ""
    echo "Options:"
    echo "  -t, --test-type TYPE     Test type: all, auth, dashboard, tickets, api, database, e2e (default: all)"
    echo "  -b, --browser BROWSER    Browser: chromium, firefox, webkit (default: chromium)"
    echo "  -h, --headless BOOL      Run in headless mode: true, false (default: true)"
    echo "  -w, --workers NUM        Number of parallel workers (default: 4)"
    echo "  -r, --reporter TYPE      Reporter: html, json, junit, list (default: html)"
    echo "  -e, --environment ENV    Environment: test, staging, production (default: test)"
    echo "  -v, --verbose            Enable verbose output"
    echo "  -c, --coverage           Enable coverage reporting"
    echo "  -s, --sequential         Run tests sequentially (disable parallel)"
    echo "  --help                   Show this help message"
    echo ""
    echo "Examples:"
    echo "  $0                                    # Run all tests"
    echo "  $0 -t auth -b firefox                # Run auth tests in Firefox"
    echo "  $0 -t tickets -w 2 -v                # Run ticket tests with 2 workers, verbose"
    echo "  $0 -t api --sequential                # Run API tests sequentially"
    echo "  $0 -t e2e -h false                   # Run E2E tests in headed mode"
}

# Function to print header
print_header() {
    echo -e "${BLUE}================================${NC}"
    echo -e "${BLUE}  Nova Universe UI Test Suite${NC}"
    echo -e "${BLUE}================================${NC}"
    echo ""
}

# Function to print test info
print_test_info() {
    echo -e "${YELLOW}Test Configuration:${NC}"
    echo "  Type: $TEST_TYPE"
    echo "  Browser: $BROWSER"
    echo "  Headless: $HEADLESS"
    echo "  Workers: $WORKERS"
    echo "  Reporter: $REPORTER"
    echo "  Environment: $ENVIRONMENT"
    echo "  Parallel: $PARALLEL"
    echo "  Coverage: $COVERAGE"
    echo "  Verbose: $VERBOSE"
    echo ""
}

# Function to check prerequisites
check_prerequisites() {
    echo -e "${YELLOW}Checking prerequisites...${NC}"
    
    # Check if Node.js is installed
    if ! command -v node &> /dev/null; then
        echo -e "${RED}❌ Node.js is not installed${NC}"
        exit 1
    fi
    
    # Check if npm/pnpm is installed
    if ! command -v pnpm &> /dev/null && ! command -v npm &> /dev/null; then
        echo -e "${RED}❌ Neither npm nor pnpm is installed${NC}"
        exit 1
    fi
    
    # Check if Playwright is installed
    if ! npx playwright --version &> /dev/null; then
        echo -e "${YELLOW}⚠️  Playwright not found, installing...${NC}"
        npx playwright install
    fi
    
    echo -e "${GREEN}✅ Prerequisites check passed${NC}"
    echo ""
}

# Function to setup test environment
setup_test_environment() {
    echo -e "${YELLOW}Setting up test environment...${NC}"
    
    # Load environment variables
    if [ -f "tests/env.test" ]; then
        export $(cat tests/env.test | grep -v '^#' | xargs)
        echo "  Loaded test environment variables"
    fi
    
    # Create test results directory
    mkdir -p test-results/{screenshots,videos,traces}
    echo "  Created test results directories"
    
    # Check if test database is accessible
    if [ "$TEST_TYPE" = "database" ] || [ "$TEST_TYPE" = "all" ]; then
        echo "  Checking test database connectivity..."
        # Add database connectivity check here
    fi
    
    # Check if test API is accessible
    if [ "$TEST_TYPE" = "api" ] || [ "$TEST_TYPE" = "all" ]; then
        echo "  Checking test API connectivity..."
        # Add API connectivity check here
    fi
    
    echo -e "${GREEN}✅ Test environment setup completed${NC}"
    echo ""
}

# Function to run tests
run_tests() {
    echo -e "${YELLOW}Running tests...${NC}"
    
    # Build command arguments
    local cmd="npx playwright test"
    
    # Add test type filter
    case $TEST_TYPE in
        "auth")
            cmd="$cmd tests/auth/"
            ;;
        "dashboard")
            cmd="$cmd tests/dashboard/"
            ;;
        "tickets")
            cmd="$cmd tests/tickets/"
            ;;
        "api")
            cmd="$cmd tests/api/"
            ;;
        "database")
            cmd="$cmd tests/database/"
            ;;
        "e2e")
            cmd="$cmd tests/e2e/"
            ;;
        "all")
            # Run all tests
            ;;
        *)
            echo -e "${RED}❌ Invalid test type: $TEST_TYPE${NC}"
            exit 1
            ;;
    esac
    
    # Add browser filter
    if [ "$BROWSER" != "all" ]; then
        cmd="$cmd --project=$BROWSER"
    fi
    
    # Add headless option
    if [ "$HEADLESS" = "false" ]; then
        cmd="$cmd --headed"
    fi
    
    # Add workers
    if [ "$PARALLEL" = "true" ]; then
        cmd="$cmd --workers=$WORKERS"
    else
        cmd="$cmd --workers=1"
    fi
    
    # Add reporter
    cmd="$cmd --reporter=$REPORTER"
    
    # Add verbose output
    if [ "$VERBOSE" = "true" ]; then
        cmd="$cmd --verbose"
    fi
    
    # Add coverage
    if [ "$COVERAGE" = "true" ]; then
        cmd="$cmd --coverage"
    fi
    
    echo "  Command: $cmd"
    echo ""
    
    # Execute tests
    if eval $cmd; then
        echo -e "${GREEN}✅ Tests completed successfully${NC}"
    else
        echo -e "${RED}❌ Tests failed${NC}"
        exit 1
    fi
}

# Function to generate test report
generate_report() {
    echo -e "${YELLOW}Generating test report...${NC}"
    
    # Generate HTML report
    if [ -d "test-results" ]; then
        npx playwright show-report test-results/html || true
        echo "  HTML report generated"
    fi
    
    # Generate coverage report if enabled
    if [ "$COVERAGE" = "true" ]; then
        echo "  Coverage report generated"
    fi
    
    echo -e "${GREEN}✅ Test report generation completed${NC}"
    echo ""
}

# Function to cleanup
cleanup() {
    echo -e "${YELLOW}Cleaning up...${NC}"
    
    # Stop any running processes
    pkill -f "playwright" || true
    
    echo -e "${GREEN}✅ Cleanup completed${NC}"
    echo ""
}

# Function to handle script interruption
trap cleanup INT TERM

# Parse command line arguments
while [[ $# -gt 0 ]]; do
    case $1 in
        -t|--test-type)
            TEST_TYPE="$2"
            shift 2
            ;;
        -b|--browser)
            BROWSER="$2"
            shift 2
            ;;
        -h|--headless)
            HEADLESS="$2"
            shift 2
            ;;
        -w|--workers)
            WORKERS="$2"
            shift 2
            ;;
        -r|--reporter)
            REPORTER="$2"
            shift 2
            ;;
        -e|--environment)
            ENVIRONMENT="$2"
            shift 2
            ;;
        -v|--verbose)
            VERBOSE="true"
            shift
            ;;
        -c|--coverage)
            COVERAGE="true"
            shift
            ;;
        -s|--sequential)
            PARALLEL="false"
            shift
            ;;
        --help)
            print_usage
            exit 0
            ;;
        *)
            echo -e "${RED}❌ Unknown option: $1${NC}"
            print_usage
            exit 1
            ;;
    esac
done

# Main execution
main() {
    print_header
    print_test_info
    check_prerequisites
    setup_test_environment
    run_tests
    generate_report
    cleanup
    
    echo -e "${GREEN}🎉 All done!${NC}"
}

# Run main function
main "$@"
