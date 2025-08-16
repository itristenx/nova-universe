// Helix Integration Service for Kiosk Asset Registry
// Handles integration between inventory assets, kiosk registry, and Helix identity APIs

import { logger } from '../logger.js';
import { encrypt, decrypt } from '../utils/encryption.js';
// import { PrismaClient } from '../../../prisma/generated/core/index.js';

async function getPrisma() {
  if (process.env.PRISMA_DISABLED === 'true') return null;
  try {
    const mod = await import('../../../prisma/generated/core/index.js');
    const PrismaClient = mod.PrismaClient;
    return new PrismaClient({
      datasources: { core_db: { url: process.env.CORE_DATABASE_URL || process.env.DATABASE_URL } },
    });
  } catch (e) {
    logger.warn('Prisma unavailable in HelixKioskIntegrationService', { error: e?.message });
    return null;
  }
}

let prisma;
(async () => {
  prisma = await getPrisma();
})();

export class HelixKioskIntegrationService {
  constructor() {
    this.db = prisma;
    this.helixBaseUrl = process.env.HELIX_API_URL || 'http://localhost:3000/api/v1/helix';
    this.helixApiKey = process.env.HELIX_API_KEY;
  }

  /**
   * Register asset with kiosk and sync with Helix
   */
  async registerAssetWithKiosk(assetId, kioskId, options = {}) {
    try {
      logger.info(`Registering asset ${assetId} with kiosk ${kioskId}`);

      // Validate asset exists
      const asset = await this.db.inventoryAsset.findUnique({
        where: { id: parseInt(assetId) },
        include: {
          statusLogs: {
            orderBy: { timestamp: 'desc' },
            take: 5,
          },
        },
      });

      if (!asset) {
        throw new Error(`Asset with ID ${assetId} not found`);
      }

      // Validate kiosk exists
      const kiosk = await this.db.kiosk.findUnique({
        where: { id: kioskId },
      });

      if (!kiosk) {
        throw new Error(`Kiosk with ID ${kioskId} not found`);
      }

      // Prepare encrypted metadata for kiosk registration
      const kioskMetadata = {
        registeredAt: new Date().toISOString(),
        registeredBy: options.userId || 'system',
        assetDetails: {
          tag: asset.asset_tag,
          model: asset.model,
          status: asset.status,
          department: asset.department,
        },
        syncPreferences: {
          autoSync: options.autoSync !== false,
          syncInterval: options.syncInterval || 300, // 5 minutes
          syncOnStatusChange: options.syncOnStatusChange !== false,
        },
        helixConfig: {
          enabled: options.helixEnabled !== false,
          identitySync: options.identitySync !== false,
          auditLevel: options.auditLevel || 'standard',
        },
      };

      const encryptedMetadata = encrypt(JSON.stringify(kioskMetadata));

      // Register or update in kiosk asset registry
      const registryEntry = await this.db.$executeRaw`
        INSERT INTO kiosk_asset_registry (
          kiosk_id, 
          asset_id, 
          registration_date,
          status,
          helix_sync_status,
          encrypted_metadata,
          created_by,
          updated_by
        )
        VALUES (
          ${kioskId}, 
          ${assetId}, 
          CURRENT_TIMESTAMP,
          'active',
          'pending',
          ${encryptedMetadata},
          ${options.userId || 'system'},
          ${options.userId || 'system'}
        )
        ON CONFLICT (kiosk_id, asset_id) 
        DO UPDATE SET 
          status = 'active',
          helix_sync_status = 'pending',
          encrypted_metadata = EXCLUDED.encrypted_metadata,
          updated_by = EXCLUDED.updated_by,
          last_check_in = CURRENT_TIMESTAMP
        RETURNING *
      `;

      // Sync with Helix APIs
      const helixSyncResult = await this.syncWithHelix(kioskId, assetId, asset, kioskMetadata);

      // Update registry with sync results
      await this.updateHelixSyncStatus(kioskId, assetId, helixSyncResult);

      logger.info(`Asset ${asset.asset_tag} successfully registered with kiosk ${kioskId}`);

      return {
        success: true,
        registryEntryId: registryEntry.insertId,
        asset: {
          id: asset.id,
          tag: asset.asset_tag,
          model: asset.model,
          status: asset.status,
        },
        kiosk: {
          id: kiosk.id,
          active: kiosk.active,
        },
        helixSync: helixSyncResult,
        metadata: kioskMetadata,
      };
    } catch (error) {
      logger.error(`Failed to register asset with kiosk: ${error.message}`, error);
      throw error;
    }
  }

  /**
   * Sync asset and kiosk data with Helix APIs
   */
  async syncWithHelix(kioskId, assetId, asset, metadata) {
    try {
      if (!this.helixApiKey) {
        logger.warn('Helix API key not configured, skipping Helix sync');
        return {
          status: 'skipped',
          reason: 'api_key_not_configured',
          timestamp: new Date().toISOString(),
        };
      }

      // Prepare Helix sync payload
      const helixPayload = {
        entityType: 'kiosk_asset',
        entityId: `${kioskId}-${assetId}`,
        kioskId: kioskId,
        assetId: assetId,
        assetDetails: {
          tag: asset.asset_tag,
          model: asset.model,
          serialNumber: asset.serial_number_enc ? '[ENCRYPTED]' : null,
          status: asset.status,
          department: asset.department,
          location: asset.location_id,
          assignedTo: asset.assigned_to_user_id,
        },
        metadata: {
          registrationDate: metadata.registeredAt,
          syncConfig: metadata.helixConfig,
          lastUpdated: new Date().toISOString(),
        },
        auditInfo: {
          action: 'kiosk_asset_registration',
          timestamp: new Date().toISOString(),
          source: 'inventory_service',
        },
      };

      // Make API call to Helix
      const helixResponse = await this.callHelixAPI('/identity/kiosk-assets', 'POST', helixPayload);

      if (helixResponse.success) {
        logger.info(`Successfully synced asset ${asset.asset_tag} with Helix`);
        return {
          status: 'synced',
          helixEntityId: helixResponse.entityId,
          timestamp: new Date().toISOString(),
          response: helixResponse,
        };
      } else {
        throw new Error(`Helix sync failed: ${helixResponse.error}`);
      }
    } catch (error) {
      logger.error(`Helix sync failed for asset ${assetId}:`, error);
      return {
        status: 'failed',
        error: error.message,
        timestamp: new Date().toISOString(),
      };
    }
  }

  /**
   * Update Helix sync status in registry
   */
  async updateHelixSyncStatus(kioskId, assetId, syncResult) {
    try {
      const status = syncResult.status;
      const errorMessage = syncResult.error || null;
      const timestamp = syncResult.timestamp;

      await this.db.$executeRaw`
        UPDATE kiosk_asset_registry 
        SET 
          helix_sync_status = ${status},
          helix_last_sync = ${timestamp}::timestamp,
          helix_error_message = ${errorMessage}
        WHERE kiosk_id = ${kioskId} AND asset_id = ${assetId}
      `;
    } catch (error) {
      logger.error('Failed to update Helix sync status:', error);
    }
  }

  /**
   * Get kiosk assets with decrypted metadata
   */
  async getKioskAssets(kioskId, options = {}) {
    try {
      const kioskAssets = await this.db.$queryRaw`
        SELECT 
          kar.*,
          ia.asset_tag,
          ia.model,
          ia.status as asset_status,
          ia.department,
          ia.assigned_to_user_id,
          k.active as kiosk_active,
          k.current_status as kiosk_status
        FROM kiosk_asset_registry kar
        JOIN inventory_assets ia ON kar.asset_id = ia.id
        JOIN kiosks k ON kar.kiosk_id = k.id
        WHERE kar.kiosk_id = ${kioskId}
        ORDER BY kar.registration_date DESC
      `;

      // Decrypt metadata for each asset
      const decryptedAssets = kioskAssets.map((asset) => {
        let metadata = null;
        if (asset.encrypted_metadata) {
          try {
            const decryptedData = decrypt(asset.encrypted_metadata);
            metadata = JSON.parse(decryptedData);
          } catch (error) {
            logger.error(`Failed to decrypt metadata for asset ${asset.asset_id}:`, error);
            metadata = { error: 'decryption_failed' };
          }
        }

        return {
          ...asset,
          encrypted_metadata: undefined, // Remove encrypted field from response
          metadata: metadata,
        };
      });

      return {
        success: true,
        kioskId,
        assets: decryptedAssets,
        totalCount: decryptedAssets.length,
      };
    } catch (error) {
      logger.error(`Failed to get kiosk assets for ${kioskId}:`, error);
      throw error;
    }
  }

  /**
   * Unregister asset from kiosk
   */
  async unregisterAssetFromKiosk(assetId, kioskId, options = {}) {
    try {
      logger.info(`Unregistering asset ${assetId} from kiosk ${kioskId}`);

      // Check if registration exists
      const registration = await this.db.$queryRaw`
        SELECT * FROM kiosk_asset_registry 
        WHERE kiosk_id = ${kioskId} AND asset_id = ${assetId}
      `;

      if (registration.length === 0) {
        throw new Error('Asset registration not found for this kiosk');
      }

      // Notify Helix about unregistration
      if (registration[0].helix_sync_status === 'synced') {
        await this.notifyHelixUnregistration(kioskId, assetId, options);
      }

      // Remove from registry
      await this.db.$executeRaw`
        DELETE FROM kiosk_asset_registry 
        WHERE kiosk_id = ${kioskId} AND asset_id = ${assetId}
      `;

      logger.info(`Asset ${assetId} successfully unregistered from kiosk ${kioskId}`);

      return {
        success: true,
        message: 'Asset unregistered from kiosk',
      };
    } catch (error) {
      logger.error(`Failed to unregister asset from kiosk: ${error.message}`, error);
      throw error;
    }
  }

  /**
   * Notify Helix about asset unregistration
   */
  async notifyHelixUnregistration(kioskId, assetId, options = {}) {
    try {
      if (!this.helixApiKey) {
        logger.warn('Helix API key not configured, skipping Helix notification');
        return;
      }

      const payload = {
        entityType: 'kiosk_asset',
        entityId: `${kioskId}-${assetId}`,
        action: 'unregister',
        timestamp: new Date().toISOString(),
        reason: options.reason || 'manual_unregistration',
        userId: options.userId || 'system',
      };

      await this.callHelixAPI(`/identity/kiosk-assets/${kioskId}-${assetId}`, 'DELETE', payload);
      logger.info(`Notified Helix about asset ${assetId} unregistration`);
    } catch (error) {
      logger.error('Failed to notify Helix about unregistration:', error);
      // Don't throw error - unregistration should succeed even if Helix notification fails
    }
  }

  /**
   * Bulk sync all pending kiosk assets with Helix
   */
  async bulkSyncWithHelix(options = {}) {
    try {
      logger.info('Starting bulk sync with Helix');

      // Get all pending sync entries
      const pendingSync = await this.db.$queryRaw`
        SELECT 
          kar.*,
          ia.asset_tag,
          ia.model,
          ia.status,
          ia.department
        FROM kiosk_asset_registry kar
        JOIN inventory_assets ia ON kar.asset_id = ia.id
        WHERE kar.helix_sync_status IN ('pending', 'failed')
        ORDER BY kar.registration_date DESC
        LIMIT ${options.limit || 100}
      `;

      const results = {
        total: pendingSync.length,
        synced: 0,
        failed: 0,
        errors: [],
      };

      for (const entry of pendingSync) {
        try {
          // Decrypt metadata
          let metadata = {};
          if (entry.encrypted_metadata) {
            try {
              metadata = JSON.parse(decrypt(entry.encrypted_metadata));
            } catch (error) {
              logger.error(`Failed to decrypt metadata for sync: ${error.message}`);
            }
          }

          // Sync with Helix
          const syncResult = await this.syncWithHelix(
            entry.kiosk_id,
            entry.asset_id,
            {
              asset_tag: entry.asset_tag,
              model: entry.model,
              status: entry.status,
              department: entry.department,
            },
            metadata,
          );

          // Update sync status
          await this.updateHelixSyncStatus(entry.kiosk_id, entry.asset_id, syncResult);

          if (syncResult.status === 'synced') {
            results.synced++;
          } else {
            results.failed++;
            results.errors.push({
              assetId: entry.asset_id,
              kioskId: entry.kiosk_id,
              error: syncResult.error,
            });
          }
        } catch (error) {
          results.failed++;
          results.errors.push({
            assetId: entry.asset_id,
            kioskId: entry.kiosk_id,
            error: error.message,
          });
          logger.error(`Failed to sync asset ${entry.asset_id}:`, error);
        }
      }

      logger.info(`Bulk sync completed: ${results.synced} synced, ${results.failed} failed`);
      return results;
    } catch (error) {
      logger.error('Bulk sync with Helix failed:', error);
      throw error;
    }
  }

  /**
   * Get Helix sync status summary
   */
  async getHelixSyncStatus() {
    try {
      const statusSummary = await this.db.$queryRaw`
        SELECT 
          helix_sync_status,
          COUNT(*) as count,
          MAX(helix_last_sync) as last_sync_time
        FROM kiosk_asset_registry 
        GROUP BY helix_sync_status
        ORDER BY count DESC
      `;

      const recentErrors = await this.db.$queryRaw`
        SELECT 
          kar.kiosk_id,
          kar.asset_id,
          ia.asset_tag,
          kar.helix_error_message,
          kar.helix_last_sync
        FROM kiosk_asset_registry kar
        JOIN inventory_assets ia ON kar.asset_id = ia.id
        WHERE kar.helix_sync_status = 'failed'
        ORDER BY kar.helix_last_sync DESC
        LIMIT 10
      `;

      return {
        summary: statusSummary,
        recentErrors,
        totalRegistrations: statusSummary.reduce((sum, item) => sum + item.count, 0),
      };
    } catch (error) {
      logger.error('Failed to get Helix sync status:', error);
      throw error;
    }
  }

  /**
   * Call Helix API with proper authentication and error handling
   */
  async callHelixAPI(endpoint, method = 'GET', data = null) {
    try {
      const url = `${this.helixBaseUrl}${endpoint}`;
      const headers = {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${this.helixApiKey}`,
        'X-API-Source': 'inventory-service',
      };

      const options = {
        method,
        headers,
      };

      if (data && (method === 'POST' || method === 'PUT' || method === 'PATCH')) {
        options.body = JSON.stringify(data);
      }

      const response = await fetch(url, options);
      const responseData = await response.json();

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${responseData.error || 'Unknown error'}`);
      }

      return responseData;
    } catch (error) {
      logger.error(`Helix API call failed: ${method} ${endpoint}`, error);
      throw error;
    }
  }

  /**
   * Encrypt sensitive kiosk metadata
   */
  encryptKioskMetadata(metadata) {
    try {
      return encrypt(JSON.stringify(metadata));
    } catch (error) {
      logger.error('Failed to encrypt kiosk metadata:', error);
      throw new Error('Encryption failed');
    }
  }

  /**
   * Decrypt kiosk metadata
   */
  decryptKioskMetadata(encryptedMetadata) {
    try {
      if (!encryptedMetadata) return null;
      const decrypted = decrypt(encryptedMetadata);
      return JSON.parse(decrypted);
    } catch (error) {
      logger.error('Failed to decrypt kiosk metadata:', error);
      return { error: 'decryption_failed' };
    }
  }

  /**
   * Update asset check-in status for kiosk
   */
  async updateAssetCheckIn(kioskId, assetId, status = 'active') {
    try {
      await this.db.$executeRaw`
        UPDATE kiosk_asset_registry 
        SET 
          last_check_in = CURRENT_TIMESTAMP,
          status = ${status}
        WHERE kiosk_id = ${kioskId} AND asset_id = ${assetId}
      `;

      // Optionally sync check-in with Helix
      if (this.helixApiKey) {
        const payload = {
          entityType: 'kiosk_asset_checkin',
          kioskId,
          assetId,
          status,
          timestamp: new Date().toISOString(),
        };

        try {
          await this.callHelixAPI('/identity/kiosk-assets/checkin', 'POST', payload);
        } catch (error) {
          logger.warn('Failed to sync check-in with Helix:', error.message);
        }
      }

      return { success: true };
    } catch (error) {
      logger.error('Failed to update asset check-in:', error);
      throw error;
    }
  }

  /**
   * Encrypt metadata for secure storage in kiosk asset registry
   * @param {Object} metadata - Metadata object to encrypt
   * @returns {string} Encrypted metadata as string
   */
  async encryptMetadata(metadata) {
    try {
      if (!metadata || typeof metadata !== 'object') {
        return null;
      }

      const metadataString = JSON.stringify(metadata);
      return encrypt(metadataString);
    } catch (error) {
      logger.error('Error encrypting metadata:', error);
      throw new Error('Failed to encrypt kiosk metadata');
    }
  }
}

export default new HelixKioskIntegrationService();
