# Nova Universe Test Environments

## Overview

Nova Universe provides comprehensive test environment management with isolated containers, dedicated ports, and full service replication for thorough testing.

## Quick Start

```bash
# Create default test environment
./setup-test-env.sh

# Create integration test environment
./setup-test-env.sh integration

# Create E2E test environment
./setup-test-env.sh e2e

# Create custom test environment
./setup-test-env.sh my-feature-branch
```

## Available Test Environments

### Default Test Environment

- **Name**: `test`
- **Ports**: 4001-4004 (Core, API, Beacon, Comms)
- **Database**: Port 4032
- **Use Case**: General development testing

### Integration Test Environment

- **Name**: `integration`
- **Ports**: 4101-4104
- **Database**: Port 4132
- **Use Case**: Integration testing between services

### End-to-End Test Environment

- **Name**: `e2e`
- **Ports**: 4201-4204
- **Database**: Port 4232
- **Use Case**: Full end-to-end testing scenarios

### Custom Environments

- **Name**: Any custom name
- **Ports**: Auto-assigned based on name hash
- **Use Case**: Feature development, parallel testing

## Test Environment Structure

Each test environment includes:

### Services

- **Core UI** - React frontend with hot reload
- **API Server** - Node.js backend with auto-restart
- **Beacon Service** - Real-time notification service
- **Communications** - Email/SMS service
- **PostgreSQL** - Isolated database
- **Redis** - Cache and session store
- **Sentinel** - Uptime monitoring (simplified)

### Test Data

- Pre-configured users (admin, user, agent)
- Sample tickets and data
- Environment-specific fixtures
- Isolated databases per environment

## Environment Management

### Creating Test Environments

```bash
# Basic setup
./setup-test-env.sh [environment-name]

# With npm shortcuts
npm run test:env                    # Default test environment
npm run test:env:integration        # Integration environment
npm run test:env:e2e               # E2E environment
```

### Managing Test Environments

Each environment gets its own management script:

```bash
# Start environment
./test-[env-name].sh start

# Stop environment
./test-[env-name].sh stop

# Restart environment
./test-[env-name].sh restart

# View logs
./test-[env-name].sh logs [service]

# Shell access
./test-[env-name].sh shell [service]

# Run tests
./test-[env-name].sh test

# Environment status
./test-[env-name].sh status

# Clean up
./test-[env-name].sh clean
```

### Global Management

```bash
# List all test environments
npm run test:env:list

# Clean all test environments
npm run test:env:clean
```

## Port Assignments

| Environment | Core                                         | API  | Beacon | Comms | DB   | Redis | Sentinel |
| ----------- | -------------------------------------------- | ---- | ------ | ----- | ---- | ----- | -------- |
| test        | 4001                                         | 4002 | 4003   | 4004  | 4032 | 4079  | 4081     |
| integration | 4101                                         | 4102 | 4103   | 4104  | 4132 | 4179  | 4181     |
| e2e         | 4201                                         | 4202 | 4203   | 4204  | 4232 | 4279  | 4281     |
| custom      | Auto-assigned based on environment name hash |

## Test Credentials

Each environment has isolated test users:

```json
{
  "admin": {
    "email": "admin@test-[env].nova",
    "password": "TestAdmin123!",
    "role": "admin"
  },
  "user": {
    "email": "user@test-[env].nova",
    "password": "TestUser123!",
    "role": "user"
  },
  "agent": {
    "email": "agent@test-[env].nova",
    "password": "TestAgent123!",
    "role": "agent"
  }
}
```

## Development Workflow

### 1. Feature Development

```bash
# Create feature-specific test environment
./setup-test-env.sh my-feature

# Access services
# Core UI: http://localhost:[assigned-port]
# API: http://localhost:[assigned-port+1]
```

### 2. Running Tests

```bash
# Unit tests
./test-my-feature.sh test

# Integration tests
./test-integration.sh test

# E2E tests
./test-e2e.sh e2e
```

### 3. Debugging

```bash
# View all service logs
./test-my-feature.sh logs

# View specific service logs
./test-my-feature.sh logs api

# Shell access for debugging
./test-my-feature.sh shell api
```

### 4. Cleanup

```bash
# Clean specific environment
./test-my-feature.sh clean

# Clean all environments
npm run test:env:clean
```

## Configuration Files

Each environment generates:

- `docker-compose.test-[env].yml` - Service definitions
- `.env.test.[env]` - Environment variables
- `test-[env].sh` - Management script
- `test/fixtures/[env]/` - Test data

## Integration with CI/CD

### GitHub Actions Example

```yaml
name: Test
on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    strategy:
      matrix:
        test-env: [integration, e2e]

    steps:
      - uses: actions/checkout@v3
      - name: Setup Test Environment
        run: ./setup-test-env.sh ${{ matrix.test-env }}
      - name: Run Tests
        run: ./test-${{ matrix.test-env }}.sh test
      - name: Cleanup
        if: always()
        run: ./test-${{ matrix.test-env }}.sh clean
```

## Troubleshooting

### Port Conflicts

If ports are in use, the setup will detect conflicts and suggest alternatives:

```bash
# Check port usage
netstat -tuln | grep :4001

# Use custom environment with auto-assigned ports
./setup-test-env.sh my-custom-env
```

### Service Issues

```bash
# Check service health
./test-[env].sh status

# Restart problematic service
docker-compose -f docker-compose.test-[env].yml restart [service]

# View service logs
./test-[env].sh logs [service]
```

### Database Issues

```bash
# Reset test database
./test-[env].sh clean
./setup-test-env.sh [env]

# Manual database access
docker exec -it nova-test-[env]-postgres psql -U nova_test -d nova_test
```

## Best Practices

### 1. Environment Isolation

- Use separate environments for different test types
- Never share test environments between features
- Clean up environments when done

### 2. Test Data Management

- Use environment-specific test data
- Reset test data between test runs
- Don't rely on specific database state

### 3. Resource Management

- Stop environments when not in use
- Use `--clean-all` periodically to free resources
- Monitor Docker resource usage

### 4. Parallel Testing

- Use different environments for parallel test execution
- Assign unique environment names for CI pipelines
- Coordinate port assignments in team settings

## Advanced Usage

### Custom Test Data

Create custom fixtures for your environment:

```bash
# Create custom fixtures
mkdir -p test/fixtures/my-env
echo '{"custom": "data"}' > test/fixtures/my-env/custom.json
```

### Environment Variables

Override default configuration:

```bash
# Edit environment file
vim .env.test.my-env

# Add custom variables
CUSTOM_FEATURE_ENABLED=true
DEBUG_MODE=true
```

### Service Configuration

Modify test compose file for specific needs:

```bash
# Edit service configuration
vim docker-compose.test-my-env.yml

# Add volumes, environment variables, or additional services
```

## Production vs Test Environments

| Aspect     | Production           | Test             |
| ---------- | -------------------- | ---------------- |
| Data       | Persistent           | Ephemeral        |
| Ports      | Standard (3000-3003) | Isolated (4000+) |
| SSL        | Required             | Optional         |
| Monitoring | Full stack           | Simplified       |
| Scaling    | Multi-instance       | Single instance  |
| Backup     | Automated            | None             |

---

**Next Steps**: Create your first test environment with `./setup-test-env.sh` and start testing!
