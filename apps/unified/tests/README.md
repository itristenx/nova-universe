# Nova Universe UI Testing Suite

A comprehensive testing suite for the Nova Universe ITSM application that ensures UI functionality, API integration, and database connectivity.

## 🚀 Overview

This testing suite provides end-to-end testing capabilities for the Nova Universe unified interface, covering:

- **Authentication & Authorization** - Login, registration, role-based access
- **Dashboard & Navigation** - Main application interface and navigation
- **Ticket Management** - Complete ticket lifecycle and workflows
- **API Integration** - Backend API connectivity and error handling
- **Database Integration** - Data persistence, retrieval, and consistency
- **Responsive Design** - Cross-device compatibility testing
- **Accessibility** - WCAG compliance verification
- **Performance** - Load time and efficiency testing

## 🏗️ Architecture

```
tests/
├── global-setup.ts          # Test environment initialization
├── global-teardown.ts       # Test cleanup and data removal
├── utils/
│   └── test-helpers.ts      # Common testing utilities
├── auth/
│   └── authentication.spec.ts # Authentication system tests
├── dashboard/
│   └── dashboard.spec.ts    # Dashboard and navigation tests
├── tickets/
│   └── ticket-management.spec.ts # Ticket management tests
├── api/
│   └── api-integration.spec.ts # API integration tests
├── database/
│   └── database-integration.spec.ts # Database integration tests
├── e2e/                     # End-to-end workflow tests
└── env.test                 # Test environment configuration
```

## 🛠️ Prerequisites

Before running the tests, ensure you have:

- **Node.js** 18+ installed
- **pnpm** or **npm** package manager
- **Docker** and **Docker Compose** (for database services)
- **Playwright** browsers installed

## 📦 Installation

1. **Install dependencies:**
   ```bash
   cd apps/unified
   pnpm install
   ```

2. **Install Playwright browsers:**
   ```bash
   npx playwright install
   ```

3. **Setup test environment:**
   ```bash
   # Copy environment configuration
   cp tests/env.test .env.test
   
   # Edit environment variables as needed
   nano .env.test
   ```

## 🗄️ Database Setup

The testing suite requires a test database. You can use the existing Docker setup:

1. **Start test database services:**
   ```bash
   # From project root
   docker-compose up -d postgres mongodb
   ```

2. **Create test database:**
   ```bash
   # Connect to PostgreSQL
   docker exec -it nova-postgres psql -U nova_admin -d nova_universe
   
   # Create test database
   CREATE DATABASE nova_universe_test;
   ```

3. **Run database migrations:**
   ```bash
   # From project root
   pnpm prisma:generate:core
   pnpm prisma db push --schema prisma/core/schema.prisma
   ```

## 🚀 Running Tests

### Quick Start

Run all tests:
```bash
cd apps/unified
./scripts/run-tests.sh
```

### Test Runner Options

The test runner script provides comprehensive options:

```bash
./scripts/run-tests.sh [OPTIONS]

Options:
  -t, --test-type TYPE     Test type: all, auth, dashboard, tickets, api, database, e2e
  -b, --browser BROWSER    Browser: chromium, firefox, webkit
  -h, --headless BOOL      Run in headless mode: true, false
  -w, --workers NUM        Number of parallel workers
  -r, --reporter TYPE      Reporter: html, json, junit, list
  -e, --environment ENV    Environment: test, staging, production
  -v, --verbose            Enable verbose output
  -c, --coverage           Enable coverage reporting
  -s, --sequential         Run tests sequentially
  --help                   Show help message
```

### Examples

**Run authentication tests in Firefox:**
```bash
./scripts/run-tests.sh -t auth -b firefox
```

**Run ticket tests with 2 workers, verbose output:**
```bash
./scripts/run-tests.sh -t tickets -w 2 -v
```

**Run API tests sequentially:**
```bash
./scripts/run-tests.sh -t api --sequential
```

**Run E2E tests in headed mode:**
```bash
./scripts/run-tests.sh -t e2e -h false
```

### Direct Playwright Commands

You can also run tests directly with Playwright:

```bash
# Run all tests
npx playwright test

# Run specific test file
npx playwright test tests/auth/authentication.spec.ts

# Run tests in specific browser
npx playwright test --project=firefox

# Run tests with UI
npx playwright test --ui

# Run tests in headed mode
npx playwright test --headed

# Run tests with specific reporter
npx playwright test --reporter=html
```

## 🧪 Test Types

### 1. Authentication Tests (`tests/auth/`)

Tests user authentication, registration, and authorization:

- Login/logout flows
- User registration
- Password reset
- Role-based access control
- Session management
- Error handling

### 2. Dashboard Tests (`tests/dashboard/`)

Tests the main application interface:

- Dashboard layout and widgets
- Navigation sidebar
- Header and user menu
- Quick actions
- Responsive design
- Performance metrics

### 3. Ticket Management Tests (`tests/tickets/`)

Tests ticket lifecycle and workflows:

- Ticket creation and editing
- Status changes and assignments
- Comments and attachments
- Search and filtering
- Bulk operations
- Workflow automation

### 4. API Integration Tests (`tests/api/`)

Tests backend API connectivity:

- Authentication endpoints
- CRUD operations
- Error handling
- Rate limiting
- Real-time updates
- Performance testing

### 5. Database Integration Tests (`tests/database/`)

Tests data persistence and consistency:

- Data creation and retrieval
- Relationship management
- Validation constraints
- Performance with large datasets
- Data consistency checks

## 🔧 Configuration

### Environment Variables

Key configuration options in `tests/env.test`:

```bash
# API Configuration
TEST_API_URL=http://localhost:3000
TEST_API_TIMEOUT=10000

# Database Configuration
TEST_DATABASE_URL=postgresql://nova_admin:nova_password@localhost:5432/nova_universe_test

# Test User Credentials
TEST_USER_EMAIL=testuser@nova.com
TEST_USER_PASSWORD=TestUser123!

# Performance Thresholds
TEST_PERFORMANCE_THRESHOLD_LOAD_TIME=3000
TEST_PERFORMANCE_THRESHOLD_API_RESPONSE=2000
```

### Playwright Configuration

The `playwright.config.ts` file configures:

- Browser projects (Chrome, Firefox, Safari, Mobile)
- Test timeouts and retries
- Screenshot and video capture
- Global setup/teardown
- Web server configuration

## 📊 Test Reports

After running tests, reports are generated in `test-results/`:

- **HTML Report**: Interactive test results
- **Screenshots**: Failed test screenshots
- **Videos**: Test execution recordings
- **Traces**: Detailed execution traces

View the HTML report:
```bash
npx playwright show-report test-results/html
```

## 🐛 Debugging Tests

### Debug Mode

Run tests in debug mode:
```bash
npx playwright test --debug
```

### UI Mode

Run tests with Playwright UI:
```bash
npx playwright test --ui
```

### Verbose Output

Enable detailed logging:
```bash
./scripts/run-tests.sh -v
```

### Specific Test

Run a specific test:
```bash
npx playwright test -g "should login successfully"
```

## 🔄 Continuous Integration

### GitHub Actions

The testing suite is configured for CI/CD:

```yaml
# .github/workflows/ui-tests.yml
name: UI Tests
on: [push, pull_request]
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
      - run: pnpm install
      - run: npx playwright install --with-deps
      - run: npx playwright test
      - uses: actions/upload-artifact@v3
        with:
          name: playwright-report
          path: test-results/
```

### Local CI Simulation

Test CI locally:
```bash
# Install dependencies
pnpm install

# Install Playwright with system dependencies
npx playwright install --with-deps

# Run tests
npx playwright test
```

## 📱 Cross-Browser Testing

The suite tests across multiple browsers:

- **Chromium**: Primary browser for development
- **Firefox**: Cross-browser compatibility
- **WebKit**: Safari compatibility
- **Mobile**: Responsive design testing

Run cross-browser tests:
```bash
npx playwright test --project=firefox
npx playwright test --project=webkit
npx playwright test --project="Mobile Chrome"
```

## 🚨 Troubleshooting

### Common Issues

1. **Database Connection Failed**
   ```bash
   # Check Docker services
   docker-compose ps
   
   # Restart database
   docker-compose restart postgres
   ```

2. **API Connection Failed**
   ```bash
   # Check API service
   curl http://localhost:3000/health
   
   # Start API service
   cd apps/api && npm start
   ```

3. **Playwright Browsers Not Found**
   ```bash
   # Reinstall browsers
   npx playwright install
   ```

4. **Test Environment Variables**
   ```bash
   # Check environment file
   cat tests/env.test
   
   # Verify variables are loaded
   echo $TEST_API_URL
   ```

### Debug Commands

```bash
# Check test environment
./scripts/run-tests.sh --help

# Verify prerequisites
node --version
pnpm --version
npx playwright --version

# Check database connectivity
docker exec -it nova-postgres pg_isready -U nova_admin

# Check API health
curl -f http://localhost:3000/health
```

## 📈 Performance Testing

The suite includes performance benchmarks:

- Page load time thresholds
- API response time limits
- Large dataset handling
- Concurrent operation testing

Run performance tests:
```bash
./scripts/run-tests.sh -t performance -v
```

## 🔒 Security Testing

Security-focused test scenarios:

- Authentication bypass attempts
- SQL injection prevention
- XSS protection
- CSRF token validation
- Rate limiting enforcement

## 📱 Mobile Testing

Responsive design verification:

- Mobile viewport testing
- Touch interaction testing
- PWA functionality
- Offline capabilities

## 🎯 Best Practices

### Writing Tests

1. **Use descriptive test names**
2. **Follow AAA pattern** (Arrange, Act, Assert)
3. **Test one thing at a time**
4. **Use data-testid attributes**
5. **Handle async operations properly**

### Test Data Management

1. **Use unique test data**
2. **Clean up after tests**
3. **Isolate test environments**
4. **Use factories for test data**

### Error Handling

1. **Test error scenarios**
2. **Verify error messages**
3. **Test edge cases**
4. **Handle network failures**

## 🤝 Contributing

### Adding New Tests

1. **Create test file** in appropriate directory
2. **Follow naming convention**: `feature-name.spec.ts`
3. **Use existing test helpers** from `utils/test-helpers.ts`
4. **Add test data** to global setup if needed
5. **Update documentation** and examples

### Test Structure

```typescript
import { test, expect } from '@playwright/test';
import { testHelper } from '../utils/test-helpers';

test.describe('Feature Name', () => {
  test.beforeEach(async ({ page }) => {
    // Setup for each test
  });

  test('should perform expected behavior', async ({ page }) => {
    // Test implementation
  });
});
```

## 📚 Additional Resources

- [Playwright Documentation](https://playwright.dev/)
- [Testing Best Practices](https://playwright.dev/docs/best-practices)
- [API Testing Guide](https://playwright.dev/docs/api-testing)
- [Mobile Testing](https://playwright.dev/docs/mobile)
- [Performance Testing](https://playwright.dev/docs/performance)

## 📞 Support

For issues or questions:

1. **Check troubleshooting section** above
2. **Review test logs** in `test-results/`
3. **Check environment configuration**
4. **Verify service dependencies**
5. **Create issue** with detailed error information

---

**Happy Testing! 🎉**

The Nova Universe UI Testing Suite ensures your ITSM application is robust, reliable, and ready for production use.
