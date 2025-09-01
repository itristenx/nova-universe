#!/usr/bin/env bash
# Test runner for test environment

set -euo pipefail

TEST_ENV="test"
export TEST_ENV

case "${1:-}" in
    "start")
        echo "Starting $TEST_ENV test environment..."
        docker-compose -f docker-compose.test-${TEST_ENV}.yml up -d
        ;;
    "stop")
        echo "Stopping $TEST_ENV test environment..."
        docker-compose -f docker-compose.test-${TEST_ENV}.yml down
        ;;
    "restart")
        echo "Restarting $TEST_ENV test environment..."
        docker-compose -f docker-compose.test-${TEST_ENV}.yml restart
        ;;
    "logs")
        docker-compose -f docker-compose.test-${TEST_ENV}.yml logs -f "${2:-}"
        ;;
    "shell")
        service="${2:-api}"
        docker exec -it "nova-test-test-${service}" /bin/sh
        ;;
    "test")
        echo "Running tests in $TEST_ENV environment..."
        docker exec "nova-test-test-api" npm test
        ;;
    "e2e")
        echo "Running E2E tests in $TEST_ENV environment..."
        docker exec "nova-test-test-core" npm run test:e2e
        ;;
    "clean")
        echo "Cleaning $TEST_ENV test environment..."
        docker-compose -f docker-compose.test-${TEST_ENV}.yml down -v
        docker volume ls -q --filter "name=nova-test-test" | xargs -r docker volume rm
        rm -f docker-compose.test-${TEST_ENV}.yml
        rm -f .env.test.${TEST_ENV}
        rm -f test-${TEST_ENV}.sh
        ;;
    "status")
        echo "=== $TEST_ENV Test Environment Status ==="
        docker-compose -f docker-compose.test-${TEST_ENV}.yml ps
        echo ""
        echo "Service URLs:"
        echo "• Core UI:    http://localhost:4001"
        echo "• API:       http://localhost:4002"
        echo "• Beacon:    http://localhost:4003"
        echo "• Comms:     http://localhost:4004"
        echo "• Sentinel:  http://localhost:4081"
        echo "• Database:  localhost:4032"
        echo "• Redis:     localhost:4079"
        ;;
    *)
        echo "Test Environment Manager for test"
        echo ""
        echo "Usage: $0 [command]"
        echo ""
        echo "Commands:"
        echo "  start     Start test environment"
        echo "  stop      Stop test environment"
        echo "  restart   Restart test environment"
        echo "  logs      View logs (optional service name)"
        echo "  shell     Open shell in service (default: api)"
        echo "  test      Run unit tests"
        echo "  e2e       Run E2E tests"
        echo "  status    Show environment status"
        echo "  clean     Remove test environment"
        echo ""
        ;;
esac
