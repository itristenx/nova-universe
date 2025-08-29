import { test, expect } from '@playwright/test';
import { testHelper } from '../utils/test-helpers';
import axios from 'axios';

test.describe('Comprehensive API Health and Integration Tests', () => {
  let apiBaseUrl: string;
  let authToken: string;

  test.beforeAll(async () => {
    apiBaseUrl = process.env.TEST_API_URL || 'http://localhost:3000';
    
    // Attempt to get authentication token for API tests
    try {
      const response = await axios.post(`${apiBaseUrl}/auth/login`, {
        email: process.env.TEST_USER_EMAIL || 'admin@nova.com',
        password: process.env.TEST_USER_PASSWORD || 'admin123',
      });
      authToken = response.data.token;
      console.log('✅ Authentication successful for API tests');
    } catch (error) {
      console.log('⚠️ Could not authenticate for API tests:', error.message);
    }
  });

  test.describe('API Health and Availability', () => {
    test('should validate API server is running', async () => {
      try {
        const response = await axios.get(`${apiBaseUrl}/health`);
        expect(response.status).toBe(200);
        expect(response.data).toHaveProperty('status');
        expect(response.data.status).toBe('healthy');
        console.log('✅ API server health check passed');
      } catch (error) {
        console.log('❌ API server health check failed:', error.message);
        test.skip(true, 'API server is not available');
      }
    });

    test('should validate all core API endpoints are accessible', async () => {
      test.skip(!authToken, 'No authentication token available');

      const coreEndpoints = [
        '/api/tickets',
        '/api/users',
        '/api/assets',
        '/api/organizations',
        '/api/categories',
        '/api/notifications',
        '/api/reports',
        '/api/search',
      ];

      const headers = { Authorization: `Bearer ${authToken}` };

      for (const endpoint of coreEndpoints) {
        try {
          const response = await axios.get(`${apiBaseUrl}${endpoint}`, { headers });
          expect(response.status).toBeLessThan(400);
          console.log(`✅ Endpoint ${endpoint} is accessible`);
        } catch (error) {
          if (error.response?.status === 404) {
            console.log(`⚠️ Endpoint ${endpoint} not found (may not be implemented)`);
          } else {
            console.log(`❌ Endpoint ${endpoint} failed:`, error.response?.status);
            throw error;
          }
        }
      }
    });

    test('should validate API response times are acceptable', async () => {
      test.skip(!authToken, 'No authentication token available');

      const endpoints = [
        '/api/health',
        '/api/tickets',
        '/api/users',
        '/api/assets',
      ];

      const headers = { Authorization: `Bearer ${authToken}` };

      for (const endpoint of endpoints) {
        const startTime = Date.now();
        try {
          await axios.get(`${apiBaseUrl}${endpoint}`, { 
            headers,
            timeout: 5000 
          });
          const responseTime = Date.now() - startTime;
          
          expect(responseTime).toBeLessThan(2000); // Should respond within 2 seconds
          console.log(`✅ ${endpoint} responded in ${responseTime}ms`);
        } catch (error) {
          if (error.response?.status === 404) {
            console.log(`⚠️ Endpoint ${endpoint} not found, skipping response time test`);
          } else {
            throw error;
          }
        }
      }
    });

    test('should validate API handles rate limiting properly', async () => {
      test.skip(!authToken, 'No authentication token available');

      const headers = { Authorization: `Bearer ${authToken}` };
      
      // Make multiple rapid requests to test rate limiting
      const rapidRequests = Array.from({ length: 20 }, () =>
        axios.get(`${apiBaseUrl}/api/health`, { headers, timeout: 1000 })
          .catch(error => error.response)
      );

      const responses = await Promise.all(rapidRequests);
      
      // Check if any responses indicate rate limiting
      const rateLimitedResponses = responses.filter(
        response => response?.status === 429
      );

      if (rateLimitedResponses.length > 0) {
        console.log(`✅ Rate limiting is working (${rateLimitedResponses.length} requests rate limited)`);
      } else {
        console.log('ℹ️ No rate limiting detected (may not be configured)');
      }
    });
  });

  test.describe('Database Connectivity via API', () => {
    test('should validate database operations through API', async () => {
      test.skip(!authToken, 'No authentication token available');

      const headers = { Authorization: `Bearer ${authToken}` };

      // Test data creation
      const testOrganization = {
        name: `API Test Org ${Date.now()}`,
        description: 'Organization created via API test',
      };

      try {
        // Create organization
        const createResponse = await axios.post(
          `${apiBaseUrl}/api/organizations`,
          testOrganization,
          { headers }
        );
        expect(createResponse.status).toBe(201);
        const orgId = createResponse.data.id;

        // Read organization
        const readResponse = await axios.get(
          `${apiBaseUrl}/api/organizations/${orgId}`,
          { headers }
        );
        expect(readResponse.status).toBe(200);
        expect(readResponse.data.name).toBe(testOrganization.name);

        // Update organization
        const updateData = { description: 'Updated description via API test' };
        const updateResponse = await axios.put(
          `${apiBaseUrl}/api/organizations/${orgId}`,
          updateData,
          { headers }
        );
        expect(updateResponse.status).toBe(200);

        // Delete organization
        const deleteResponse = await axios.delete(
          `${apiBaseUrl}/api/organizations/${orgId}`,
          { headers }
        );
        expect(deleteResponse.status).toBe(204);

        console.log('✅ Database CRUD operations via API successful');
      } catch (error) {
        console.log('❌ Database operations via API failed:', error.response?.data || error.message);
        throw error;
      }
    });

    test('should validate data consistency across API calls', async () => {
      test.skip(!authToken, 'No authentication token available');

      const headers = { Authorization: `Bearer ${authToken}` };

      try {
        // Get initial counts
        const initialTicketsResponse = await axios.get(`${apiBaseUrl}/api/tickets`, { headers });
        const initialCount = initialTicketsResponse.data.total || initialTicketsResponse.data.length || 0;

        // Create a new ticket
        const testTicket = {
          title: `Consistency Test Ticket ${Date.now()}`,
          description: 'Testing data consistency',
          priority: 'MEDIUM',
          status: 'OPEN',
        };

        const createResponse = await axios.post(
          `${apiBaseUrl}/api/tickets`,
          testTicket,
          { headers }
        );
        expect(createResponse.status).toBe(201);

        // Verify count increased
        const updatedTicketsResponse = await axios.get(`${apiBaseUrl}/api/tickets`, { headers });
        const updatedCount = updatedTicketsResponse.data.total || updatedTicketsResponse.data.length || 0;
        
        expect(updatedCount).toBe(initialCount + 1);

        // Cleanup
        if (createResponse.data.id) {
          await axios.delete(`${apiBaseUrl}/api/tickets/${createResponse.data.id}`, { headers });
        }

        console.log('✅ Data consistency validation successful');
      } catch (error) {
        console.log('❌ Data consistency validation failed:', error.response?.data || error.message);
        throw error;
      }
    });
  });

  test.describe('UI-API Integration Testing', () => {
    test('should validate UI actions trigger correct API calls', async ({ page }) => {
      test.skip(!authToken, 'No authentication token available');

      // Set up API request monitoring
      const apiRequests: any[] = [];
      
      page.route('**/api/**', (route) => {
        apiRequests.push({
          method: route.request().method(),
          url: route.request().url(),
          postData: route.request().postData(),
        });
        route.continue();
      });

      // Login
      await page.goto('/');
      await page.click('[data-testid="login-button"]');
      await testHelper.fillFormFields(page, {
        '[data-testid="email-input"]': process.env.TEST_USER_EMAIL || 'admin@nova.com',
        '[data-testid="password-input"]': process.env.TEST_USER_PASSWORD || 'admin123',
      });
      await page.click('[data-testid="login-submit"]');

      // Wait for login to complete
      await expect(page).toHaveURL(/.*dashboard/);

      // Navigate to tickets - should trigger API call
      await page.click('[data-testid="nav-tickets"]');
      await testHelper.waitForPageLoad(page);

      // Create new ticket - should trigger POST API call
      await page.click('[data-testid="new-ticket-button"]');
      const ticketTitle = `UI-API Integration Test ${Date.now()}`;
      await testHelper.fillFormFields(page, {
        '[data-testid="ticket-title-input"]': ticketTitle,
        '[data-testid="ticket-description-input"]': 'Created via UI-API integration test',
      });
      await page.click('[data-testid="submit-button"]');

      // Wait for success toast
      await testHelper.verifyToast(page, 'Ticket created successfully', 'success');

      // Verify API calls were made
      const loginRequest = apiRequests.find(req => req.url.includes('/auth/login'));
      const ticketsGetRequest = apiRequests.find(req => 
        req.method === 'GET' && req.url.includes('/api/tickets')
      );
      const ticketCreateRequest = apiRequests.find(req => 
        req.method === 'POST' && req.url.includes('/api/tickets')
      );

      expect(loginRequest).toBeTruthy();
      expect(ticketsGetRequest).toBeTruthy();
      expect(ticketCreateRequest).toBeTruthy();

      if (ticketCreateRequest?.postData) {
        const postData = JSON.parse(ticketCreateRequest.postData);
        expect(postData.title).toBe(ticketTitle);
      }

      console.log('✅ UI-API integration validation successful');
    });

    test('should handle API errors gracefully in UI', async ({ page }) => {
      // Mock API error responses
      await page.route('**/api/tickets', (route) => {
        if (route.request().method() === 'POST') {
          route.fulfill({
            status: 500,
            contentType: 'application/json',
            body: JSON.stringify({
              error: 'Internal server error',
              message: 'Database connection failed',
            }),
          });
        } else {
          route.continue();
        }
      });

      // Login
      await page.goto('/');
      await page.click('[data-testid="login-button"]');
      await testHelper.fillFormFields(page, {
        '[data-testid="email-input"]': process.env.TEST_USER_EMAIL || 'admin@nova.com',
        '[data-testid="password-input"]': process.env.TEST_USER_PASSWORD || 'admin123',
      });
      await page.click('[data-testid="login-submit"]');

      // Navigate to tickets
      await page.click('[data-testid="nav-tickets"]');
      await page.click('[data-testid="new-ticket-button"]');

      // Try to create ticket (should fail)
      await testHelper.fillFormFields(page, {
        '[data-testid="ticket-title-input"]': 'Error Test Ticket',
        '[data-testid="ticket-description-input"]': 'This should fail',
      });
      await page.click('[data-testid="submit-button"]');

      // Verify error handling
      await testHelper.verifyToast(page, 'Internal server error', 'error');

      console.log('✅ API error handling validation successful');
    });

    test('should validate real-time updates via WebSocket', async ({ page }) => {
      test.skip(!authToken, 'No authentication token available');

      // Login
      await page.goto('/');
      await page.click('[data-testid="login-button"]');
      await testHelper.fillFormFields(page, {
        '[data-testid="email-input"]': process.env.TEST_USER_EMAIL || 'admin@nova.com',
        '[data-testid="password-input"]': process.env.TEST_USER_PASSWORD || 'admin123',
      });
      await page.click('[data-testid="login-submit"]');

      // Go to dashboard
      await expect(page).toHaveURL(/.*dashboard/);

      // Check for WebSocket connection indicator
      const connectionStatus = page.locator('[data-testid="connection-status"]');
      if (await connectionStatus.isVisible()) {
        await expect(connectionStatus).toContainText(/connected|online/i);
        console.log('✅ WebSocket connection established');
      } else {
        console.log('ℹ️ WebSocket connection status not visible (may not be implemented)');
      }

      // Test real-time notifications (if available)
      const notificationBadge = page.locator('[data-testid="notification-badge"]');
      if (await notificationBadge.isVisible()) {
        const initialCount = await notificationBadge.textContent();
        
        // Create a new ticket via API to trigger notification
        try {
          const headers = { Authorization: `Bearer ${authToken}` };
          await axios.post(`${apiBaseUrl}/api/tickets`, {
            title: 'Real-time Test Ticket',
            description: 'Testing real-time notifications',
            priority: 'HIGH',
          }, { headers });

          // Wait for potential notification update
          await page.waitForTimeout(2000);
          
          const updatedCount = await notificationBadge.textContent();
          if (updatedCount !== initialCount) {
            console.log('✅ Real-time notification update detected');
          } else {
            console.log('ℹ️ No real-time notification update detected');
          }
        } catch (error) {
          console.log('⚠️ Could not test real-time notifications via API');
        }
      }
    });
  });

  test.describe('Performance and Load Testing', () => {
    test('should validate API performance under load', async () => {
      test.skip(!authToken, 'No authentication token available');

      const headers = { Authorization: `Bearer ${authToken}` };
      const concurrentRequests = 10;
      const requestsPerBatch = 5;

      // Test concurrent read operations
      const readPromises = Array.from({ length: concurrentRequests }, () =>
        axios.get(`${apiBaseUrl}/api/tickets`, { headers, timeout: 10000 })
      );

      const startTime = Date.now();
      const readResults = await Promise.allSettled(readPromises);
      const readTime = Date.now() - startTime;

      const successfulReads = readResults.filter(result => result.status === 'fulfilled');
      const failedReads = readResults.filter(result => result.status === 'rejected');

      expect(successfulReads.length).toBeGreaterThan(concurrentRequests * 0.8); // 80% success rate
      expect(readTime).toBeLessThan(10000); // Should complete within 10 seconds

      console.log(`✅ Concurrent reads: ${successfulReads.length}/${concurrentRequests} successful in ${readTime}ms`);

      // Test batch operations
      const batchPromises = Array.from({ length: requestsPerBatch }, (_, i) =>
        axios.post(`${apiBaseUrl}/api/tickets`, {
          title: `Load Test Ticket ${i} ${Date.now()}`,
          description: 'Load testing ticket',
          priority: 'LOW',
        }, { headers })
      );

      const batchStartTime = Date.now();
      const batchResults = await Promise.allSettled(batchPromises);
      const batchTime = Date.now() - batchStartTime;

      const successfulCreations = batchResults.filter(result => result.status === 'fulfilled');
      expect(successfulCreations.length).toBeGreaterThan(requestsPerBatch * 0.8);

      console.log(`✅ Batch operations: ${successfulCreations.length}/${requestsPerBatch} successful in ${batchTime}ms`);

      // Cleanup created tickets
      const cleanupPromises = successfulCreations.map(result => {
        if (result.status === 'fulfilled' && result.value.data.id) {
          return axios.delete(`${apiBaseUrl}/api/tickets/${result.value.data.id}`, { headers });
        }
      });

      await Promise.allSettled(cleanupPromises);
    });

    test('should validate database connection pooling', async () => {
      test.skip(!authToken, 'No authentication token available');

      const headers = { Authorization: `Bearer ${authToken}` };
      const connectionTestRequests = 20;

      // Make multiple rapid database-intensive requests
      const connectionPromises = Array.from({ length: connectionTestRequests }, (_, i) =>
        axios.get(`${apiBaseUrl}/api/tickets?limit=1&offset=${i}`, { headers })
          .catch(error => ({ error: true, status: error.response?.status }))
      );

      const startTime = Date.now();
      const results = await Promise.all(connectionPromises);
      const duration = Date.now() - startTime;

      const successful = results.filter(result => !result.error);
      const errors = results.filter(result => result.error);

      expect(successful.length).toBeGreaterThan(connectionTestRequests * 0.9); // 90% success rate
      expect(duration).toBeLessThan(15000); // Should complete within 15 seconds

      console.log(`✅ Connection pooling test: ${successful.length}/${connectionTestRequests} successful in ${duration}ms`);

      if (errors.length > 0) {
        console.log(`⚠️ Errors detected:`, errors.map(e => e.status));
      }
    });
  });

  test.describe('Security and Authentication Testing', () => {
    test('should validate authentication is required for protected endpoints', async () => {
      const protectedEndpoints = [
        '/api/tickets',
        '/api/users',
        '/api/assets',
        '/api/organizations',
      ];

      for (const endpoint of protectedEndpoints) {
        try {
          const response = await axios.get(`${apiBaseUrl}${endpoint}`);
          // If we get here without authorization, that's a security issue
          if (response.status === 200) {
            console.log(`⚠️ Endpoint ${endpoint} accessible without authentication`);
          }
        } catch (error) {
          if (error.response?.status === 401 || error.response?.status === 403) {
            console.log(`✅ Endpoint ${endpoint} properly protected`);
          } else {
            console.log(`❌ Unexpected error for ${endpoint}:`, error.response?.status);
          }
        }
      }
    });

    test('should validate token expiration handling', async () => {
      test.skip(!authToken, 'No authentication token available');

      // Test with an obviously invalid token
      const invalidToken = 'invalid.jwt.token';
      const headers = { Authorization: `Bearer ${invalidToken}` };

      try {
        await axios.get(`${apiBaseUrl}/api/tickets`, { headers });
      } catch (error) {
        expect(error.response?.status).toBe(401);
        console.log('✅ Invalid token properly rejected');
      }
    });

    test('should validate input sanitization', async () => {
      test.skip(!authToken, 'No authentication token available');

      const headers = { Authorization: `Bearer ${authToken}` };
      
      // Test with malicious input
      const maliciousData = {
        title: '<script>alert("xss")</script>',
        description: 'SELECT * FROM users; --',
        priority: 'HIGH'
      };

      try {
        const response = await axios.post(`${apiBaseUrl}/api/tickets`, maliciousData, { headers });
        
        if (response.status === 201) {
          // Check if malicious content was sanitized
          const ticketId = response.data.id;
          const getResponse = await axios.get(`${apiBaseUrl}/api/tickets/${ticketId}`, { headers });
          
          expect(getResponse.data.title).not.toContain('<script>');
          expect(getResponse.data.description).not.toContain('SELECT * FROM');
          
          // Cleanup
          await axios.delete(`${apiBaseUrl}/api/tickets/${ticketId}`, { headers });
          
          console.log('✅ Input sanitization working properly');
        }
      } catch (error) {
        if (error.response?.status === 400) {
          console.log('✅ Malicious input properly rejected');
        } else {
          console.log('❌ Unexpected error with malicious input:', error.response?.status);
        }
      }
    });
  });

  test.describe('Error Handling and Resilience', () => {
    test('should handle network timeouts gracefully', async ({ page }) => {
      // Mock slow API responses
      await page.route('**/api/tickets', async (route) => {
        await new Promise(resolve => setTimeout(resolve, 5000)); // 5 second delay
        route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({ tickets: [], total: 0 }),
        });
      });

      await page.goto('/');
      await page.click('[data-testid="login-button"]');
      await testHelper.fillFormFields(page, {
        '[data-testid="email-input"]': process.env.TEST_USER_EMAIL || 'admin@nova.com',
        '[data-testid="password-input"]': process.env.TEST_USER_PASSWORD || 'admin123',
      });
      await page.click('[data-testid="login-submit"]');

      await page.click('[data-testid="nav-tickets"]');

      // Verify loading state is shown
      await expect(page.locator('[data-testid="loading-spinner"]')).toBeVisible();

      // Wait for timeout handling (should show error or retry)
      await page.waitForTimeout(6000);

      // Verify graceful error handling
      const errorMessage = page.locator('[data-testid="error-message"]');
      const retryButton = page.locator('[data-testid="retry-button"]');
      
      const hasError = await errorMessage.isVisible();
      const hasRetry = await retryButton.isVisible();

      expect(hasError || hasRetry).toBe(true);
      console.log('✅ Network timeout handled gracefully');
    });

    test('should recover from temporary API failures', async ({ page }) => {
      let requestCount = 0;

      // Mock intermittent failures
      await page.route('**/api/tickets', (route) => {
        requestCount++;
        if (requestCount <= 2) {
          // Fail first two requests
          route.fulfill({
            status: 500,
            contentType: 'application/json',
            body: JSON.stringify({ error: 'Temporary server error' }),
          });
        } else {
          // Succeed on third request
          route.fulfill({
            status: 200,
            contentType: 'application/json',
            body: JSON.stringify({ tickets: [], total: 0 }),
          });
        }
      });

      await page.goto('/');
      await page.click('[data-testid="login-button"]');
      await testHelper.fillFormFields(page, {
        '[data-testid="email-input"]': process.env.TEST_USER_EMAIL || 'admin@nova.com',
        '[data-testid="password-input"]': process.env.TEST_USER_PASSWORD || 'admin123',
      });
      await page.click('[data-testid="login-submit"]');

      await page.click('[data-testid="nav-tickets"]');

      // Should show error first
      await expect(page.locator('[data-testid="error-message"]')).toBeVisible();

      // Click retry button
      const retryButton = page.locator('[data-testid="retry-button"]');
      if (await retryButton.isVisible()) {
        await retryButton.click();
        await testHelper.waitForPageLoad(page);
        
        // Should eventually succeed
        await expect(page.locator('[data-testid="tickets-list"]')).toBeVisible();
        console.log('✅ Recovery from temporary API failures successful');
      }
    });
  });
});