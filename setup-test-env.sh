#!/usr/bin/env bash
set -euo pipefail

# Nova Universe - Test Environment Setup Script
# Creates isolated test environments for development and testing

# Provide docker-compose compatibility shim for environments with only docker compose v2
if ! command -v docker-compose >/dev/null 2>&1; then
  docker-compose() {
    docker compose "$@"
  }
fi

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$SCRIPT_DIR"
cd "$PROJECT_ROOT"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
CYAN='\033[0;36m'
NC='\033[0m'

# Logging functions
log_info() { echo -e "${BLUE}ℹ️  $1${NC}"; }
log_success() { echo -e "${GREEN}✅ $1${NC}"; }
log_warning() { echo -e "${YELLOW}⚠️  $1${NC}"; }
log_error() { echo -e "${RED}❌ $1${NC}"; }
log_header() { echo -e "${PURPLE}$1${NC}"; }
log_step() { echo -e "${CYAN}🔧 $1${NC}"; }

# Test environment configuration
TEST_ENV_NAME="${1:-test}"
TEST_PREFIX="nova-test-${TEST_ENV_NAME}"
TEST_NETWORK="${TEST_PREFIX}-network"

# Port assignments for test environments
BASE_PORT=4000
case "$TEST_ENV_NAME" in
    "test"|"default")
        CORE_PORT=$((BASE_PORT + 1))     # 4001
        API_PORT=$((BASE_PORT + 2))      # 4002
        BEACON_PORT=$((BASE_PORT + 3))   # 4003
        COMMS_PORT=$((BASE_PORT + 4))    # 4004
        POSTGRES_PORT=$((BASE_PORT + 32)) # 4032
        REDIS_PORT=$((BASE_PORT + 79))   # 4079
        SENTINEL_PORT=$((BASE_PORT + 81)) # 4081
        ;;
    "integration")
        CORE_PORT=$((BASE_PORT + 101))   # 4101
        API_PORT=$((BASE_PORT + 102))    # 4102
        BEACON_PORT=$((BASE_PORT + 103)) # 4103
        COMMS_PORT=$((BASE_PORT + 104))  # 4104
        POSTGRES_PORT=$((BASE_PORT + 132)) # 4132
        REDIS_PORT=$((BASE_PORT + 179))  # 4179
        SENTINEL_PORT=$((BASE_PORT + 181)) # 4181
        ;;
    "e2e")
        CORE_PORT=$((BASE_PORT + 201))   # 4201
        API_PORT=$((BASE_PORT + 202))    # 4202
        BEACON_PORT=$((BASE_PORT + 203)) # 4203
        COMMS_PORT=$((BASE_PORT + 204))  # 4204
        POSTGRES_PORT=$((BASE_PORT + 232)) # 4232
        REDIS_PORT=$((BASE_PORT + 279))  # 4279
        SENTINEL_PORT=$((BASE_PORT + 281)) # 4281
        ;;
    *)
        # Custom environment - use name hash for consistent port assignment
        HASH=$(echo "$TEST_ENV_NAME" | shasum | cut -c1-2)
        OFFSET=$((0x$HASH % 50 + 300))   # 300-349 range
        CORE_PORT=$((BASE_PORT + OFFSET + 1))
        API_PORT=$((BASE_PORT + OFFSET + 2))
        BEACON_PORT=$((BASE_PORT + OFFSET + 3))
        COMMS_PORT=$((BASE_PORT + OFFSET + 4))
        POSTGRES_PORT=$((BASE_PORT + OFFSET + 32))
        REDIS_PORT=$((BASE_PORT + OFFSET + 79))
        SENTINEL_PORT=$((BASE_PORT + OFFSET + 81))
        ;;
esac

# Check if environment already exists
check_existing_env() {
    if docker network ls | grep -q "$TEST_NETWORK"; then
        log_warning "Test environment '$TEST_ENV_NAME' already exists"
        read -p "Rebuild it? (y/N): " rebuild
        if [[ $rebuild =~ ^[Yy]$ ]]; then
            cleanup_test_env
        else
            log_info "Using existing environment"
            show_test_env_info
            exit 0
        fi
    fi
}

# Cleanup existing test environment
cleanup_test_env() {
    log_step "Cleaning up existing test environment..."
    
    # Stop containers
    docker ps -a --filter "name=${TEST_PREFIX}" -q | xargs -r docker stop
    docker ps -a --filter "name=${TEST_PREFIX}" -q | xargs -r docker rm
    
    # Remove volumes
    docker volume ls -q --filter "name=${TEST_PREFIX}" | xargs -r docker volume rm
    
    # Remove network
    docker network ls --filter "name=${TEST_NETWORK}" -q | xargs -r docker network rm
    
    log_success "Cleanup complete"
}

# Create test environment network
create_test_network() {
    log_step "Creating test network: $TEST_NETWORK"
    docker network create "$TEST_NETWORK" --driver bridge
    log_success "Test network created"
}

# Generate test environment docker-compose
generate_test_compose() {
    log_step "Generating test environment configuration..."
    
    cat > "docker-compose.test-${TEST_ENV_NAME}.yml" << EOF
services:
  # Database
  ${TEST_PREFIX}-postgres:
    image: postgres:15-alpine
    container_name: ${TEST_PREFIX}-postgres
    environment:
      POSTGRES_DB: nova_test
      POSTGRES_USER: nova_test
      POSTGRES_PASSWORD: test_password_${TEST_ENV_NAME}
      PGDATA: /var/lib/postgresql/data/pgdata
    ports:
      - "${POSTGRES_PORT}:5432"
    volumes:
      - ${TEST_PREFIX}-postgres-data:/var/lib/postgresql/data
    networks:
      - ${TEST_NETWORK}
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U nova_test -d nova_test"]
      interval: 10s
      timeout: 5s
      retries: 5

  # Redis Cache
  ${TEST_PREFIX}-redis:
    image: redis:7-alpine
    container_name: ${TEST_PREFIX}-redis
    ports:
      - "${REDIS_PORT}:6379"
    volumes:
      - ${TEST_PREFIX}-redis-data:/data
    networks:
      - ${TEST_NETWORK}
    healthcheck:
      test: ["CMD", "redis-cli", "ping"]
      interval: 10s
      timeout: 5s
      retries: 3

  # API Service
  ${TEST_PREFIX}-api:
    build:
      context: ./apps/api
      dockerfile: Dockerfile.dev
    container_name: ${TEST_PREFIX}-api
    env_file:
      - .env.test.${TEST_ENV_NAME}
    environment:
      NODE_ENV: test
      API_PORT: 3000
      DATABASE_URL: postgresql://nova_test:test_password_${TEST_ENV_NAME}@${TEST_PREFIX}-postgres:5432/nova_test
      REDIS_URL: redis://${TEST_PREFIX}-redis:6379
      JWT_SECRET: test_jwt_secret_${TEST_ENV_NAME}
      SESSION_SECRET: test_session_secret_${TEST_ENV_NAME}
      KIOSK_TOKEN: kiosk_token_${TEST_ENV_NAME}
      SCIM_TOKEN: scim_token_${TEST_ENV_NAME}
      AUTH_DB_PASSWORD: test_password_${TEST_ENV_NAME}
      # Core DB (used by databaseConfig)
      CORE_DB_HOST: ${TEST_PREFIX}-postgres
      CORE_DB_PORT: 5432
      CORE_DB_NAME: nova_test
      CORE_DB_USER: nova_test
      CORE_DB_PASSWORD: test_password_${TEST_ENV_NAME}
      # Use WASM Prisma engine to avoid native binary issues in CI
      PRISMA_CLIENT_ENGINE_TYPE: wasm
      # Fallback POSTGRES_* vars (used if CORE_* not provided)
      POSTGRES_HOST: ${TEST_PREFIX}-postgres
      POSTGRES_PORT: 5432
      POSTGRES_DB: nova_test
      POSTGRES_USER: nova_test
      POSTGRES_PASSWORD: test_password_${TEST_ENV_NAME}
      TEST_ENV: ${TEST_ENV_NAME}
      FORCE_LISTEN: "true"
    ports:
      - "${API_PORT}:3000"
    healthcheck:
      test: ["CMD-SHELL", "curl -fsS http://localhost:3000/health || exit 1"]
      interval: 5s
      timeout: 3s
      retries: 20
    depends_on:
      ${TEST_PREFIX}-postgres:
        condition: service_healthy
      ${TEST_PREFIX}-redis:
        condition: service_healthy
    networks:
      - ${TEST_NETWORK}
    volumes:
      - ./apps/api:/app
      - ./prisma/generated:/prisma/generated:ro
      - /app/node_modules
    command: ["npm", "start"]

  # Core UI Service
  ${TEST_PREFIX}-core:
    build:
      context: ./apps/core/nova-core
      dockerfile: Dockerfile.dev
    container_name: ${TEST_PREFIX}-core
    environment:
      NODE_ENV: test
      PORT: 3001
      REACT_APP_API_URL: http://localhost:${API_PORT}
      REACT_APP_TEST_ENV: ${TEST_ENV_NAME}
    ports:
      - "${CORE_PORT}:3001"
    networks:
      - ${TEST_NETWORK}
    volumes:
      - ./apps/core/nova-core:/app
      - /app/node_modules
    command: ["npm", "start"]

  # Beacon Service (placeholder HTTP server for UAT/integration)
  ${TEST_PREFIX}-beacon:
    image: node:20-alpine
    container_name: ${TEST_PREFIX}-beacon
    environment:
      NODE_ENV: test
      PORT: 3002
      API_URL: http://${TEST_PREFIX}-api:3000
      TEST_ENV: ${TEST_ENV_NAME}
    command: ["sh", "-c", "node -e 'require(\"http\").createServer((req,res)=>{res.end(\"Beacon placeholder\")}).listen(3002)' "]
    ports:
      - "${BEACON_PORT}:3002"
    depends_on:
      - ${TEST_PREFIX}-api
    networks:
      - ${TEST_NETWORK}

  # Communications Service
  ${TEST_PREFIX}-comms:
    build:
      context: ./apps/comms/nova-comms
      dockerfile: Dockerfile.dev
    container_name: ${TEST_PREFIX}-comms
    environment:
      NODE_ENV: test
      PORT: 3003
      API_URL: http://${TEST_PREFIX}-api:3000
      TEST_ENV: ${TEST_ENV_NAME}
    ports:
      - "${COMMS_PORT}:3003"
    depends_on:
      - ${TEST_PREFIX}-api
    networks:
      - ${TEST_NETWORK}
    volumes:
      - ./apps/comms/nova-comms:/app
      - /app/node_modules

  # Test Monitoring (Simplified Sentinel)
  ${TEST_PREFIX}-sentinel:
    image: louislam/uptime-kuma:1-alpine
    container_name: ${TEST_PREFIX}-sentinel
    ports:
      - "${SENTINEL_PORT}:3001"
    volumes:
      - ${TEST_PREFIX}-sentinel-data:/app/data
    networks:
      - ${TEST_NETWORK}
    environment:
      - NODE_ENV=test

volumes:
  ${TEST_PREFIX}-postgres-data:
  ${TEST_PREFIX}-redis-data:
  ${TEST_PREFIX}-sentinel-data:

networks:
  ${TEST_NETWORK}:
    external: true
EOF

    log_success "Test configuration generated"
}

# Create test data and fixtures
create_test_data() {
    log_step "Setting up test data and fixtures..."
    
    # Create test data directory
    mkdir -p "test/fixtures/${TEST_ENV_NAME}"
    
    # Generate test user data
    cat > "test/fixtures/${TEST_ENV_NAME}/users.json" << EOF
{
  "admin": {
    "email": "admin@test-${TEST_ENV_NAME}.nova",
    "password": "TestAdmin123!",
    "role": "admin",
    "firstName": "Test",
    "lastName": "Admin"
  },
  "user": {
    "email": "user@test-${TEST_ENV_NAME}.nova",
    "password": "TestUser123!",
    "role": "user",
    "firstName": "Test",
    "lastName": "User"
  },
  "agent": {
    "email": "agent@test-${TEST_ENV_NAME}.nova",
    "password": "TestAgent123!",
    "role": "agent",
    "firstName": "Test",
    "lastName": "Agent"
  }
}
EOF

    # Generate test tickets
    cat > "test/fixtures/${TEST_ENV_NAME}/tickets.json" << EOF
[
  {
    "title": "Test Ticket - High Priority",
    "description": "This is a high priority test ticket for environment ${TEST_ENV_NAME}",
    "priority": "high",
    "status": "open",
    "assignee": "agent@test-${TEST_ENV_NAME}.nova"
  },
  {
    "title": "Test Ticket - Medium Priority",
    "description": "This is a medium priority test ticket",
    "priority": "medium",
    "status": "in_progress",
    "assignee": "agent@test-${TEST_ENV_NAME}.nova"
  },
  {
    "title": "Test Ticket - Low Priority",
    "description": "This is a low priority test ticket",
    "priority": "low",
    "status": "resolved"
  }
]
EOF

    # Generate test environment variables
    cat > ".env.test.${TEST_ENV_NAME}" << EOF
# Test Environment Configuration for ${TEST_ENV_NAME}
NODE_ENV=test
TEST_ENV=${TEST_ENV_NAME}

# Database
DATABASE_URL=postgresql://nova_test:test_password_${TEST_ENV_NAME}@localhost:${POSTGRES_PORT}/nova_test

# Redis
REDIS_URL=redis://localhost:${REDIS_PORT}

# API Configuration
JWT_SECRET=test_jwt_secret_${TEST_ENV_NAME}
API_PORT=${API_PORT}

# Service Ports
CORE_PORT=${CORE_PORT}
BEACON_PORT=${BEACON_PORT}
COMMS_PORT=${COMMS_PORT}
SENTINEL_PORT=${SENTINEL_PORT}

# URLs
API_URL=http://localhost:${API_PORT}
CORE_URL=http://localhost:${CORE_PORT}
BEACON_URL=http://localhost:${BEACON_PORT}
COMMS_URL=http://localhost:${COMMS_PORT}
SENTINEL_URL=http://localhost:${SENTINEL_PORT}

# Test Configuration
TEST_TIMEOUT=30000
TEST_PARALLEL=false
TEST_VERBOSE=true
EOF

    log_success "Test data created"
}

# Start test environment
start_test_env() {
    log_step "Starting test environment: $TEST_ENV_NAME"
    
    docker-compose -f "docker-compose.test-${TEST_ENV_NAME}.yml" up -d
    
    log_info "Waiting for services to be ready..."
    sleep 10
    
    # Wait for health checks
    local max_attempts=30
    local attempt=1
    
    while [ $attempt -le $max_attempts ]; do
        if docker-compose -f "docker-compose.test-${TEST_ENV_NAME}.yml" ps | grep -q "healthy"; then
            break
        fi
        
        log_info "Waiting for services... (attempt $attempt/$max_attempts)"
        sleep 5
        ((attempt++))
    done
    
    if [ $attempt -gt $max_attempts ]; then
        log_error "Services failed to start within timeout"
        return 1
    fi
    
    log_success "Test environment started successfully"
}

# Run database migrations and seed data
setup_test_database() {
    log_step "Setting up test database..."
    
    # Wait for database to be ready
    sleep 5
    
    # Run migrations (adjust path as needed)
    if [ -f "apps/api/scripts/migrate-test.js" ]; then
        docker exec "${TEST_PREFIX}-api" npm run migrate:test
    else
        log_warning "No test migration script found"
    fi
    
    # Seed test data
    if [ -f "test/fixtures/${TEST_ENV_NAME}/seed.js" ]; then
        docker exec "${TEST_PREFIX}-api" npm run seed:test
    else
        log_info "Creating basic test data..."
        # You can add database seeding commands here
    fi
    
    log_success "Test database setup complete"
}

# Generate test scripts
generate_test_scripts() {
    log_step "Generating test helper scripts..."
    
    # Create test runner script
    cat > "test-${TEST_ENV_NAME}.sh" << EOF
#!/usr/bin/env bash
# Test runner for ${TEST_ENV_NAME} environment

set -euo pipefail

TEST_ENV="${TEST_ENV_NAME}"
export TEST_ENV

case "\${1:-}" in
    "start")
        echo "Starting \$TEST_ENV test environment..."
        docker-compose -f docker-compose.test-\${TEST_ENV}.yml up -d
        ;;
    "stop")
        echo "Stopping \$TEST_ENV test environment..."
        docker-compose -f docker-compose.test-\${TEST_ENV}.yml down
        ;;
    "restart")
        echo "Restarting \$TEST_ENV test environment..."
        docker-compose -f docker-compose.test-\${TEST_ENV}.yml restart
        ;;
    "logs")
        docker-compose -f docker-compose.test-\${TEST_ENV}.yml logs -f "\${2:-}"
        ;;
    "shell")
        service="\${2:-api}"
        docker exec -it "${TEST_PREFIX}-\${service}" /bin/sh
        ;;
    "test")
        echo "Running tests in \$TEST_ENV environment..."
        docker exec "${TEST_PREFIX}-api" npm test
        ;;
    "e2e")
        echo "Running E2E tests in \$TEST_ENV environment..."
        docker exec "${TEST_PREFIX}-core" npm run test:e2e
        ;;
    "clean")
        echo "Cleaning \$TEST_ENV test environment..."
        docker-compose -f docker-compose.test-\${TEST_ENV}.yml down -v
        docker volume ls -q --filter "name=${TEST_PREFIX}" | xargs -r docker volume rm
        rm -f docker-compose.test-\${TEST_ENV}.yml
        rm -f .env.test.\${TEST_ENV}
        rm -f test-\${TEST_ENV}.sh
        ;;
    "status")
        echo "=== \$TEST_ENV Test Environment Status ==="
        docker-compose -f docker-compose.test-\${TEST_ENV}.yml ps
        echo ""
        echo "Service URLs:"
        echo "• Core UI:    http://localhost:${CORE_PORT}"
        echo "• API:       http://localhost:${API_PORT}"
        echo "• Beacon:    http://localhost:${BEACON_PORT}"
        echo "• Comms:     http://localhost:${COMMS_PORT}"
        echo "• Sentinel:  http://localhost:${SENTINEL_PORT}"
        echo "• Database:  localhost:${POSTGRES_PORT}"
        echo "• Redis:     localhost:${REDIS_PORT}"
        ;;
    *)
        echo "Test Environment Manager for ${TEST_ENV_NAME}"
        echo ""
        echo "Usage: \$0 [command]"
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
EOF

    chmod +x "test-${TEST_ENV_NAME}.sh"
    
    log_success "Test scripts generated"
}

# Show test environment information
show_test_env_info() {
    log_header "🎯 Test Environment Ready: $TEST_ENV_NAME"
    echo "========================================"
    echo ""
    log_success "Test environment '$TEST_ENV_NAME' is ready!"
    echo ""
    echo "Service URLs:"
    echo "• Core UI:    http://localhost:${CORE_PORT}"
    echo "• API:       http://localhost:${API_PORT}"
    echo "• Beacon:    http://localhost:${BEACON_PORT}"
    echo "• Comms:     http://localhost:${COMMS_PORT}"
    echo "• Sentinel:  http://localhost:${SENTINEL_PORT}"
    echo ""
    echo "Database Access:"
    echo "• PostgreSQL: localhost:${POSTGRES_PORT}"
    echo "• Redis:      localhost:${REDIS_PORT}"
    echo ""
    echo "Test Management:"
    echo "• Quick access:   ./test-${TEST_ENV_NAME}.sh status"
    echo "• Run tests:      ./test-${TEST_ENV_NAME}.sh test"
    echo "• View logs:      ./test-${TEST_ENV_NAME}.sh logs"
    echo "• Stop env:       ./test-${TEST_ENV_NAME}.sh stop"
    echo "• Clean up:       ./test-${TEST_ENV_NAME}.sh clean"
    echo ""
    echo "Test Data:"
    echo "• Admin login:    admin@test-${TEST_ENV_NAME}.nova / TestAdmin123!"
    echo "• User login:     user@test-${TEST_ENV_NAME}.nova / TestUser123!"
    echo "• Fixtures:       test/fixtures/${TEST_ENV_NAME}/"
    echo ""
    log_info "Environment file: .env.test.${TEST_ENV_NAME}"
    echo ""
}

# Main setup function
main() {
    log_header "🧪 Nova Universe Test Environment Setup"
    echo "========================================"
    echo ""
    log_info "Setting up test environment: $TEST_ENV_NAME"
    echo ""
    
    check_existing_env
    create_test_network
    generate_test_compose
    create_test_data
    start_test_env
    setup_test_database
    generate_test_scripts
    show_test_env_info
}

# Handle arguments
case "${1:-}" in
    "--help"|"-h"|"help")
        echo "Nova Universe Test Environment Setup"
        echo ""
        echo "Usage: $0 [environment_name] [options]"
        echo ""
        echo "Environment Names:"
        echo "  test         Default test environment (ports 4001-4004)"
        echo "  integration  Integration testing (ports 4101-4104)"
        echo "  e2e          End-to-end testing (ports 4201-4204)"
        echo "  custom-name  Custom environment (auto-assigned ports)"
        echo ""
        echo "Options:"
        echo "  --help, -h   Show this help message"
        echo "  --list       List existing test environments"
        echo "  --clean-all  Remove all test environments"
        echo ""
        echo "Examples:"
        echo "  $0                    Create default test environment"
        echo "  $0 integration        Create integration test environment"
        echo "  $0 feature-branch     Create custom test environment"
        echo ""
        ;;
    "--list")
        echo "Existing test environments:"
        docker network ls --filter "name=nova-test" --format "table {{.Name}}\t{{.Driver}}\t{{.Scope}}"
        echo ""
        echo "Test compose files:"
        ls -1 docker-compose.test-*.yml 2>/dev/null || echo "No test environments found"
        ;;
    "--clean-all")
        log_warning "Removing ALL test environments..."
        read -p "Are you sure? (y/N): " confirm
        if [[ $confirm =~ ^[Yy]$ ]]; then
            # Stop all test containers
            docker ps -a --filter "name=nova-test" -q | xargs -r docker stop
            docker ps -a --filter "name=nova-test" -q | xargs -r docker rm
            
            # Remove test volumes
            docker volume ls -q --filter "name=nova-test" | xargs -r docker volume rm
            
            # Remove test networks
            docker network ls --filter "name=nova-test" -q | xargs -r docker network rm
            
            # Remove test files
            rm -f docker-compose.test-*.yml
            rm -f .env.test.*
            rm -f test-*.sh
            
            log_success "All test environments removed"
        fi
        ;;
    *)
        if [ -n "${1:-}" ] && [ "${1:0:2}" != "--" ]; then
            TEST_ENV_NAME="$1"
            shift
        fi
        main "$@"
        ;;
esac
