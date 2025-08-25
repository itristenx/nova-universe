import { describe, it, beforeEach, afterEach } from 'node:test';
import assert from 'node:assert';
import path from 'path';
import fs from 'node:fs/promises';
import { FileStorageManager } from '../apps/api/lib/file-storage.js';

describe('File Storage System Final Test', () => {
  let storageManager;
  let testDir;

  beforeEach(async () => {
    testDir = path.join(process.cwd(), 'tmp', 'final-test-storage');
    await fs.mkdir(testDir, { recursive: true });

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
          patterns: [/^logos\//, /^favicon\./],
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

  afterEach(async () => {
    try {
      await fs.rm(testDir, { recursive: true, force: true });
    } catch {
      // Ignore cleanup errors
    }
  });

  it('should perform basic file operations', async () => {
    const testContent = Buffer.from('Hello, File Storage!');
    const key = 'test/basic-file.txt';

    // Upload
    const uploadResult = await storageManager.upload(testContent, {
      key,
      filename: 'basic-file.txt',
      contentType: 'text/plain',
    });
    assert(uploadResult.key === key);

    // Exists
    assert((await storageManager.exists(key)) === true);

    // Download
    const downloadResult = await storageManager.download(key);
    assert.deepStrictEqual(downloadResult.buffer, testContent);

    // Get URL
    const url = await storageManager.getUrl(key);
    assert(typeof url === 'string');
    assert(url.includes(key));

    // Delete
    const deleted = await storageManager.delete(key);
    assert(deleted === true);
    assert((await storageManager.exists(key)) === false);
  });

  it('should route files based on context with fallback', async () => {
    // Test site assets (should use local)
    const logoContent = Buffer.from('Logo data');
    const logoKey = 'logos/test-logo.png';

    const logoProvider = storageManager.determineStorageProvider(
      'test-logo.png',
      'image/png',
      'siteAssets',
    );
    assert(logoProvider === 'local');

    await storageManager.upload(logoContent, {
      key: logoKey,
      filename: 'test-logo.png',
      contentType: 'image/png',
      context: 'siteAssets',
    });
    assert((await storageManager.exists(logoKey)) === true);

    // Test ticket attachments (should fallback to local since S3 unavailable)
    const attachmentContent = Buffer.from('Attachment data');
    const attachmentKey = 'attachments/test-file.pdf';

    const attachmentProvider = storageManager.determineStorageProvider(
      'test-file.pdf',
      'application/pdf',
      'ticketAttachments',
    );
    assert(attachmentProvider === 'local'); // Should fallback

    await storageManager.upload(attachmentContent, {
      key: attachmentKey,
      filename: 'test-file.pdf',
      contentType: 'application/pdf',
      context: 'ticketAttachments',
    });
    assert((await storageManager.exists(attachmentKey)) === true);
  });

  it('should provide storage information', () => {
    const providers = storageManager.getAvailableProviders();
    assert(Array.isArray(providers));
    assert(providers.includes('local'));

    assert(storageManager.isProviderAvailable('local') === true);
    assert(storageManager.isProviderAvailable('nonexistent') === false);

    const rules = storageManager.getHybridRules();
    assert(typeof rules === 'object');
    assert(rules.default);
  });
});
