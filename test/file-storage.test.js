import { describe, it, beforeEach, afterEach } from 'node:test';
import assert from 'node:assert';
import path from 'node:path';
import fs from 'node:fs/promises';
import { FileStorageManager } from '../apps/api/lib/file-storage.js';

describe('File Storage System', () => {
  let storageManager;
  let testDir;

  beforeEach(async () => {
    // Create temporary test directory
    testDir = path.join(process.cwd(), 'tmp', 'test-storage');
    try {
      await fs.mkdir(testDir, { recursive: true });
    } catch {
      // Directory might already exist
    }

    // Initialize storage manager with local provider only
    storageManager = new FileStorageManager({
      local: {
        provider: 'local',
        config: {
          basePath: testDir,
        },
      },
      hybridRules: {
        // Local-only rules for testing
        siteAssets: {
          provider: 'local',
          patterns: [/^logos\//, /^favicon\./],
          maxSize: 10 * 1024 * 1024, // 10MB
          allowedTypes: ['image/*'],
        },
        default: {
          provider: 'local',
          maxSize: 50 * 1024 * 1024, // 50MB
          allowedTypes: ['*'],
        },
      },
    });
  });

  afterEach(async () => {
    // Clean up test directory
    try {
      await fs.rm(testDir, { recursive: true, force: true });
    } catch {
      // Ignore cleanup errors
    }
  });

  describe('LocalStorageProvider', () => {
    it('should upload and download files correctly', async () => {
      const testContent = Buffer.from('Hello, World!');
      const key = 'test/hello.txt';

      // Upload file
      await storageManager.upload(testContent, {
        key,
        filename: 'hello.txt',
        contentType: 'text/plain',
      });

      // Verify file exists
      const exists = await storageManager.exists(key);
      assert.strictEqual(exists, true);

      // Download and verify content
      const downloadResult = await storageManager.download(key);
      assert.deepStrictEqual(downloadResult.buffer, testContent);
    });

    it('should delete files correctly', async () => {
      const testContent = Buffer.from('Delete me!');
      const key = 'test/delete-me.txt';

      // Upload file
      await storageManager.upload(testContent, {
        key,
        filename: 'delete-me.txt',
        contentType: 'text/plain',
      });

      // Verify file exists
      assert.strictEqual(await storageManager.exists(key), true);

      // Delete file
      const deleted = await storageManager.delete(key);
      assert.strictEqual(deleted, true);

      // Verify file no longer exists
      assert.strictEqual(await storageManager.exists(key), false);
    });

    it('should generate URLs correctly', async () => {
      const testContent = Buffer.from('URL test');
      const key = 'test/url-test.txt';

      // Upload file
      await storageManager.upload(testContent, {
        key,
        filename: 'url-test.txt',
        contentType: 'text/plain',
      });

      // Get URL
      const url = await storageManager.getUrl(key);
      assert(typeof url === 'string');
      assert(url.includes(key));
    });
  });

  describe('Hybrid Storage Rules', () => {
    beforeEach(() => {
      // Set up hybrid storage manager with rules
      storageManager = new FileStorageManager({
        local: {
          provider: 'local',
          config: {
            basePath: testDir,
          },
        },
        hybridRules: {
          siteAssets: {
            provider: 'local',
            patterns: [/^logos\//, /^site-assets\//],
            maxSize: 10 * 1024 * 1024,
            allowedTypes: ['image/*'],
          },
          ticketAttachments: {
            provider: 's3',
            fallback: 'local',
            maxSize: 100 * 1024 * 1024,
            allowedTypes: ['*'],
          },
          default: {
            provider: 'local',
            maxSize: 50 * 1024 * 1024,
            allowedTypes: ['*'],
          },
        },
      });
    });

    it('should route files based on path patterns', async () => {
      const logoContent = Buffer.from('Logo data');
      const logoKey = 'logos/company-logo.png';

      // Determine provider for logo (should be local)
      const provider = storageManager.determineStorageProvider('company-logo.png', 'image/png');
      assert.strictEqual(provider, 'local');

      // Upload logo
      await storageManager.upload(logoContent, {
        key: logoKey,
        filename: 'company-logo.png',
        contentType: 'image/png',
      });

      // Verify it exists and can be downloaded
      assert.strictEqual(await storageManager.exists(logoKey), true);
      const downloadResult = await storageManager.download(logoKey);
      assert.deepStrictEqual(downloadResult.buffer, logoContent);
    });

    it('should route files based on context', async () => {
      const assetContent = Buffer.from('Site asset data');
      const assetKey = 'favicon.ico';

      // Determine provider with context (should be local for site assets)
      const provider = storageManager.determineStorageProvider(
        'favicon.ico',
        'image/x-icon',
        'siteAssets',
      );
      assert.strictEqual(provider, 'local');

      // Upload with context
      await storageManager.upload(assetContent, {
        key: assetKey,
        filename: 'favicon.ico',
        contentType: 'image/x-icon',
        context: 'siteAssets',
      });

      // Verify it exists
      assert.strictEqual(await storageManager.exists(assetKey), true);
    });

    it('should fall back to available providers', async () => {
      const attachmentContent = Buffer.from('Ticket attachment');
      const attachmentKey = 'attachments/ticket-123/file.pdf';

      // For this test, we expect local since our test setup only has local providers
      // In a real environment with S3 configured, this would return 's3'
      const provider = storageManager.determineStorageProvider(
        'file.pdf',
        'application/pdf',
        'ticketAttachments',
      );
      // Since we have hybrid rules with S3 fallback, it should fallback to local when S3 unavailable
      assert.strictEqual(provider, 'local'); // Falls back because S3 not functional

      // Upload attachment
      await storageManager.upload(attachmentContent, {
        key: attachmentKey,
        filename: 'file.pdf',
        contentType: 'application/pdf',
        context: 'ticketAttachments',
      });

      // Verify it exists
      assert.strictEqual(await storageManager.exists(attachmentKey), true);
    });
  });

  describe('Provider Management', () => {
    it('should handle missing providers gracefully', async () => {
      const testContent = Buffer.from('Test content');
      const key = 'test/missing-provider.txt';

      // Try to upload with specific provider that doesn't exist
      try {
        await storageManager.upload(testContent, {
          key,
          filename: 'test.txt',
          contentType: 'text/plain',
          storageProvider: 'nonexistent',
        });
        assert.fail('Should have thrown an error for missing provider');
      } catch (error) {
        assert(error.message.includes('Storage provider not available'));
      }
    });

    it('should list available providers', () => {
      const providers = storageManager.getAvailableProviders();
      assert(Array.isArray(providers));
      assert(providers.includes('local'));
    });

    it('should check provider availability', () => {
      assert.strictEqual(storageManager.isProviderAvailable('local'), true);
      assert.strictEqual(storageManager.isProviderAvailable('s3'), false);
      assert.strictEqual(storageManager.isProviderAvailable('nonexistent'), false);
    });
  });

  describe('Error Handling', () => {
    it('should handle non-existent file downloads', async () => {
      try {
        await storageManager.download('non-existent/file.txt');
        assert.fail('Should have thrown an error for non-existent file');
      } catch (error) {
        assert(error.message.includes('File not found'));
      }
    });

    it('should handle non-existent file deletions', async () => {
      const deleted = await storageManager.delete('non-existent/file.txt');
      assert.strictEqual(deleted, false);
    });

    it('should handle file existence checks for non-existent files', async () => {
      const exists = await storageManager.exists('non-existent/file.txt');
      assert.strictEqual(exists, false);
    });
  });

  describe('Configuration Validation', () => {
    it('should validate storage configuration', () => {
      // Test invalid configuration
      try {
        new FileStorageManager({
          invalid: {
            provider: 'unknown',
            config: {},
          },
        });
        assert.fail('Should have thrown an error for invalid provider');
      } catch (error) {
        assert(error.message.includes('Unknown storage provider'));
      }
    });

    it('should require at least one storage provider', () => {
      try {
        new FileStorageManager({});
        assert.fail('Should have thrown an error for no providers');
      } catch (error) {
        assert(error.message.includes('At least one storage provider must be configured'));
      }
    });
  });
});
