import { test, expect } from '@playwright/test';

test.describe('Performance Testing', () => {
  test.describe('Page Load Performance', () => {
    test('should load main page within performance budget', async ({ page }) => {
      // Start timing
      const startTime = Date.now();
      
      // Navigate and wait for load
      await page.goto('/');
      await page.waitForLoadState('networkidle');
      
      const loadTime = Date.now() - startTime;
      
      // Performance budgets
      expect(loadTime).toBeLessThan(3000); // 3 seconds max load time
      
      // Check First Contentful Paint
      const fcp = await page.evaluate(() => {
        return new Promise((resolve) => {
          new PerformanceObserver((list) => {
            const entries = list.getEntries();
            const fcpEntry = entries.find(entry => entry.name === 'first-contentful-paint');
            if (fcpEntry) {
              resolve(fcpEntry.startTime);
            }
          }).observe({ entryTypes: ['paint'] });
        });
      });
      
      if (fcp) {
        expect(fcp).toBeLessThan(1500); // 1.5 seconds max FCP
      }
    });

    test('should load resources efficiently', async ({ page }) => {
      const resourceSizes: number[] = [];
      
      // Monitor network requests
      page.on('response', async (response) => {
        const contentLength = response.headers()['content-length'];
        if (contentLength) {
          resourceSizes.push(parseInt(contentLength));
        }
      });
      
      await page.goto('/');
      await page.waitForLoadState('networkidle');
      
      // Check total resource size
      const totalSize = resourceSizes.reduce((sum, size) => sum + size, 0);
      
      // Budget: 2MB total for initial page load
      expect(totalSize).toBeLessThan(2 * 1024 * 1024);
    });
  });

  test.describe('Interaction Performance', () => {
    test('should respond quickly to user interactions', async ({ page }) => {
      await page.goto('/');
      
      // Test language switcher performance
      const languageButton = page.getByRole('button', { name: /language/i });
      
      if (await languageButton.isVisible()) {
        const startTime = Date.now();
        await languageButton.click();
        
        // Wait for menu to appear
        const menu = page.getByRole('menu');
        if (await menu.isVisible()) {
          const responseTime = Date.now() - startTime;
          expect(responseTime).toBeLessThan(300); // 300ms max response time
        }
      }
    });

    test('should handle rapid interactions without performance degradation', async ({ page }) => {
      await page.goto('/');
      
      const languageButton = page.getByRole('button', { name: /language/i });
      
      if (await languageButton.isVisible()) {
        const responseTimes: number[] = [];
        
        // Perform 10 rapid interactions
        for (let i = 0; i < 10; i++) {
          const startTime = Date.now();
          await languageButton.click();
          
          const menu = page.getByRole('menu');
          if (await menu.isVisible()) {
            responseTimes.push(Date.now() - startTime);
            
            // Close menu
            await page.keyboard.press('Escape');
            await page.waitForTimeout(50);
          }
        }
        
        // Check that response times remain consistent
        const avgResponseTime = responseTimes.reduce((sum, time) => sum + time, 0) / responseTimes.length;
        expect(avgResponseTime).toBeLessThan(500);
        
        // No response time should be excessively long
        const maxResponseTime = Math.max(...responseTimes);
        expect(maxResponseTime).toBeLessThan(1000);
      }
    });
  });

  test.describe('Memory Performance', () => {
    test('should not have significant memory leaks', async ({ page }) => {
      await page.goto('/');
      
      // Get initial memory usage
      const initialMemory = await page.evaluate(() => {
        if ('memory' in performance) {
          return (performance as Performance & { memory?: { usedJSHeapSize: number } }).memory?.usedJSHeapSize || 0;
        }
        return 0;
      });
      
      if (initialMemory > 0) {
        // Perform memory-intensive operations
        const languageButton = page.getByRole('button', { name: /language/i });
        
        if (await languageButton.isVisible()) {
          // Open and close menu many times
          for (let i = 0; i < 50; i++) {
            await languageButton.click();
            const menu = page.getByRole('menu');
            if (await menu.isVisible()) {
              await page.keyboard.press('Escape');
            }
            
            // Trigger garbage collection periodically
            if (i % 10 === 0) {
              await page.evaluate(() => {
                if ('gc' in window) {
                  (window as Window & { gc?: () => void }).gc?.();
                }
              });
            }
          }
        }
        
        // Force garbage collection
        await page.evaluate(() => {
          if ('gc' in window) {
            (window as Window & { gc?: () => void }).gc?.();
          }
        });
        
        // Check final memory usage
        const finalMemory = await page.evaluate(() => {
          if ('memory' in performance) {
            return (performance as Performance & { memory?: { usedJSHeapSize: number } }).memory?.usedJSHeapSize || 0;
          }
          return 0;
        });
        
        // Memory should not have increased by more than 50%
        const memoryIncrease = (finalMemory - initialMemory) / initialMemory;
        expect(memoryIncrease).toBeLessThan(0.5);
      }
    });
  });

  test.describe('Responsive Performance', () => {
    test('should perform well on mobile devices', async ({ page, isMobile }) => {
      if (!isMobile) {
        await page.setViewportSize({ width: 375, height: 667 });
      }
      
      const startTime = Date.now();
      await page.goto('/');
      await page.waitForLoadState('networkidle');
      const loadTime = Date.now() - startTime;
      
      // Mobile should load within 4 seconds
      expect(loadTime).toBeLessThan(4000);
      
      // Test scroll performance
      const scrollStart = Date.now();
      await page.evaluate(() => {
        window.scrollTo({ top: 500, behavior: 'smooth' });
      });
      await page.waitForTimeout(1000);
      const scrollTime = Date.now() - scrollStart;
      
      expect(scrollTime).toBeLessThan(1500);
    });

    test('should maintain performance across viewport changes', async ({ page }) => {
      await page.goto('/');
      
      const viewports = [
        { width: 1920, height: 1080 }, // Desktop
        { width: 768, height: 1024 },  // Tablet
        { width: 375, height: 667 },   // Mobile
      ];
      
      for (const viewport of viewports) {
        const startTime = Date.now();
        await page.setViewportSize(viewport);
        
        // Wait for layout to stabilize
        await page.waitForTimeout(500);
        
        const resizeTime = Date.now() - startTime;
        expect(resizeTime).toBeLessThan(1000);
        
        // Ensure content is still visible
        const mainContent = page.getByRole('main');
        await expect(mainContent).toBeVisible();
      }
    });
  });

  test.describe('Bundle Analysis', () => {
    test('should not load unnecessary resources', async ({ page }) => {
      const loadedResources: string[] = [];
      
      page.on('request', (request) => {
        loadedResources.push(request.url());
      });
      
      await page.goto('/');
      await page.waitForLoadState('networkidle');
      
      // Filter for JavaScript bundles
      const jsBundles = loadedResources.filter(url => 
        url.includes('.js') && !url.includes('node_modules')
      );
      
      // Should not load too many JavaScript files
      expect(jsBundles.length).toBeLessThan(20);
      
      // Check for common optimization patterns
      const hasMinifiedFiles = jsBundles.some(url => url.includes('.min.'));
      const hasChunkedFiles = jsBundles.some(url => url.includes('chunk'));
      
      // At least one optimization technique should be used
      expect(hasMinifiedFiles || hasChunkedFiles).toBe(true);
    });
  });
});
