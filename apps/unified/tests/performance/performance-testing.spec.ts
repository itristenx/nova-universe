import { test, expect } from '@playwright/test';
import { testHelper } from '../utils/test-helpers';

test.describe('Performance Testing Suite', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await testHelper.waitForPageLoad(page);
  });

  test.describe('Page Load Performance', () => {
    test('should load home page within performance threshold', async ({ page }) => {
      const startTime = Date.now();
      
      await page.goto('/');
      await testHelper.waitForPageLoad(page);
      
      const loadTime = Date.now() - startTime;
      const threshold = parseInt(process.env.TEST_PERFORMANCE_THRESHOLD_LOAD_TIME || '3000');
      
      console.log(`📊 Home page load time: ${loadTime}ms`);
      expect(loadTime).toBeLessThan(threshold);
    });

    test('should load dashboard within performance threshold', async ({ page }) => {
      // Login first
      await page.click('[data-testid="login-button"]');
      await testHelper.fillFormFields(page, {
        '[data-testid="email-input"]': process.env.TEST_USER_EMAIL || 'testuser@nova.com',
        '[data-testid="password-input"]': process.env.TEST_USER_PASSWORD || 'TestUser123!',
      });
      await page.click('[data-testid="login-submit"]');
      
      const startTime = Date.now();
      
      // Navigate to dashboard
      await page.goto('/dashboard');
      await testHelper.waitForPageLoad(page);
      
      const loadTime = Date.now() - startTime;
      const threshold = parseInt(process.env.TEST_PERFORMANCE_THRESHOLD_LOAD_TIME || '3000');
      
      console.log(`📊 Dashboard load time: ${loadTime}ms`);
      expect(loadTime).toBeLessThan(threshold);
    });

    test('should load tickets page within performance threshold', async ({ page }) => {
      // Login first
      await page.click('[data-testid="login-button"]');
      await testHelper.fillFormFields(page, {
        '[data-testid="email-input"]': process.env.TEST_USER_EMAIL || 'testuser@nova.com',
        '[data-testid="password-input"]': process.env.TEST_USER_PASSWORD || 'TestUser123!',
      });
      await page.click('[data-testid="login-submit"]');
      
      const startTime = Date.now();
      
      // Navigate to tickets
      await page.goto('/tickets');
      await testHelper.waitForPageLoad(page);
      
      const loadTime = Date.now() - startTime;
      const threshold = parseInt(process.env.TEST_PERFORMANCE_THRESHOLD_LOAD_TIME || '3000');
      
      console.log(`📊 Tickets page load time: ${loadTime}ms`);
      expect(loadTime).toBeLessThan(threshold);
    });

    test('should measure First Contentful Paint (FCP)', async ({ page }) => {
      const fcp = await page.evaluate(() => {
        return new Promise((resolve) => {
          const observer = new PerformanceObserver((list) => {
            const entries = list.getEntries();
            const fcpEntry = entries.find(entry => entry.name === 'first-contentful-paint');
            if (fcpEntry) {
              resolve(fcpEntry.startTime);
            }
          });
          observer.observe({ entryTypes: ['paint'] });
        });
      });
      
      console.log(`📊 First Contentful Paint: ${fcp}ms`);
      expect(fcp).toBeLessThan(2000); // Should be under 2 seconds
    });

    test('should measure Largest Contentful Paint (LCP)', async ({ page }) => {
      await page.goto('/');
      
      const lcp = await page.evaluate(() => {
        return new Promise((resolve) => {
          const observer = new PerformanceObserver((list) => {
            const entries = list.getEntries();
            const lcpEntry = entries[entries.length - 1];
            resolve(lcpEntry.startTime);
          });
          observer.observe({ entryTypes: ['largest-contentful-paint'] });
        });
      });
      
      console.log(`📊 Largest Contentful Paint: ${lcp}ms`);
      expect(lcp).toBeLessThan(2500); // Should be under 2.5 seconds
    });
  });

  test.describe('API Performance', () => {
    test('should measure API response times', async ({ page }) => {
      // Login first
      await page.click('[data-testid="login-button"]');
      await testHelper.fillFormFields(page, {
        '[data-testid="email-input"]': process.env.TEST_USER_EMAIL || 'testuser@nova.com',
        '[data-testid="password-input"]': process.env.TEST_USER_PASSWORD || 'TestUser123!',
      });
      
      const startTime = Date.now();
      await page.click('[data-testid="login-submit"]');
      
      // Wait for API response
      await testHelper.waitForApiResponse(page, '/auth/login', 200);
      
      const apiResponseTime = Date.now() - startTime;
      const threshold = parseInt(process.env.TEST_PERFORMANCE_THRESHOLD_API_RESPONSE || '2000');
      
      console.log(`📊 Login API response time: ${apiResponseTime}ms`);
      expect(apiResponseTime).toBeLessThan(threshold);
    });

    test('should measure ticket list API performance', async ({ page }) => {
      // Login first
      await page.click('[data-testid="login-button"]');
      await testHelper.fillFormFields(page, {
        '[data-testid="email-input"]': process.env.TEST_USER_EMAIL || 'testuser@nova.com',
        '[data-testid="password-input"]': process.env.TEST_USER_PASSWORD || 'TestUser123!',
      });
      await page.click('[data-testid="login-submit"]');
      
      const startTime = Date.now();
      
      // Navigate to tickets page
      await page.goto('/tickets');
      await testHelper.waitForApiResponse(page, '/tickets', 200);
      
      const apiResponseTime = Date.now() - startTime;
      const threshold = parseInt(process.env.TEST_PERFORMANCE_THRESHOLD_API_RESPONSE || '2000');
      
      console.log(`📊 Tickets API response time: ${apiResponseTime}ms`);
      expect(apiResponseTime).toBeLessThan(threshold);
    });

    test('should measure search API performance', async ({ page }) => {
      // Login first
      await page.click('[data-testid="login-button"]');
      await testHelper.fillFormFields(page, {
        '[data-testid="email-input"]': process.env.TEST_USER_EMAIL || 'testuser@nova.com',
        '[data-testid="password-input"]': process.env.TEST_USER_PASSWORD || 'TestUser123!',
      });
      await page.click('[data-testid="login-submit"]');
      
      const startTime = Date.now();
      
      // Perform search
      await page.fill('[data-testid="search-input"]', 'test');
      await page.keyboard.press('Enter');
      
      // Wait for search API response
      await testHelper.waitForApiResponse(page, '/search', 200);
      
      const searchResponseTime = Date.now() - startTime;
      const threshold = parseInt(process.env.TEST_PERFORMANCE_THRESHOLD_API_RESPONSE || '2000');
      
      console.log(`📊 Search API response time: ${searchResponseTime}ms`);
      expect(searchResponseTime).toBeLessThan(threshold);
    });
  });

  test.describe('Rendering Performance', () => {
    test('should measure render time for complex components', async ({ page }) => {
      // Login first
      await page.click('[data-testid="login-button"]');
      await testHelper.fillFormFields(page, {
        '[data-testid="email-input"]': process.env.TEST_USER_EMAIL || 'testuser@nova.com',
        '[data-testid="password-input"]': process.env.TEST_USER_PASSWORD || 'TestUser123!',
      });
      await page.click('[data-testid="login-submit"]');
      
      const startTime = Date.now();
      
      // Navigate to dashboard with complex components
      await page.goto('/dashboard');
      await testHelper.waitForPageLoad(page);
      
      // Wait for charts and widgets to render
      await page.waitForSelector('[data-testid="dashboard-chart"]', { timeout: 5000 });
      
      const renderTime = Date.now() - startTime;
      const threshold = parseInt(process.env.TEST_PERFORMANCE_THRESHOLD_RENDER_TIME || '1000');
      
      console.log(`📊 Dashboard render time: ${renderTime}ms`);
      expect(renderTime).toBeLessThan(threshold);
    });

    test('should measure table rendering performance', async ({ page }) => {
      // Login first
      await page.click('[data-testid="login-button"]');
      await testHelper.fillFormFields(page, {
        '[data-testid="email-input"]': process.env.TEST_USER_EMAIL || 'testuser@nova.com',
        '[data-testid="password-input"]': process.env.TEST_USER_PASSWORD || 'TestUser123!',
      });
      await page.click('[data-testid="login-submit"]');
      
      const startTime = Date.now();
      
      // Navigate to tickets page with table
      await page.goto('/tickets');
      await testHelper.waitForPageLoad(page);
      
      // Wait for table to render
      await page.waitForSelector('[data-testid="tickets-table"]', { timeout: 5000 });
      
      const renderTime = Date.now() - startTime;
      const threshold = parseInt(process.env.TEST_PERFORMANCE_THRESHOLD_RENDER_TIME || '1000');
      
      console.log(`📊 Table render time: ${renderTime}ms`);
      expect(renderTime).toBeLessThan(threshold);
    });
  });

  test.describe('Memory Usage', () => {
    test('should monitor memory usage during navigation', async ({ page }) => {
      const initialMemory = await page.evaluate(() => {
        if ('memory' in performance) {
          return (performance as any).memory.usedJSHeapSize;
        }
        return 0;
      });
      
      // Navigate through multiple pages
      await page.goto('/');
      await page.goto('/dashboard');
      await page.goto('/tickets');
      await page.goto('/assets');
      
      const finalMemory = await page.evaluate(() => {
        if ('memory' in performance) {
          return (performance as any).memory.usedJSHeapSize;
        }
        return 0;
      });
      
      const memoryIncrease = finalMemory - initialMemory;
      const maxIncrease = 50 * 1024 * 1024; // 50MB max increase
      
      console.log(`📊 Memory usage increase: ${memoryIncrease / 1024 / 1024}MB`);
      expect(memoryIncrease).toBeLessThan(maxIncrease);
    });

    test('should not have memory leaks during repeated operations', async ({ page }) => {
      // Login first
      await page.click('[data-testid="login-button"]');
      await testHelper.fillFormFields(page, {
        '[data-testid="email-input"]': process.env.TEST_USER_EMAIL || 'testuser@nova.com',
        '[data-testid="password-input"]': process.env.TEST_USER_PASSWORD || 'TestUser123!',
      });
      await page.click('[data-testid="login-submit"]');
      
      const initialMemory = await page.evaluate(() => {
        if ('memory' in performance) {
          return (performance as any).memory.usedJSHeapSize;
        }
        return 0;
      });
      
      // Perform repeated operations
      for (let i = 0; i < 10; i++) {
        await page.goto('/tickets');
        await page.waitForSelector('[data-testid="tickets-table"]');
        await page.goto('/dashboard');
        await page.waitForSelector('[data-testid="dashboard-chart"]');
      }
      
      const finalMemory = await page.evaluate(() => {
        if ('memory' in performance) {
          return (performance as any).memory.usedJSHeapSize;
        }
        return 0;
      });
      
      const memoryIncrease = finalMemory - initialMemory;
      const maxIncrease = 20 * 1024 * 1024; // 20MB max increase for repeated operations
      
      console.log(`📊 Memory usage after repeated operations: ${memoryIncrease / 1024 / 1024}MB`);
      expect(memoryIncrease).toBeLessThan(maxIncrease);
    });
  });

  test.describe('Network Performance', () => {
    test('should optimize bundle size', async ({ page }) => {
      const response = await page.goto('/');
      const html = await response?.text();
      
      // Check for reasonable bundle sizes
      const scriptTags = html.match(/<script[^>]*src="([^"]*)"[^>]*>/g) || [];
      const cssTags = html.match(/<link[^>]*href="([^"]*\.css)"[^>]*>/g) || [];
      
      console.log(`📊 Number of script tags: ${scriptTags.length}`);
      console.log(`📊 Number of CSS files: ${cssTags.length}`);
      
      // Should have reasonable number of resources
      expect(scriptTags.length).toBeLessThan(10);
      expect(cssTags.length).toBeLessThan(5);
    });

    test('should use efficient image formats', async ({ page }) => {
      const images = await page.locator('img').all();
      
      for (const img of images) {
        const src = await img.getAttribute('src');
        if (src) {
          // Check for modern image formats
          const isModernFormat = src.includes('.webp') || 
                               src.includes('.avif') || 
                               src.includes('.svg') ||
                               src.includes('data:image');
          
          if (!isModernFormat && !src.includes('placeholder')) {
            console.log(`⚠️ Consider using modern image format: ${src}`);
          }
        }
      }
    });

    test('should implement proper caching headers', async ({ page }) => {
      const response = await page.goto('/');
      const headers = response?.headers();
      
      if (headers) {
        const cacheControl = headers['cache-control'];
        const etag = headers['etag'];
        
        console.log(`📊 Cache-Control: ${cacheControl}`);
        console.log(`📊 ETag: ${etag ? 'Present' : 'Missing'}`);
        
        // Should have some caching strategy
        expect(cacheControl || etag).toBeTruthy();
      }
    });
  });

  test.describe('Concurrent User Performance', () => {
    test('should handle multiple concurrent requests', async ({ browser }) => {
      const numConcurrentUsers = 5;
      const startTime = Date.now();
      
      // Create multiple browser contexts
      const contexts = await Promise.all(
        Array.from({ length: numConcurrentUsers }, () => browser.newContext())
      );
      
      const pages = await Promise.all(
        contexts.map(context => context.newPage())
      );
      
      // Perform concurrent login operations
      const loginPromises = pages.map(async (page) => {
        await page.goto('/');
        await page.click('[data-testid="login-button"]');
        await testHelper.fillFormFields(page, {
          '[data-testid="email-input"]': process.env.TEST_USER_EMAIL || 'testuser@nova.com',
          '[data-testid="password-input"]': process.env.TEST_USER_PASSWORD || 'TestUser123!',
        });
        await page.click('[data-testid="login-submit"]');
        await testHelper.waitForApiResponse(page, '/auth/login', 200);
      });
      
      await Promise.all(loginPromises);
      
      const totalTime = Date.now() - startTime;
      const averageTime = totalTime / numConcurrentUsers;
      
      console.log(`📊 Concurrent login time (${numConcurrentUsers} users): ${totalTime}ms`);
      console.log(`📊 Average time per user: ${averageTime}ms`);
      
      // Should complete within reasonable time
      expect(totalTime).toBeLessThan(10000); // 10 seconds for 5 concurrent users
      expect(averageTime).toBeLessThan(3000); // 3 seconds average per user
      
      // Cleanup
      await Promise.all(contexts.map(context => context.close()));
    });
  });

  test.describe('Database Query Performance', () => {
    test('should measure database query performance', async ({ page }) => {
      // Login first
      await page.click('[data-testid="login-button"]');
      await testHelper.fillFormFields(page, {
        '[data-testid="email-input"]': process.env.TEST_USER_EMAIL || 'testuser@nova.com',
        '[data-testid="password-input"]': process.env.TEST_USER_PASSWORD || 'TestUser123!',
      });
      await page.click('[data-testid="login-submit"]');
      
      const startTime = Date.now();
      
      // Navigate to tickets page (requires database queries)
      await page.goto('/tickets');
      await testHelper.waitForPageLoad(page);
      
      // Wait for data to load
      await page.waitForSelector('[data-testid="tickets-table"]', { timeout: 5000 });
      
      const queryTime = Date.now() - startTime;
      const threshold = 2000; // 2 seconds for database queries
      
      console.log(`📊 Database query time: ${queryTime}ms`);
      expect(queryTime).toBeLessThan(threshold);
    });

    test('should handle large datasets efficiently', async ({ page }) => {
      // Login first
      await page.click('[data-testid="login-button"]');
      await testHelper.fillFormFields(page, {
        '[data-testid="email-input"]': process.env.TEST_USER_EMAIL || 'testuser@nova.com',
        '[data-testid="password-input"]': process.env.TEST_USER_PASSWORD || 'TestUser123!',
      });
      await page.click('[data-testid="login-submit"]');
      
      const startTime = Date.now();
      
      // Navigate to a page that might have large datasets
      await page.goto('/tickets?limit=100');
      await testHelper.waitForPageLoad(page);
      
      // Wait for pagination or large dataset to load
      await page.waitForSelector('[data-testid="tickets-table"]', { timeout: 10000 });
      
      const loadTime = Date.now() - startTime;
      const threshold = 5000; // 5 seconds for large datasets
      
      console.log(`📊 Large dataset load time: ${loadTime}ms`);
      expect(loadTime).toBeLessThan(threshold);
    });
  });

  test.describe('Real-time Performance', () => {
    test('should handle real-time updates efficiently', async ({ page }) => {
      // Login first
      await page.click('[data-testid="login-button"]');
      await testHelper.fillFormFields(page, {
        '[data-testid="email-input"]': process.env.TEST_USER_EMAIL || 'testuser@nova.com',
        '[data-testid="password-input"]': process.env.TEST_USER_PASSWORD || 'TestUser123!',
      });
      await page.click('[data-testid="login-submit"]');
      
      // Navigate to dashboard with real-time updates
      await page.goto('/dashboard');
      await testHelper.waitForPageLoad(page);
      
      const startTime = Date.now();
      
      // Wait for real-time updates to start
      await page.waitForSelector('[data-testid="real-time-indicator"]', { timeout: 5000 });
      
      // Monitor for 5 seconds to check real-time performance
      await page.waitForTimeout(5000);
      
      const realTimeTime = Date.now() - startTime;
      
      console.log(`📊 Real-time update monitoring time: ${realTimeTime}ms`);
      
      // Should not have significant performance impact
      expect(realTimeTime).toBeLessThan(6000); // Should be close to 5 seconds
    });
  });
});
