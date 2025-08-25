// File Storage Service - Supports both local and S3 storage
import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { promisify } from 'util';
import { logger } from '../logger.js';

const writeFile = promisify(fs.writeFile);
const mkdir = promisify(fs.mkdir);
const unlink = promisify(fs.unlink);
const stat = promisify(fs.stat);

/**
 * Abstract Storage Interface
 */
class StorageProvider {
  async upload(_buffer, _filename, _contentType, _metadata = {}) {
    throw new Error('upload method must be implemented');
  }

  async download(_key) {
    throw new Error('download method must be implemented');
  }

  async delete(_key) {
    throw new Error('delete method must be implemented');
  }

  async exists(_key) {
    throw new Error('exists method must be implemented');
  }

  async getUrl(_key, _expiresIn = 3600) {
    throw new Error('getUrl method must be implemented');
  }
}

/**
 * Local File Storage Provider
 */
class LocalStorageProvider extends StorageProvider {
  constructor(config = {}) {
    super();
    this.basePath = config.basePath || path.join(process.cwd(), 'uploads');
    this.baseUrl = config.baseUrl || '/uploads';
    this.ensureDirectoryExists();
  }

  async ensureDirectoryExists() {
    try {
      await stat(this.basePath);
    } catch (error) {
      if (error.code === 'ENOENT') {
        await mkdir(this.basePath, { recursive: true });
      }
    }
  }

  generateKey(filename, contentType) {
    const timestamp = Date.now();
    const randomSuffix = crypto.randomBytes(8).toString('hex');
    const extension = path.extname(filename) || this.getExtensionFromMimeType(contentType);
    const baseName = path.basename(filename, extension).replace(/[^a-zA-Z0-9-_]/g, '-');
    return `${timestamp}-${randomSuffix}-${baseName}${extension}`;
  }

  getExtensionFromMimeType(mimeType) {
    const mimeToExt = {
      'image/jpeg': '.jpg',
      'image/png': '.png',
      'image/gif': '.gif',
      'image/svg+xml': '.svg',
      'application/pdf': '.pdf',
      'text/plain': '.txt',
      'application/json': '.json',
      'application/zip': '.zip',
    };
    return mimeToExt[mimeType] || '';
  }

  async upload(buffer, filename, contentType, metadata = {}) {
    // Use provided key from metadata, or generate one
    const key = metadata.key || this.generateKey(filename, contentType);
    const filePath = path.join(this.basePath, key);

    await this.ensureDirectoryExists();

    // Ensure the directory for this specific file exists
    const fileDir = path.dirname(filePath);
    await mkdir(fileDir, { recursive: true });

    await writeFile(filePath, buffer);

    return {
      key,
      url: `${this.baseUrl}/${key}`,
      size: buffer.length,
      contentType,
      metadata: {
        ...metadata,
        originalName: filename,
        uploadedAt: new Date().toISOString(),
        storage: 'local',
      },
    };
  }

  async download(key) {
    const filePath = path.join(this.basePath, key);

    try {
      const buffer = await fs.promises.readFile(filePath);
      const stats = await stat(filePath);

      return {
        buffer,
        contentType: this.getContentTypeFromExtension(path.extname(key)),
        size: stats.size,
        lastModified: stats.mtime,
      };
    } catch (error) {
      if (error.code === 'ENOENT') {
        throw new Error(`File not found: ${key}`);
      }
      throw error;
    }
  }

  async delete(key) {
    const filePath = path.join(this.basePath, key);

    try {
      await unlink(filePath);
      return true;
    } catch (error) {
      if (error.code === 'ENOENT') {
        return false; // File already doesn't exist
      }
      throw error;
    }
  }

  async exists(key) {
    const filePath = path.join(this.basePath, key);

    try {
      await stat(filePath);
      return true;
    } catch (error) {
      if (error.code === 'ENOENT') {
        return false;
      }
      throw error;
    }
  }

  async getUrl(key, _expiresIn = 3600) {
    // For local storage, URLs don't expire but we can include timestamp
    const timestamp = Math.floor(Date.now() / 1000);
    return `${this.baseUrl}/${key}?t=${timestamp}`;
  }

  getContentTypeFromExtension(ext) {
    const extToMime = {
      '.jpg': 'image/jpeg',
      '.jpeg': 'image/jpeg',
      '.png': 'image/png',
      '.gif': 'image/gif',
      '.svg': 'image/svg+xml',
      '.pdf': 'application/pdf',
      '.txt': 'text/plain',
      '.json': 'application/json',
      '.zip': 'application/zip',
    };
    return extToMime[ext.toLowerCase()] || 'application/octet-stream';
  }
}

/**
 * S3 Storage Provider (Optional)
 * Only loads if AWS SDK is available and S3 is configured
 */
class S3StorageProvider extends StorageProvider {
  constructor(config = {}) {
    super();
    this.bucket = config.bucket;
    this.region = config.region || 'us-east-1';
    this.accessKeyId = config.accessKeyId;
    this.secretAccessKey = config.secretAccessKey;
    this.endpoint = config.endpoint; // For S3-compatible services
    this.forcePathStyle = config.forcePathStyle || false;

    this.s3Client = null;
    this.s3ClientInitialized = false;
    this.s3ClientInitializationPromise = null;
  }

  async initializeS3Client() {
    if (this.s3ClientInitialized) {
      return;
    }

    if (this.s3ClientInitializationPromise) {
      return this.s3ClientInitializationPromise;
    }

    this.s3ClientInitializationPromise = this._doInitializeS3Client();
    return this.s3ClientInitializationPromise;
  }

  async _doInitializeS3Client() {
    try {
      // Dynamically import AWS SDK v3
      const { S3Client } = await import('@aws-sdk/client-s3');
      const { PutObjectCommand, GetObjectCommand, DeleteObjectCommand, HeadObjectCommand } =
        await import('@aws-sdk/client-s3');
      const { getSignedUrl } = await import('@aws-sdk/s3-request-presigner');

      this.S3Client = S3Client;
      this.PutObjectCommand = PutObjectCommand;
      this.GetObjectCommand = GetObjectCommand;
      this.DeleteObjectCommand = DeleteObjectCommand;
      this.HeadObjectCommand = HeadObjectCommand;
      this.getSignedUrl = getSignedUrl;

      this.s3Client = new S3Client({
        region: this.region,
        credentials: {
          accessKeyId: this.accessKeyId,
          secretAccessKey: this.secretAccessKey,
        },
        endpoint: this.endpoint,
        forcePathStyle: this.forcePathStyle,
      });

      this.s3ClientInitialized = true;
      logger.info('S3 storage provider initialized');
    } catch (error) {
      // Only log AWS SDK unavailability in debug mode to reduce startup noise
      if (process.env.DEBUG_S3 === 'true') {
        console.warn('⚠️  AWS SDK not available, S3 storage disabled:', error.message);
      }
      throw new Error(
        'S3 storage not available. Install @aws-sdk/client-s3 and @aws-sdk/s3-request-presigner packages.',
      );
    }
  }

  generateKey(filename, contentType) {
    const timestamp = Date.now();
    const randomSuffix = crypto.randomBytes(8).toString('hex');
    const extension = path.extname(filename) || this.getExtensionFromMimeType(contentType);
    const baseName = path.basename(filename, extension).replace(/[^a-zA-Z0-9-_]/g, '-');
    const datePrefix = new Date().toISOString().slice(0, 10); // YYYY-MM-DD
    return `uploads/${datePrefix}/${timestamp}-${randomSuffix}-${baseName}${extension}`;
  }

  getExtensionFromMimeType(mimeType) {
    const mimeToExt = {
      'image/jpeg': '.jpg',
      'image/png': '.png',
      'image/gif': '.gif',
      'image/svg+xml': '.svg',
      'application/pdf': '.pdf',
      'text/plain': '.txt',
      'application/json': '.json',
      'application/zip': '.zip',
    };
    return mimeToExt[mimeType] || '';
  }

  async upload(buffer, filename, contentType, metadata = {}) {
    await this.initializeS3Client();

    // Use provided key from metadata, or generate one
    const key = metadata.key || this.generateKey(filename, contentType);

    const command = new this.PutObjectCommand({
      Bucket: this.bucket,
      Key: key,
      Body: buffer,
      ContentType: contentType,
      Metadata: {
        ...metadata,
        originalName: filename,
        uploadedAt: new Date().toISOString(),
      },
    });

    await this.s3Client.send(command);

    return {
      key,
      url: `https://${this.bucket}.s3.${this.region}.amazonaws.com/${key}`,
      size: buffer.length,
      contentType,
      metadata: {
        ...metadata,
        originalName: filename,
        uploadedAt: new Date().toISOString(),
        storage: 's3',
      },
    };
  }

  async download(key) {
    await this.initializeS3Client();

    const command = new this.GetObjectCommand({
      Bucket: this.bucket,
      Key: key,
    });

    try {
      const response = await this.s3Client.send(command);

      // Convert stream to buffer
      const chunks = [];
      const stream = response.Body;

      return new Promise((resolve, reject) => {
        stream.on('data', (chunk) => chunks.push(chunk));
        stream.on('end', () => {
          const buffer = Buffer.concat(chunks);
          resolve({
            buffer,
            contentType: response.ContentType,
            size: response.ContentLength,
            lastModified: response.LastModified,
          });
        });
        stream.on('error', reject);
      });
    } catch (error) {
      if (error.name === 'NoSuchKey') {
        throw new Error(`File not found: ${key}`);
      }
      throw error;
    }
  }

  async delete(key) {
    await this.initializeS3Client();

    const command = new this.DeleteObjectCommand({
      Bucket: this.bucket,
      Key: key,
    });

    try {
      await this.s3Client.send(command);
      return true;
    } catch (error) {
      console.error('Error deleting S3 object:', error);
      return false;
    }
  }

  async exists(key) {
    await this.initializeS3Client();

    const command = new this.HeadObjectCommand({
      Bucket: this.bucket,
      Key: key,
    });

    try {
      await this.s3Client.send(command);
      return true;
    } catch (error) {
      if (error.name === 'NotFound' || error.name === 'NoSuchKey') {
        return false;
      }
      throw error;
    }
  }

  async getUrl(key, expiresIn = 3600) {
    await this.initializeS3Client();

    const command = new this.GetObjectCommand({
      Bucket: this.bucket,
      Key: key,
    });

    return await this.getSignedUrl(this.s3Client, command, { expiresIn });
  }
}

/**
 * Hybrid File Storage Manager
 * Supports different storage providers for different file types/contexts
 */
class FileStorageManager {
  constructor(config = {}) {
    this.config = config;
    this.providers = new Map();
    this.s3Functional = false; // Track if S3 is actually working
    this.hybridRules = config.hybridRules || this.getDefaultHybridRules();
    this.initializeProviders(config);
  }

  getDefaultHybridRules() {
    return {
      // Site assets (logos, branding) - typically stay local for fast access
      siteAssets: {
        provider: 'local',
        patterns: [/^logo\./i, /^favicon\./i, /^brand/i, /^theme/i, /\.css$/i, /\.js$/i],
        maxSize: 10 * 1024 * 1024, // 10MB
        allowedTypes: ['image/*', 'text/css', 'application/javascript'],
      },

      // User profile pictures - can be local or S3
      profileImages: {
        provider: process.env.PROFILE_IMAGES_STORAGE || 'local',
        patterns: [/^profile_/, /^avatar_/],
        maxSize: 5 * 1024 * 1024, // 5MB
        allowedTypes: ['image/*'],
      },

      // Ticket attachments - prefer S3 for scalability and backup
      ticketAttachments: {
        provider: process.env.ATTACHMENTS_STORAGE || 's3',
        fallback: 'local',
        patterns: [/^ticket_/, /^attachment_/],
        maxSize: 100 * 1024 * 1024, // 100MB
        allowedTypes: ['*'], // Allow all file types
      },

      // System backups and exports - prefer S3 for durability
      systemFiles: {
        provider: 's3',
        fallback: 'local',
        patterns: [/^backup_/, /^export_/, /^report_/],
        maxSize: 1024 * 1024 * 1024, // 1GB
        allowedTypes: ['application/*', 'text/*'],
      },

      // Default fallback
      default: {
        provider: process.env.STORAGE_TYPE || 'local',
        maxSize: 50 * 1024 * 1024, // 50MB
        allowedTypes: ['*'],
      },
    };
  }

  initializeProviders(config) {
    // Initialize local provider (always available)
    this.providers.set(
      'local',
      new LocalStorageProvider(
        (config.local && config.local.config) || {
          basePath:
            process.env.LOCAL_STORAGE_BASE_PATH || path.join(process.cwd(), 'apps/api/uploads'),
          baseUrl: process.env.LOCAL_STORAGE_BASE_URL || '/uploads',
        },
      ),
    );

    // Initialize S3 provider if configured
    if (this.needsS3Provider()) {
      try {
        this.providers.set(
          's3',
          new S3StorageProvider(
            (config.s3 && config.s3.config) || {
              bucket: process.env.AWS_S3_BUCKET,
              region: process.env.AWS_REGION || 'us-east-1',
              accessKeyId: process.env.AWS_ACCESS_KEY_ID,
              secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
              endpoint: process.env.AWS_S3_ENDPOINT,
              forcePathStyle: process.env.AWS_S3_FORCE_PATH_STYLE === 'true',
            },
          ),
        );
        this.s3Functional = true; // Assume it works until proven otherwise

        // Test S3 functionality by trying to initialize the client
        const s3Provider = this.providers.get('s3');
        s3Provider.initializeS3Client().catch(() => {
          this.s3Functional = false;
        });

        logger.info('Hybrid storage initialized: local + S3');
      } catch (error) {
        logger.warn('S3 storage failed to initialize, using local fallback:', error.message);
        this.s3Functional = false;
        logger.info('File storage initialized: local (S3 fallback)');
      }
    } else {
      logger.info('File storage initialized: local');
    }
  }

  needsS3Provider() {
    // Check if any rules require S3
    return (
      Object.values(this.hybridRules).some((rule) => rule.provider === 's3') ||
      process.env.STORAGE_TYPE === 's3'
    );
  }

  determineStorageProvider(filename, fileType, context = 'default') {
    // Check for specific context rules first
    if (context && this.hybridRules[context]) {
      const rule = this.hybridRules[context];
      if (rule.provider === 's3' && this.s3Functional && this.providers.has('s3')) {
        return 's3';
      } else if (rule.provider === 's3' && rule.fallback && this.providers.has(rule.fallback)) {
        return rule.fallback;
      } else if (this.providers.has(rule.provider)) {
        return rule.provider;
      }
      // If preferred provider is not available, check for fallback
      if (rule.fallback && this.providers.has(rule.fallback)) {
        return rule.fallback;
      }
    }

    // Check filename patterns
    for (const [_ruleKey, rule] of Object.entries(this.hybridRules)) {
      if (rule.patterns) {
        const matches = rule.patterns.some((pattern) => pattern.test(filename));
        if (matches) {
          if (rule.provider === 's3' && this.s3Functional && this.providers.has('s3')) {
            return 's3';
          } else if (rule.provider === 's3' && rule.fallback && this.providers.has(rule.fallback)) {
            return rule.fallback;
          } else if (this.providers.has(rule.provider)) {
            return rule.provider;
          }
          // Check fallback for pattern rules too
          if (rule.fallback && this.providers.has(rule.fallback)) {
            return rule.fallback;
          }
        }
      }
    }

    // Use default rule
    const defaultRule = this.hybridRules.default;
    if (defaultRule.provider === 's3' && this.s3Functional && this.providers.has('s3')) {
      return 's3';
    } else if (
      defaultRule.provider === 's3' &&
      defaultRule.fallback &&
      this.providers.has(defaultRule.fallback)
    ) {
      return defaultRule.fallback;
    } else if (this.providers.has(defaultRule.provider)) {
      return defaultRule.provider;
    }

    // Final fallback to local
    return 'local';
  }

  validateFile(filename, fileSize, contentType, context = 'default') {
    const rule = this.hybridRules[context] || this.hybridRules.default;

    // Check file size
    if (rule.maxSize && fileSize > rule.maxSize) {
      throw new Error(`File size ${fileSize} exceeds limit ${rule.maxSize} for ${context}`);
    }

    // Check content type
    if (rule.allowedTypes && !rule.allowedTypes.includes('*')) {
      const isAllowed = rule.allowedTypes.some((allowedType) => {
        if (allowedType.endsWith('/*')) {
          const baseType = allowedType.slice(0, -2);
          return contentType.startsWith(baseType);
        }
        return contentType === allowedType;
      });

      if (!isAllowed) {
        throw new Error(`File type ${contentType} not allowed for ${context}`);
      }
    }
  }

  async upload(file, metadata = {}) {
    if (!file) {
      throw new Error('No file provided for upload');
    }

    // Handle both Buffer and File objects
    let buffer, filename, contentType;

    if (Buffer.isBuffer(file)) {
      // Raw buffer
      buffer = file;
      filename = metadata.filename || 'unknown';
      contentType = metadata.contentType || 'application/octet-stream';
    } else if (file.buffer) {
      // Multer file object
      buffer = file.buffer;
      filename = file.originalname;
      contentType = file.mimetype;
    } else {
      throw new Error('Invalid file format');
    }

    // Validate file
    const context = metadata.context || 'default';
    this.validateFile(filename, buffer.length, contentType, context);

    // Determine storage provider based on hybrid rules
    const providerType = this.determineStorageProvider(filename, contentType, context);
    const provider = this.providers.get(providerType);

    if (!provider) {
      throw new Error(`Storage provider ${providerType} not available`);
    }

    // Upload with enhanced metadata
    const enhancedMetadata = {
      ...metadata,
      context,
      storageProvider: providerType,
      originalSize: buffer.length,
      uploadedAt: new Date().toISOString(),
    };

    const result = await provider.upload(buffer, filename, contentType, enhancedMetadata);

    // Add hybrid storage information to result
    return {
      ...result,
      storageProvider: providerType,
      context,
      hybridInfo: {
        rule: this.hybridRules[context] || this.hybridRules.default,
        availableProviders: Array.from(this.providers.keys()),
      },
    };
  }

  async download(key, storageProvider = null) {
    // If storage provider is specified, use it; otherwise try to determine from key or use default
    if (storageProvider && this.providers.has(storageProvider)) {
      return await this.providers.get(storageProvider).download(key);
    }

    // Try to determine provider from key format or metadata
    const provider = this.determineProviderForKey(key);
    if (provider && this.providers.has(provider)) {
      return await this.providers.get(provider).download(key);
    }

    // Fallback: try all providers
    for (const [_providerName, providerInstance] of this.providers) {
      try {
        const exists = await providerInstance.exists(key);
        if (exists) {
          return await providerInstance.download(key);
        }
      } catch {
        // Continue to next provider
        continue;
      }
    }

    throw new Error(`File not found with key: ${key}`);
  }

  async delete(key, storageProvider = null) {
    if (storageProvider && this.providers.has(storageProvider)) {
      return await this.providers.get(storageProvider).delete(key);
    }

    // Try all providers for deletion
    let deleted = false;
    for (const [_providerName, providerInstance] of this.providers) {
      try {
        const exists = await providerInstance.exists(key);
        if (exists) {
          await providerInstance.delete(key);
          deleted = true;
        }
      } catch {
        // Continue to next provider
        continue;
      }
    }

    return deleted;
  }

  async exists(key, storageProvider = null) {
    if (storageProvider && this.providers.has(storageProvider)) {
      return await this.providers.get(storageProvider).exists(key);
    }

    // Check all providers
    for (const [_providerName, providerInstance] of this.providers) {
      try {
        const exists = await providerInstance.exists(key);
        if (exists) {
          return true;
        }
      } catch {
        // Continue to next provider
        continue;
      }
    }

    return false;
  }

  async getUrl(key, expiresIn = 3600, storageProvider = null) {
    if (storageProvider && this.providers.has(storageProvider)) {
      return await this.providers.get(storageProvider).getUrl(key, expiresIn);
    }

    // Try to find the file in available providers
    for (const [_providerName, providerInstance] of this.providers) {
      try {
        const exists = await providerInstance.exists(key);
        if (exists) {
          return await providerInstance.getUrl(key, expiresIn);
        }
      } catch {
        // Continue to next provider
        continue;
      }
    }

    throw new Error(`File not found with key: ${key}`);
  }

  determineProviderForKey(key) {
    // Simple heuristic based on key patterns
    if (key.includes('uploads/')) {
      return 's3';
    }
    return 'local';
  }

  getHybridRules() {
    return this.hybridRules;
  }

  getAvailableProviders() {
    return Array.from(this.providers.keys());
  }

  isProviderAvailable(providerName) {
    return this.providers.has(providerName);
  }

  async isProviderFunctional(providerName) {
    if (!this.providers.has(providerName)) {
      return false;
    }

    const provider = this.providers.get(providerName);

    // For S3 provider, test if it's actually functional
    if (providerName === 's3') {
      try {
        // Try to test S3 connectivity without making actual calls
        if (!provider.s3Client) {
          await provider.initializeS3Client();
        }
        return true;
      } catch {
        return false;
      }
    }

    return true;
  }

  getStorageInfo() {
    return {
      providers: this.getAvailableProviders(),
      hybridRules: this.hybridRules,
      defaultProvider: this.hybridRules.default.provider,
    };
  }
}

// Export storage manager instance
const storageConfig = {
  storageType: process.env.STORAGE_TYPE || 'local',
  local: {
    basePath: process.env.STORAGE_LOCAL_PATH || path.join(process.cwd(), 'uploads'),
    baseUrl: process.env.STORAGE_LOCAL_URL || '/uploads',
  },
  s3: {
    bucket: process.env.S3_BUCKET,
    region: process.env.S3_REGION || 'us-east-1',
    accessKeyId: process.env.S3_ACCESS_KEY_ID,
    secretAccessKey: process.env.S3_SECRET_ACCESS_KEY,
    endpoint: process.env.S3_ENDPOINT,
    forcePathStyle: process.env.S3_FORCE_PATH_STYLE === 'true',
  },
};

const fileStorage = new FileStorageManager(storageConfig);

export default fileStorage;
export { FileStorageManager, LocalStorageProvider, S3StorageProvider, StorageProvider };
