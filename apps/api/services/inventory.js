// Inventory Service - Import Validation and Rollback Logic
// Comprehensive service for managing inventory assets with validation, encryption, and Helix integration

import { parse as parseCsv } from 'csv-parse/sync';
import { encrypt, decrypt } from '../utils/encryption.js';
import { logger } from '../logger.js';
import { v4 as uuidv4 } from 'uuid';
// import { PrismaClient } from '../../../prisma/generated/core/index.js';
import HelixKioskIntegrationService from './helixKioskIntegration.js';

async function getPrisma() {
  if (process.env.PRISMA_DISABLED === 'true') return null;
  try {
    const mod = await import('../../../prisma/generated/core/index.js');
    const PrismaClient = mod.PrismaClient;
    return new PrismaClient({ datasources: { core_db: { url: process.env.CORE_DATABASE_URL || process.env.DATABASE_URL } } });
  } catch (e) {
    logger.warn('Prisma unavailable in InventoryService', { error: e?.message });
    return null;
  }
}

let prisma;
(async ()=>{ prisma = await getPrisma(); })();

// Validation rules for asset fields
const VALIDATION_RULES = {
  asset_tag: {
    required: true,
    minLength: 1,
    maxLength: 50,
    pattern: /^[A-Z0-9\-_]+$/i,
    unique: true
  },
  serial_number: {
    required: false,
    minLength: 3,
    maxLength: 100,
    encrypted: true
  },
  model: {
    required: false,
    maxLength: 100
  },
  department: {
    required: false,
    maxLength: 100
  },
  status: {
    required: true,
    allowedValues: ['active', 'inactive', 'maintenance', 'disposed', 'missing', 'retired']
  },
  warranty_expiry: {
    required: false,
    type: 'date',
    futureOnly: false
  },
  purchase_date: {
    required: false,
    type: 'date',
    pastOnly: true
  }
};

// Encrypted fields that need special handling
const ENCRYPTED_FIELDS = [
  'serial_number',
  'warranty_info',
  'purchase_info',
  'maintenance_notes'
];

export class InventoryService {
  constructor() {
    this.db = prisma;
  }

  /**
   * Import assets from CSV with comprehensive validation
   */
  async importAssets(csvData, filename, importedBy, options = {}) {
    const batchId = uuidv4();
    let importBatch = null;
    
    try {
      logger.info(`Starting asset import: ${filename} by ${importedBy}`);
      
      // Parse CSV data
      const records = this.parseCsvData(csvData);
      
      // Create import batch record
      importBatch = await this.createImportBatch(batchId, filename, importedBy, records.length);
      
      // Validate all records
      const validationResults = await this.validateRecords(records, batchId);
      
      // Check if validation passed
      if (validationResults.hasErrors) {
        await this.updateBatchStatus(batchId, 'invalid', validationResults.errorSummary);
        return {
          success: false,
          batchId,
          errors: validationResults.errors,
          warnings: validationResults.warnings,
          totalRecords: records.length,
          validRecords: 0,
          invalidRecords: validationResults.errorCount
        };
      }
      
      // Import valid records
      const importResults = await this.importValidatedRecords(records, batchId, validationResults.validatedData);
      
      // Update batch status
      await this.updateBatchStatus(batchId, 'valid', null, importResults.successCount, importResults.failureCount);
      
      logger.info(`Asset import completed: ${importResults.successCount} successful, ${importResults.failureCount} failed`);
      
      return {
        success: true,
        batchId,
        totalRecords: records.length,
        validRecords: importResults.successCount,
        invalidRecords: importResults.failureCount,
        warnings: validationResults.warnings,
        importedAssets: importResults.importedAssets
      };
      
    } catch (error) {
      logger.error('Asset import failed:', error);
      
      if (importBatch) {
        await this.updateBatchStatus(batchId, 'failed', error.message);
      }
      
      throw new Error(`Import failed: ${error.message}`);
    }
  }

  /**
   * Parse CSV data and return records
   */
  parseCsvData(csvData) {
    try {
      const records = parseCsv(csvData, {
        columns: true,
        skip_empty_lines: true,
        trim: true,
        bom: true
      });
      
      return records;
    } catch (error) {
      throw new Error(`CSV parsing failed: ${error.message}`);
    }
  }

  /**
   * Create import batch record
   */
  async createImportBatch(batchId, filename, importedBy, totalRecords) {
    return await this.db.$executeRaw`
      INSERT INTO asset_import_batches (id, filename, imported_by, total_records)
      VALUES (${batchId}, ${filename}, ${importedBy}, ${totalRecords})
    `;
  }

  /**
   * Update import batch status
   */
  async updateBatchStatus(batchId, status, errors = null, successCount = 0, failureCount = 0) {
    return await this.db.$executeRaw`
      UPDATE asset_import_batches 
      SET validation_status = ${status},
          validation_errors = ${errors},
          successful_records = ${successCount},
          failed_records = ${failureCount}
      WHERE id = ${batchId}
    `;
  }

  /**
   * Comprehensive record validation
   */
  async validateRecords(records, batchId) {
    const errors = [];
    const warnings = [];
    const validatedData = [];
    let errorCount = 0;
    let hasErrors = false;

    // Get existing asset tags for uniqueness validation
    const existingAssetTags = await this.getExistingAssetTags();
    const newAssetTags = new Set();

    for (let i = 0; i < records.length; i++) {
      const record = records[i];
      const rowNumber = i + 1;
      const rowErrors = [];
      const rowWarnings = [];

      // Validate each field according to rules
      for (const [fieldName, rules] of Object.entries(VALIDATION_RULES)) {
        const value = record[fieldName];
        const fieldErrors = this.validateField(fieldName, value, rules, {
          existingAssetTags,
          newAssetTags,
          rowNumber
        });

        if (fieldErrors.length > 0) {
          rowErrors.push(...fieldErrors);
        }
      }

      // Additional business logic validations
      const businessValidationErrors = this.validateBusinessLogic(record, rowNumber);
      rowErrors.push(...businessValidationErrors);

      // Track unique asset tags within this import
      if (record.asset_tag) {
        if (newAssetTags.has(record.asset_tag.toUpperCase())) {
          rowErrors.push({
            row: rowNumber,
            field: 'asset_tag',
            level: 'error',
            message: `Duplicate asset tag within import: ${record.asset_tag}`
          });
        } else {
          newAssetTags.add(record.asset_tag.toUpperCase());
        }
      }

      // Log validation issues
      for (const error of rowErrors) {
        await this.logValidationIssue(batchId, null, rowNumber, error.level, error.field, error.message, record);
        if (error.level === 'error') {
          errorCount++;
          hasErrors = true;
        }
      }

      for (const warning of rowWarnings) {
        await this.logValidationIssue(batchId, null, rowNumber, 'warning', warning.field, warning.message, record);
      }

      errors.push(...rowErrors);
      warnings.push(...rowWarnings);

      // Prepare validated data for import (only if no errors)
      if (rowErrors.filter(e => e.level === 'error').length === 0) {
        validatedData.push(this.prepareRecordForImport(record, rowNumber));
      }
    }

    return {
      hasErrors,
      errorCount,
      errors,
      warnings,
      validatedData,
      errorSummary: hasErrors ? `${errorCount} validation errors found` : null
    };
  }

  /**
   * Validate individual field according to rules
   */
  validateField(fieldName, value, rules, context) {
    const errors = [];

    // Required field validation
    if (rules.required && (!value || value.toString().trim() === '')) {
      errors.push({
        field: fieldName,
        level: 'error',
        message: `${fieldName} is required`
      });
      return errors; // Skip other validations if required field is missing
    }

    // Skip further validation if field is empty and not required
    if (!value || value.toString().trim() === '') {
      return errors;
    }

    const stringValue = value.toString().trim();

    // Length validations
    if (rules.minLength && stringValue.length < rules.minLength) {
      errors.push({
        field: fieldName,
        level: 'error',
        message: `${fieldName} must be at least ${rules.minLength} characters`
      });
    }

    if (rules.maxLength && stringValue.length > rules.maxLength) {
      errors.push({
        field: fieldName,
        level: 'error',
        message: `${fieldName} must not exceed ${rules.maxLength} characters`
      });
    }

    // Pattern validation
    if (rules.pattern && !rules.pattern.test(stringValue)) {
      errors.push({
        field: fieldName,
        level: 'error',
        message: `${fieldName} format is invalid`
      });
    }

    // Allowed values validation
    if (rules.allowedValues && !rules.allowedValues.includes(stringValue.toLowerCase())) {
      errors.push({
        field: fieldName,
        level: 'error',
        message: `${fieldName} must be one of: ${rules.allowedValues.join(', ')}`
      });
    }

    // Date validation
    if (rules.type === 'date') {
      const date = new Date(stringValue);
      if (isNaN(date.getTime())) {
        errors.push({
          field: fieldName,
          level: 'error',
          message: `${fieldName} must be a valid date`
        });
      } else {
        const today = new Date();
        if (rules.futureOnly && date <= today) {
          errors.push({
            field: fieldName,
            level: 'error',
            message: `${fieldName} must be a future date`
          });
        }
        if (rules.pastOnly && date > today) {
          errors.push({
            field: fieldName,
            level: 'error',
            message: `${fieldName} must be a past or current date`
          });
        }
      }
    }

    // Uniqueness validation
    if (rules.unique && fieldName === 'asset_tag') {
      const upperValue = stringValue.toUpperCase();
      if (context.existingAssetTags.has(upperValue)) {
        errors.push({
          field: fieldName,
          level: 'error',
          message: `Asset tag ${stringValue} already exists in database`
        });
      }
    }

    return errors;
  }

  /**
   * Business logic validation
   */
  validateBusinessLogic(record, rowNumber) {
    const errors = [];

    // Warranty expiry should be after purchase date
    if (record.purchase_date && record.warranty_expiry) {
      const purchaseDate = new Date(record.purchase_date);
      const warrantyDate = new Date(record.warranty_expiry);
      
      if (!isNaN(purchaseDate.getTime()) && !isNaN(warrantyDate.getTime())) {
        if (warrantyDate <= purchaseDate) {
          errors.push({
            field: 'warranty_expiry',
            level: 'error',
            message: 'Warranty expiry date must be after purchase date'
          });
        }
      }
    }

    // Status-specific validations
    if (record.status === 'disposed' || record.status === 'retired') {
      if (record.assigned_to_user_id) {
        errors.push({
          field: 'status',
          level: 'warning',
          message: 'Asset marked as disposed/retired but still assigned to user'
        });
      }
    }

    return errors;
  }

  /**
   * Get existing asset tags for uniqueness validation
   */
  async getExistingAssetTags() {
    const assets = await this.db.$queryRaw`
      SELECT UPPER(asset_tag) as asset_tag FROM inventory_assets
    `;
    
    return new Set(assets.map(a => a.asset_tag));
  }

  /**
   * Prepare record for import with encryption
   */
  prepareRecordForImport(record, rowNumber) {
    const prepared = { ...record };

    // Encrypt sensitive fields
    for (const field of ENCRYPTED_FIELDS) {
      if (prepared[field]) {
        try {
          prepared[`${field}_enc`] = encrypt(prepared[field]);
          delete prepared[field]; // Remove unencrypted version
        } catch (error) {
          logger.error(`Failed to encrypt field ${field} for row ${rowNumber}:`, error);
          throw new Error(`Encryption failed for ${field}`);
        }
      }
    }

    // Convert date strings to Date objects
    ['purchase_date', 'warranty_expiry'].forEach(field => {
      if (prepared[field]) {
        prepared[field] = new Date(prepared[field]);
      }
    });

    // Ensure asset_tag is uppercase
    if (prepared.asset_tag) {
      prepared.asset_tag = prepared.asset_tag.toUpperCase();
    }

    return prepared;
  }

  /**
   * Import validated records to database
   */
  async importValidatedRecords(originalRecords, batchId, validatedRecords) {
    const importedAssets = [];
    let successCount = 0;
    let failureCount = 0;

    for (const record of validatedRecords) {
      try {
        // Add batch metadata
        record.import_batch_id = batchId;
        record.import_source = 'csv_import';
        record.import_validated = true;

        // Insert asset
        const asset = await this.db.inventoryAsset.create({
          data: record
        });

        importedAssets.push(asset);
        successCount++;

        logger.debug(`Imported asset: ${record.asset_tag}`);

      } catch (error) {
        failureCount++;
        logger.error(`Failed to import asset ${record.asset_tag}:`, error);
        
        // Log the specific import error
        await this.logValidationIssue(
          batchId,
          null,
          null,
          'error',
          'import',
          `Import failed: ${error.message}`,
          record
        );
      }
    }

    return { importedAssets, successCount, failureCount };
  }

  /**
   * Log validation issue
   */
  async logValidationIssue(batchId, assetId, rowNumber, level, fieldName, message, rawData) {
    try {
      await this.db.$executeRaw`
        INSERT INTO asset_validation_logs (batch_id, asset_id, row_number, validation_level, field_name, message, raw_data)
        VALUES (${batchId}, ${assetId}, ${rowNumber || 0}, ${level}, ${fieldName}, ${message}, ${JSON.stringify(rawData)}::jsonb)
      `;
    } catch (error) {
      logger.error('Failed to log validation issue:', error);
    }
  }

  /**
   * Rollback an entire import batch
   */
  async rollbackImport(batchId, rolledBackBy) {
    try {
      logger.info(`Starting rollback for batch: ${batchId}`);

      // Get the batch info
      const batch = await this.db.$queryRaw`
        SELECT * FROM asset_import_batches WHERE id = ${batchId}
      `;

      if (batch.length === 0) {
        throw new Error('Import batch not found');
      }

      if (batch[0].validation_status === 'rolled_back') {
        throw new Error('Import batch already rolled back');
      }

      // Get all assets imported in this batch
      const assetsToDelete = await this.db.$queryRaw`
        SELECT id, asset_tag FROM inventory_assets WHERE import_batch_id = ${batchId}
      `;

      const deletedAssets = [];

      // Delete assets in transaction
      await this.db.$transaction(async (tx) => {
        for (const asset of assetsToDelete) {
          // Delete related records first (foreign key constraints)
          await tx.$executeRaw`DELETE FROM asset_ticket_history WHERE asset_id = ${asset.id}`;
          await tx.$executeRaw`DELETE FROM asset_warranty_alerts WHERE asset_id = ${asset.id}`;
          await tx.$executeRaw`DELETE FROM asset_assignments WHERE asset_id = ${asset.id}`;
          await tx.$executeRaw`DELETE FROM asset_status_logs WHERE asset_id = ${asset.id}`;
          await tx.$executeRaw`DELETE FROM kiosk_asset_registry WHERE asset_id = ${asset.id}`;
          
          // Delete the asset
          await tx.$executeRaw`DELETE FROM inventory_assets WHERE id = ${asset.id}`;
          
          deletedAssets.push(asset.asset_tag);
        }

        // Update batch status
        await tx.$executeRaw`
          UPDATE asset_import_batches 
          SET validation_status = 'rolled_back',
              rollback_date = CURRENT_TIMESTAMP,
              rollback_by = ${rolledBackBy}
          WHERE id = ${batchId}
        `;
      });

      logger.info(`Rollback completed: ${deletedAssets.length} assets deleted`);

      return {
        success: true,
        deletedAssets: deletedAssets,
        deletedCount: deletedAssets.length
      };

    } catch (error) {
      logger.error('Rollback failed:', error);
      throw new Error(`Rollback failed: ${error.message}`);
    }
  }

  /**
   * Get import batch status and details
   */
  async getImportBatchDetails(batchId) {
    const batch = await this.db.$queryRaw`
      SELECT * FROM asset_import_batches WHERE id = ${batchId}
    `;

    if (batch.length === 0) {
      throw new Error('Import batch not found');
    }

    const validationLogs = await this.db.$queryRaw`
      SELECT * FROM asset_validation_logs 
      WHERE batch_id = ${batchId}
      ORDER BY row_number, validation_level DESC
    `;

    const importedAssets = await this.db.$queryRaw`
      SELECT id, asset_tag, status, created_at 
      FROM inventory_assets 
      WHERE import_batch_id = ${batchId}
      ORDER BY created_at
    `;

    return {
      batch: batch[0],
      validationLogs,
      importedAssets
    };
  }

  /**
   * List all import batches with summary
   */
  async listImportBatches(limit = 50, offset = 0) {
    const batches = await this.db.$queryRaw`
      SELECT 
        id,
        filename,
        imported_by,
        import_date,
        total_records,
        successful_records,
        failed_records,
        validation_status,
        rollback_date,
        rollback_by
      FROM asset_import_batches 
      ORDER BY import_date DESC
      LIMIT ${limit} OFFSET ${offset}
    `;

    return batches;
  }

  /**
   * Encrypt sensitive asset field
   */
  encryptAssetField(value) {
    if (!value) return null;
    try {
      return encrypt(value.toString());
    } catch (error) {
      logger.error('Failed to encrypt asset field:', error);
      throw new Error('Encryption failed');
    }
  }

  /**
   * Decrypt sensitive asset field
   */
  decryptAssetField(encryptedValue) {
    if (!encryptedValue) return null;
    try {
      return decrypt(encryptedValue);
    } catch (error) {
      logger.error('Failed to decrypt asset field:', error);
      return '[DECRYPTION_FAILED]';
    }
  }

  /**
   * Sync asset with kiosk registry and Helix APIs
   */
  async syncAssetWithKiosk(assetId, kioskId, metadata = {}) {
    try {
      const asset = await this.db.inventoryAsset.findUnique({
        where: { id: assetId }
      });

      if (!asset) {
        throw new Error('Asset not found');
      }

      // Encrypt sensitive metadata for kiosk registry
      const encryptedMetadata = metadata ? this.encryptAssetField(JSON.stringify(metadata)) : null;

      // Upsert kiosk asset registry entry
      await this.db.$executeRaw`
        INSERT INTO kiosk_asset_registry (kiosk_id, asset_id, encrypted_metadata, helix_sync_status)
        VALUES (${kioskId}, ${assetId}, ${encryptedMetadata}, 'pending')
        ON CONFLICT (kiosk_id, asset_id) 
        DO UPDATE SET 
          encrypted_metadata = EXCLUDED.encrypted_metadata,
          helix_sync_status = 'pending',
          last_check_in = CURRENT_TIMESTAMP
      `;

      // Integrate with Helix APIs for identity sync
      let helixSyncResult = null;
      let finalSyncStatus = 'failed';
      
      try {
        // Use the Helix Kiosk Integration Service to sync asset and kiosk identities
        helixSyncResult = await HelixKioskIntegrationService.syncWithHelix(
          kioskId, 
          assetId, 
          asset, 
          metadata
        );
        
        if (helixSyncResult.status === 'synced') {
          finalSyncStatus = 'synced';
          logger.info(`Asset ${asset.asset_tag} successfully synced with Helix for kiosk ${kioskId}`);
        } else if (helixSyncResult.status === 'skipped') {
          finalSyncStatus = 'skipped';
          logger.warn(`Helix sync skipped for asset ${asset.asset_tag}: ${helixSyncResult.reason}`);
        } else {
          throw new Error(helixSyncResult.error || 'Unknown Helix sync error');
        }
      } catch (helixError) {
        logger.error(`Helix sync failed for asset ${asset.asset_tag}:`, helixError);
        
        // Update registry with failed status and error details
        await this.db.$executeRaw`
          UPDATE kiosk_asset_registry 
          SET helix_sync_status = 'failed',
              helix_error_message = ${helixError.message},
              helix_last_sync = CURRENT_TIMESTAMP
          WHERE kiosk_id = ${kioskId} AND asset_id = ${assetId}
        `;
        
        // Log the failure for retry processing
        await this.logHelixSyncFailure(kioskId, assetId, helixError.message, {
          asset_tag: asset.asset_tag,
          retry_count: 0
        });
        
        // Don't throw error here - asset registration should succeed even if Helix sync fails
        finalSyncStatus = 'failed';
      }

      // Update registry with final sync status
      if (finalSyncStatus === 'synced') {
        await this.db.$executeRaw`
          UPDATE kiosk_asset_registry 
          SET helix_sync_status = 'synced',
              helix_last_sync = CURRENT_TIMESTAMP,
              helix_error_message = NULL
          WHERE kiosk_id = ${kioskId} AND asset_id = ${assetId}
        `;
      } else if (finalSyncStatus === 'skipped') {
        await this.db.$executeRaw`
          UPDATE kiosk_asset_registry 
          SET helix_sync_status = 'skipped',
              helix_last_sync = CURRENT_TIMESTAMP,
              helix_error_message = ${helixSyncResult?.reason || 'API key not configured'}
          WHERE kiosk_id = ${kioskId} AND asset_id = ${assetId}
        `;
      }

      logger.info(`Asset ${asset.asset_tag} synced with kiosk ${kioskId}`);

      return {
        success: true,
        asset: asset.asset_tag,
        kioskId,
        syncStatus: finalSyncStatus,
        helixSync: helixSyncResult,
        metadata: metadata
      };

    } catch (error) {
      logger.error('Failed to sync asset with kiosk:', error);
      
      // Update registry with error
      if (kioskId && assetId) {
        await this.db.$executeRaw`
          UPDATE kiosk_asset_registry 
          SET helix_sync_status = 'failed',
              helix_error_message = ${error.message}
          WHERE kiosk_id = ${kioskId} AND asset_id = ${assetId}
        `;
      }

      throw error;
    }
  }

  /**
   * Generate warranty alerts for assets
   */
  async generateWarrantyAlerts() {
    try {
      // Find assets with warranties expiring soon that don't have recent alerts
      const assetsNeedingAlerts = await this.db.$queryRaw`
        SELECT 
          a.id,
          a.asset_tag,
          a.warranty_expiry,
          a.warranty_alert_days,
          EXTRACT(DAY FROM a.warranty_expiry - CURRENT_DATE) as days_remaining
        FROM inventory_assets a
        WHERE a.warranty_expiry IS NOT NULL
          AND a.warranty_expiry > CURRENT_DATE
          AND a.warranty_alert_enabled = true
          AND (a.last_warranty_alert_sent IS NULL 
               OR a.last_warranty_alert_sent < CURRENT_DATE - INTERVAL '7 days')
          AND a.warranty_expiry <= CURRENT_DATE + INTERVAL '1 day' * COALESCE(a.warranty_alert_days, 30)
      `;

      const alertsCreated = [];

      for (const asset of assetsNeedingAlerts) {
        const alertType = asset.days_remaining <= 7 ? 'critical' : 
                         asset.days_remaining <= 14 ? 'warning' : 'info';

        // Create warranty alert
        await this.db.$executeRaw`
          INSERT INTO asset_warranty_alerts (asset_id, alert_type, expiry_date, days_remaining)
          VALUES (${asset.id}, ${alertType}, ${asset.warranty_expiry}, ${asset.days_remaining})
          ON CONFLICT DO NOTHING
        `;

        // Update last alert sent timestamp
        await this.db.$executeRaw`
          UPDATE inventory_assets 
          SET last_warranty_alert_sent = CURRENT_TIMESTAMP
          WHERE id = ${asset.id}
        `;

        alertsCreated.push({
          assetTag: asset.asset_tag,
          alertType,
          daysRemaining: asset.days_remaining
        });
      }

      logger.info(`Generated ${alertsCreated.length} warranty alerts`);
      return alertsCreated;

    } catch (error) {
      logger.error('Failed to generate warranty alerts:', error);
      throw error;
    }
  }

  /**
   * Encrypt sensitive asset fields for secure storage
   * @param {Object} assetData - Asset data with sensitive fields
   * @returns {Object} Asset data with encrypted sensitive fields
   */
  async encryptSensitiveFields(assetData) {
    try {
      const encryptedData = { ...assetData };
      
      // Encrypt sensitive fields if they exist
      if (assetData.serial_number) {
        encryptedData.serialNumberEnc = encrypt(assetData.serial_number);
        delete encryptedData.serial_number; // Remove plaintext
      }
      
      if (assetData.warranty_info) {
        encryptedData.warrantyInfoEnc = encrypt(JSON.stringify(assetData.warranty_info));
        delete encryptedData.warranty_info;
      }
      
      if (assetData.purchase_info) {
        encryptedData.purchaseInfoEnc = encrypt(JSON.stringify(assetData.purchase_info));
        delete encryptedData.purchase_info;
      }
      
      if (assetData.maintenance_notes) {
        encryptedData.maintenanceNotesEnc = encrypt(assetData.maintenance_notes);
        delete encryptedData.maintenance_notes;
      }
      
      return encryptedData;
    } catch (error) {
      logger.error('Error encrypting sensitive fields:', error);
      throw new Error('Failed to encrypt sensitive asset data');
    }
  }

  /**
   * Log Helix sync failure for retry processing
   */
  async logHelixSyncFailure(kioskId, assetId, errorMessage, metadata = {}) {
    try {
      await this.db.$executeRaw`
        INSERT INTO helix_sync_failures (kiosk_id, asset_id, error_message, metadata, retry_count, next_retry_at)
        VALUES (
          ${kioskId}, 
          ${assetId}, 
          ${errorMessage}, 
          ${JSON.stringify(metadata)}::jsonb, 
          0, 
          ${new Date(Date.now() + 5 * 60 * 1000)} -- 5 minute delay for first retry
        )
        ON CONFLICT (kiosk_id, asset_id) 
        DO UPDATE SET 
          error_message = EXCLUDED.error_message,
          metadata = EXCLUDED.metadata,
          retry_count = helix_sync_failures.retry_count + 1,
          next_retry_at = CASE 
            WHEN helix_sync_failures.retry_count < 3 THEN ${new Date(Date.now() + Math.pow(2, this.db.helix_sync_failures.retry_count) * 5 * 60 * 1000)}
            ELSE ${new Date(Date.now() + 24 * 60 * 60 * 1000)} -- 24 hour delay after 3 failures
          END,
          updated_at = CURRENT_TIMESTAMP
      `;
    } catch (error) {
      logger.error('Failed to log Helix sync failure:', error);
    }
  }

  /**
   * Retry failed Helix synchronizations
   */
  async retryFailedHelixSyncs(options = {}) {
    const maxRetries = options.maxRetries || 50;
    
    try {
      logger.info('Starting retry of failed Helix synchronizations');

      // Get failed syncs that are ready for retry
      const failedSyncs = await this.db.$queryRaw`
        SELECT 
          hsf.*,
          ia.asset_tag,
          ia.model,
          ia.status,
          ia.department
        FROM helix_sync_failures hsf
        JOIN inventory_assets ia ON hsf.asset_id = ia.id
        WHERE hsf.next_retry_at <= CURRENT_TIMESTAMP
          AND hsf.retry_count < 5 -- Maximum 5 retries
        ORDER BY hsf.next_retry_at ASC
        LIMIT ${maxRetries}
      `;

      const results = {
        total: failedSyncs.length,
        successful: 0,
        failed: 0,
        errors: []
      };

      for (const failedSync of failedSyncs) {
        try {
          const asset = await this.db.inventoryAsset.findUnique({
            where: { id: failedSync.asset_id }
          });

          if (!asset) {
            logger.warn(`Asset ${failedSync.asset_id} no longer exists, removing from retry queue`);
            await this.removeFromRetryQueue(failedSync.kiosk_id, failedSync.asset_id);
            continue;
          }

          // Decrypt metadata if needed
          let metadata = {};
          if (failedSync.metadata) {
            metadata = typeof failedSync.metadata === 'string' 
              ? JSON.parse(failedSync.metadata) 
              : failedSync.metadata;
          }

          // Attempt sync with Helix
          const syncResult = await HelixKioskIntegrationService.syncWithHelix(
            failedSync.kiosk_id,
            failedSync.asset_id,
            asset,
            metadata
          );

          if (syncResult.status === 'synced') {
            // Success - update registry and remove from retry queue
            await this.db.$executeRaw`
              UPDATE kiosk_asset_registry 
              SET helix_sync_status = 'synced',
                  helix_last_sync = CURRENT_TIMESTAMP,
                  helix_error_message = NULL
              WHERE kiosk_id = ${failedSync.kiosk_id} AND asset_id = ${failedSync.asset_id}
            `;

            await this.removeFromRetryQueue(failedSync.kiosk_id, failedSync.asset_id);
            results.successful++;
            
            logger.info(`Retry successful for asset ${asset.asset_tag} on kiosk ${failedSync.kiosk_id}`);
          } else {
            throw new Error(syncResult.error || 'Unknown sync error');
          }

        } catch (retryError) {
          logger.error(`Retry failed for asset ${failedSync.asset_id}:`, retryError);
          
          // Update retry count and next retry time
          await this.logHelixSyncFailure(
            failedSync.kiosk_id, 
            failedSync.asset_id, 
            retryError.message,
            failedSync.metadata
          );

          results.failed++;
          results.errors.push({
            assetId: failedSync.asset_id,
            assetTag: failedSync.asset_tag,
            kioskId: failedSync.kiosk_id,
            error: retryError.message
          });
        }
      }

      logger.info(`Helix sync retry completed: ${results.successful} successful, ${results.failed} failed`);
      return results;

    } catch (error) {
      logger.error('Failed to process Helix sync retries:', error);
      throw error;
    }
  }

  /**
   * Remove a sync failure from the retry queue
   */
  async removeFromRetryQueue(kioskId, assetId) {
    try {
      await this.db.$executeRaw`
        DELETE FROM helix_sync_failures 
        WHERE kiosk_id = ${kioskId} AND asset_id = ${assetId}
      `;
    } catch (error) {
      logger.error('Failed to remove from retry queue:', error);
    }
  }

  /**
   * Assign kiosk to organizational unit (org, department, floor, room)
   */
  async assignKioskToOrganization(kioskId, organizationData, assignedBy) {
    try {
      logger.info(`Assigning kiosk ${kioskId} to organizational unit`);

      // Validate kiosk exists
      const kiosk = await this.db.kiosk.findUnique({
        where: { id: kioskId }
      });

      if (!kiosk) {
        throw new Error(`Kiosk with ID ${kioskId} not found`);
      }

      // Validate organization data
      const validatedOrgData = this.validateOrganizationData(organizationData);

      // Create or update kiosk organization assignment
      const assignment = await this.db.$executeRaw`
        INSERT INTO kiosk_organization_assignments (
          kiosk_id, 
          organization_id, 
          department, 
          floor, 
          room, 
          building,
          assigned_by,
          assignment_metadata
        )
        VALUES (
          ${kioskId},
          ${validatedOrgData.organizationId},
          ${validatedOrgData.department},
          ${validatedOrgData.floor},
          ${validatedOrgData.room},
          ${validatedOrgData.building},
          ${assignedBy},
          ${JSON.stringify(validatedOrgData.metadata || {})}::jsonb
        )
        ON CONFLICT (kiosk_id) 
        DO UPDATE SET 
          organization_id = EXCLUDED.organization_id,
          department = EXCLUDED.department,
          floor = EXCLUDED.floor,
          room = EXCLUDED.room,
          building = EXCLUDED.building,
          assigned_by = EXCLUDED.assigned_by,
          assignment_metadata = EXCLUDED.assignment_metadata,
          updated_at = CURRENT_TIMESTAMP
        RETURNING *
      `;

      // Update kiosk metadata if needed
      if (validatedOrgData.updateKioskMetadata) {
        await this.db.kiosk.update({
          where: { id: kioskId },
          data: {
            // Add any kiosk-specific organization fields here if they exist in the schema
            updatedAt: new Date()
          }
        });
      }

      logger.info(`Kiosk ${kioskId} successfully assigned to organization`);

      return {
        success: true,
        kioskId,
        assignment: validatedOrgData,
        assignedBy
      };

    } catch (error) {
      logger.error('Failed to assign kiosk to organization:', error);
      throw error;
    }
  }

  /**
   * Validate organization assignment data
   */
  validateOrganizationData(orgData) {
    const validated = {};

    // Organization ID (required)
    if (!orgData.organizationId) {
      throw new Error('Organization ID is required');
    }
    validated.organizationId = parseInt(orgData.organizationId);

    // Department (optional)
    if (orgData.department) {
      if (typeof orgData.department !== 'string' || orgData.department.length > 100) {
        throw new Error('Department must be a string with max 100 characters');
      }
      validated.department = orgData.department.trim();
    }

    // Floor (optional)
    if (orgData.floor) {
      if (typeof orgData.floor !== 'string' || orgData.floor.length > 50) {
        throw new Error('Floor must be a string with max 50 characters');
      }
      validated.floor = orgData.floor.trim();
    }

    // Room (optional)
    if (orgData.room) {
      if (typeof orgData.room !== 'string' || orgData.room.length > 50) {
        throw new Error('Room must be a string with max 50 characters');
      }
      validated.room = orgData.room.trim();
    }

    // Building (optional)
    if (orgData.building) {
      if (typeof orgData.building !== 'string' || orgData.building.length > 100) {
        throw new Error('Building must be a string with max 100 characters');
      }
      validated.building = orgData.building.trim();
    }

    // Additional metadata
    validated.metadata = orgData.metadata || {};
    validated.updateKioskMetadata = orgData.updateKioskMetadata || false;

    return validated;
  }

  /**
   * Collect and update metadata from kiosks
   */
  async collectKioskMetadata(kioskId, metadataType = 'all') {
    try {
      logger.info(`Collecting metadata from kiosk ${kioskId}`);

      // Validate kiosk exists and is active
      const kiosk = await this.db.kiosk.findUnique({
        where: { id: kioskId },
        include: {
          assetRegistry: {
            include: {
              asset: true
            }
          }
        }
      });

      if (!kiosk) {
        throw new Error(`Kiosk with ID ${kioskId} not found`);
      }

      if (!kiosk.active) {
        throw new Error(`Kiosk ${kioskId} is not active`);
      }

      const collectedMetadata = {};

      // Collect system metadata
      if (metadataType === 'all' || metadataType === 'system') {
        collectedMetadata.system = {
          lastSeen: kiosk.lastSeen,
          version: kiosk.version,
          status: kiosk.currentStatus,
          uptime: this.calculateKioskUptime(kiosk),
          schedule: kiosk.schedule,
          collectedAt: new Date().toISOString()
        };
      }

      // Collect asset metadata
      if (metadataType === 'all' || metadataType === 'assets') {
        collectedMetadata.assets = {
          totalRegistered: kiosk.assetRegistry.length,
          activeAssets: kiosk.assetRegistry.filter(reg => reg.status === 'active').length,
          recentCheckIns: kiosk.assetRegistry
            .filter(reg => reg.lastCheckIn && reg.lastCheckIn > new Date(Date.now() - 24 * 60 * 60 * 1000))
            .length,
          assetSummary: kiosk.assetRegistry.map(reg => ({
            assetId: reg.assetId,
            assetTag: reg.asset.assetTag,
            model: reg.asset.model,
            status: reg.status,
            lastCheckIn: reg.lastCheckIn,
            helixSyncStatus: reg.helixSyncStatus
          }))
        };
      }

      // Collect performance metadata
      if (metadataType === 'all' || metadataType === 'performance') {
        collectedMetadata.performance = await this.collectKioskPerformanceMetadata(kioskId);
      }

      // Encrypt and store metadata
      const encryptedMetadata = this.encryptAssetField(JSON.stringify(collectedMetadata));
      
      await this.db.$executeRaw`
        INSERT INTO kiosk_metadata_logs (kiosk_id, metadata_type, encrypted_metadata, collection_timestamp)
        VALUES (${kioskId}, ${metadataType}, ${encryptedMetadata}, CURRENT_TIMESTAMP)
      `;

      logger.info(`Metadata collection completed for kiosk ${kioskId}`);

      return {
        success: true,
        kioskId,
        metadataType,
        collectedMetadata: metadataType === 'system' ? collectedMetadata.system : collectedMetadata,
        timestamp: new Date().toISOString()
      };

    } catch (error) {
      logger.error(`Failed to collect metadata from kiosk ${kioskId}:`, error);
      throw error;
    }
  }

  /**
   * Calculate kiosk uptime based on last seen and schedule
   */
  calculateKioskUptime(kiosk) {
    if (!kiosk.lastSeen) {
      return null;
    }

    const now = new Date();
    const lastSeen = new Date(kiosk.lastSeen);
    const timeDiffMs = now - lastSeen;

    // If last seen was more than 1 hour ago, consider it offline
    if (timeDiffMs > 60 * 60 * 1000) {
      return {
        status: 'offline',
        lastSeenMinutesAgo: Math.floor(timeDiffMs / (60 * 1000))
      };
    }

    return {
      status: 'online',
      lastSeenMinutesAgo: Math.floor(timeDiffMs / (60 * 1000))
    };
  }

  /**
   * Collect performance metadata for a kiosk
   */
  async collectKioskPerformanceMetadata(kioskId) {
    try {
      // Get recent activity metrics
      const recentMetrics = await this.db.$queryRaw`
        SELECT 
          COUNT(*) as total_interactions,
          COUNT(DISTINCT DATE(kar.last_check_in)) as active_days,
          AVG(EXTRACT(EPOCH FROM (kar.last_check_in - kar.registration_date))) as avg_session_duration
        FROM kiosk_asset_registry kar
        WHERE kar.kiosk_id = ${kioskId}
          AND kar.last_check_in > CURRENT_TIMESTAMP - INTERVAL '30 days'
      `;

      // Get sync performance
      const syncMetrics = await this.db.$queryRaw`
        SELECT 
          helix_sync_status,
          COUNT(*) as count,
          AVG(EXTRACT(EPOCH FROM (helix_last_sync - registration_date))) as avg_sync_time
        FROM kiosk_asset_registry
        WHERE kiosk_id = ${kioskId}
        GROUP BY helix_sync_status
      `;

      return {
        interactions: recentMetrics[0] || {},
        syncPerformance: syncMetrics,
        collectedAt: new Date().toISOString()
      };

    } catch (error) {
      logger.error('Failed to collect performance metadata:', error);
      return {
        error: error.message,
        collectedAt: new Date().toISOString()
      };
    }
  }
}

export default InventoryService;
