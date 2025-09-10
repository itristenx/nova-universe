# 🧪 Nova Universe UI Test Report

**Generated:** 2025-09-10T05:10:07.992Z  
**Pass Rate:** 0.0%

## Summary

| Metric | Count |
|--------|-------|
| Total Tests | 2 |
| Passed | 0 ✅ |
| Failed | 2 ❌ |

## Test Suites


### authentication

- **Duration:** 1.4s
- **Results:** 0 passed, 1 failed, 1 total


**Errors:**
- Command failed: npx playwright test "tests/auth/**/*.spec.ts" --workers=2 --retries=2 --timeout=30000 --reporter=json --output=test-results/authentication
npm warn Unknown env config "dir". This will stop working in the next major version of npm.
npm warn Unknown env config "verify-deps-before-run". This will stop working in the next major version of npm.
npm warn Unknown env config "_jsr-registry". This will stop working in the next major version of npm.



### api-health

- **Duration:** 1.2s
- **Results:** 0 passed, 1 failed, 1 total


**Errors:**
- Command failed: npx playwright test "tests/api/comprehensive-api-health.spec.ts" --workers=2 --retries=2 --timeout=30000 --reporter=json --output=test-results/api-health
npm warn Unknown env config "dir". This will stop working in the next major version of npm.
npm warn Unknown env config "verify-deps-before-run". This will stop working in the next major version of npm.
npm warn Unknown env config "_jsr-registry". This will stop working in the next major version of npm.




## Configuration

```json
{
  "baseURL": "http://localhost:3001",
  "apiURL": "http://localhost:3000",
  "databaseURL": "postgresql://nova_admin:nova_password@localhost:5432/nova_universe_test",
  "testUser": {
    "email": "testuser@nova.com",
    "password": "TestUser123!"
  },
  "testAdmin": {
    "email": "admin@nova.com",
    "password": "admin123"
  },
  "timeout": 30000,
  "retries": 2,
  "workers": 1
}
```