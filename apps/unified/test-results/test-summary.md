# 🧪 Nova Universe UI Test Report

**Generated:** 2025-09-10T12:33:07.900Z  
**Pass Rate:** 0.0%

## Summary

| Metric | Count |
|--------|-------|
| Total Tests | 2 |
| Passed | 0 ✅ |
| Failed | 2 ❌ |

## Test Suites


### authentication

- **Duration:** 2.5s
- **Results:** 0 passed, 1 failed, 1 total


**Errors:**
- Command failed: npx playwright test "tests/auth/**/*.spec.ts" --workers=2 --retries=2 --timeout=60000 --reporter=json --output=test-results/authentication
❌ Authentication failed for existing test users: {
  originalError: 'Request failed with status code 422',
  loginError: 'Request failed with status code 401'
}
❌ Global test setup failed: Error: Failed to setup test users: Registration failed (AxiosError: Request failed with status code 422), Login also failed (AxiosError: Request failed with status code 401)
    at setupTestUsers (file:///Users/tneibarger/nova-universe/apps/unified/tests/global-setup.ts:188:13)
    at processTicksAndRejections (node:internal/process/task_queues:105:5)
    at globalSetup (file:///Users/tneibarger/nova-universe/apps/unified/tests/global-setup.ts:53:39)
    at Object.setup (/Users/tneibarger/nova-universe/node_modules/.pnpm/playwright@1.54.2/node_modules/playwright/lib/runner/tasks.js:173:27)
    at taskLoop (/Users/tneibarger/nova-universe/node_modules/.pnpm/playwright@1.54.2/node_modules/playwright/lib/runner/taskRunner.js:62:11)
    at TaskRunner.runDeferCleanup (/Users/tneibarger/nova-universe/node_modules/.pnpm/playwright@1.54.2/node_modules/playwright/lib/runner/taskRunner.js:78:5)
    at TaskRunner.run (/Users/tneibarger/nova-universe/node_modules/.pnpm/playwright@1.54.2/node_modules/playwright/lib/runner/taskRunner.js:42:33)
    at runTasks (/Users/tneibarger/nova-universe/node_modules/.pnpm/playwright@1.54.2/node_modules/playwright/lib/runner/tasks.js:79:18)
    at Runner.runAllTests (/Users/tneibarger/nova-universe/node_modules/.pnpm/playwright@1.54.2/node_modules/playwright/lib/runner/runner.js:71:20)
    at runTests (/Users/tneibarger/nova-universe/node_modules/.pnpm/playwright@1.54.2/node_modules/playwright/lib/program.js:210:18)
    at i.<anonymous> (/Users/tneibarger/nova-universe/node_modules/.pnpm/playwright@1.54.2/node_modules/playwright/lib/program.js:65:7)



### dashboard

- **Duration:** 1.2s
- **Results:** 0 passed, 1 failed, 1 total


**Errors:**
- Command failed: npx playwright test "tests/dashboard/**/*.spec.ts" --workers=2 --retries=2 --timeout=60000 --reporter=json --output=test-results/dashboard
❌ Authentication failed for existing test users: {
  originalError: 'Request failed with status code 409',
  loginError: 'Request failed with status code 401'
}
❌ Global test setup failed: Error: Failed to setup test users: Registration failed (AxiosError: Request failed with status code 409), Login also failed (AxiosError: Request failed with status code 401)
    at setupTestUsers (file:///Users/tneibarger/nova-universe/apps/unified/tests/global-setup.ts:188:13)
    at processTicksAndRejections (node:internal/process/task_queues:105:5)
    at globalSetup (file:///Users/tneibarger/nova-universe/apps/unified/tests/global-setup.ts:53:39)
    at Object.setup (/Users/tneibarger/nova-universe/node_modules/.pnpm/playwright@1.54.2/node_modules/playwright/lib/runner/tasks.js:173:27)
    at taskLoop (/Users/tneibarger/nova-universe/node_modules/.pnpm/playwright@1.54.2/node_modules/playwright/lib/runner/taskRunner.js:62:11)
    at TaskRunner.runDeferCleanup (/Users/tneibarger/nova-universe/node_modules/.pnpm/playwright@1.54.2/node_modules/playwright/lib/runner/taskRunner.js:78:5)
    at TaskRunner.run (/Users/tneibarger/nova-universe/node_modules/.pnpm/playwright@1.54.2/node_modules/playwright/lib/runner/taskRunner.js:42:33)
    at runTasks (/Users/tneibarger/nova-universe/node_modules/.pnpm/playwright@1.54.2/node_modules/playwright/lib/runner/tasks.js:79:18)
    at Runner.runAllTests (/Users/tneibarger/nova-universe/node_modules/.pnpm/playwright@1.54.2/node_modules/playwright/lib/runner/runner.js:71:20)
    at runTests (/Users/tneibarger/nova-universe/node_modules/.pnpm/playwright@1.54.2/node_modules/playwright/lib/program.js:210:18)
    at i.<anonymous> (/Users/tneibarger/nova-universe/node_modules/.pnpm/playwright@1.54.2/node_modules/playwright/lib/program.js:65:7)




## Configuration

```json
{
  "baseURL": "http://localhost:8080",
  "apiURL": "http://localhost:8080",
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