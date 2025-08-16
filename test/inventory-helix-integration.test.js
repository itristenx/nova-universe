/**
 * Test: Enhanced Helix Integration for Inventory Service
 * Validates Helix API integration, error handling, retries, and organizational assignments
 */

import { describe, it, expect, beforeAll, afterAll, beforeEach } from '@jest/globals';
import { PrismaClient } from '../prisma/generated/core/index.js';
import { InventoryService } from '../apps/api/services/inventory.js';
import { HelixKioskIntegrationService } from '../apps/api/services/helixKioskIntegration.js';

// Mock Helix API responses
const _mockHelixResponses = {
  success: {
    success: true,
    entityId: 'helix-entity-123',
    message: 'Successfully synced with Helix'
  },
  failure: {
    success: false,
    error: 'Helix API endpoint not available'
  },
  skipped: {
    status: 'skipped',
    reason: 'api_key_not_configured'
  }
};

// Mock database for testing
const mockPrismaClient = {
  inventoryAsset: {
    create: jest.fn(),
    findMany: jest.fn(),
    findUnique: jest.fn(),
    update: jest.fn(),
    deleteMany: jest.fn()
  },
  kiosk: {
    findUnique: jest.fn(),
    update: jest.fn()
  },
  kioskAssetRegistry: {
    create: jest.fn(),
    findMany: jest.fn(),
    update: jest.fn(),
    upsert: jest.fn()
  },
  $executeRaw: jest.fn(),
  $queryRaw: jest.fn(),
  $transaction: jest.fn()
};

describe('Enhanced Helix Integration Tests', () => {
  let inventoryService;
  let helixKioskService;

  beforeAll(() => {
    // Initialize services with mock Prisma client
    inventoryService = new InventoryService();
    inventoryService.db = mockPrismaClient;
    
    helixKioskService = new HelixKioskIntegrationService();
    helixKioskService.db = mockPrismaClient;
  });

  beforeEach(() => {
    // Reset all mocks
    jest.clearAllMocks();
  });

  describe('Helix API Integration', () => {
    it('should successfully sync asset with Helix APIs', async () => {
      const assetId = 1;
      const kioskId = 'kiosk-001';
      const metadata = { location: 'lobby', department: 'IT' };

      // Mock asset and kiosk lookup
      mockPrismaClient.inventoryAsset.findUnique.mockResolvedValue({
        id: assetId,
        asset_tag: 'TEST-001',
        model: 'Test Model',
        status: 'active',
        department: 'IT'
      });

      mockPrismaClient.kiosk.findUnique.mockResolvedValue({
        id: kioskId,
        active: true
      });

      // Mock database operations
      mockPrismaClient.$executeRaw.mockResolvedValue([]);

      // Mock successful Helix sync
      jest.spyOn(HelixKioskIntegrationService, 'syncWithHelix').mockResolvedValue({
        status: 'synced',
        helixEntityId: 'helix-123',
        timestamp: new Date().toISOString()
      });

      const result = await inventoryService.syncAssetWithKiosk(assetId, kioskId, metadata); // TODO-LINT: move to async function

      expect(result.success).toBe(true);
      expect(result.syncStatus).toBe('synced');
      expect(result.helixSync).toBeDefined();
      expect(mockPrismaClient.$executeRaw).toHaveBeenCalledWith(
        expect.stringContaining('helix_sync_status = \'synced\'')
      );
    });

    it('should handle Helix API failures gracefully', async () => {
      const assetId = 1;
      const kioskId = 'kiosk-001';

      // Mock asset and kiosk lookup
      mockPrismaClient.inventoryAsset.findUnique.mockResolvedValue({
        id: assetId,
        asset_tag: 'TEST-001',
        model: 'Test Model',
        status: 'active'
      });

      mockPrismaClient.kiosk.findUnique.mockResolvedValue({
        id: kioskId,
        active: true
      });

      mockPrismaClient.$executeRaw.mockResolvedValue([]);

      // Mock failed Helix sync
      jest.spyOn(HelixKioskIntegrationService, 'syncWithHelix').mockResolvedValue({
        status: 'failed',
        error: 'Helix API timeout',
        timestamp: new Date().toISOString()
      });

      const result = await inventoryService.syncAssetWithKiosk(assetId, kioskId, {}); // TODO-LINT: move to async function

      expect(result.success).toBe(true); // Asset sync should still succeed
      expect(result.syncStatus).toBe('failed');
      expect(mockPrismaClient.$executeRaw).toHaveBeenCalledWith(
        expect.stringContaining('helix_sync_status = \'failed\'')
      );
    });

    it('should skip Helix sync when API key not configured', async () => {
      const assetId = 1;
      const kioskId = 'kiosk-001';

      mockPrismaClient.inventoryAsset.findUnique.mockResolvedValue({
        id: assetId,
        asset_tag: 'TEST-001',
        model: 'Test Model',
        status: 'active'
      });

      mockPrismaClient.kiosk.findUnique.mockResolvedValue({
        id: kioskId,
        active: true
      });

      mockPrismaClient.$executeRaw.mockResolvedValue([]);

      // Mock skipped Helix sync
      jest.spyOn(HelixKioskIntegrationService, 'syncWithHelix').mockResolvedValue({
        status: 'skipped',
        reason: 'api_key_not_configured',
        timestamp: new Date().toISOString()
      });

      const result = await inventoryService.syncAssetWithKiosk(assetId, kioskId, {}); // TODO-LINT: move to async function

      expect(result.success).toBe(true);
      expect(result.syncStatus).toBe('skipped');
    });
  });

  describe('Error Handling and Retries', () => {
    it('should log sync failures for retry processing', async () => {
      const kioskId = 'kiosk-001';
      const assetId = 1;
      const errorMessage = 'Connection timeout';
      const metadata = { asset_tag: 'TEST-001', retry_count: 0 };

      mockPrismaClient.$executeRaw.mockResolvedValue([]);

      await inventoryService.logHelixSyncFailure(kioskId, assetId, errorMessage, metadata); // TODO-LINT: move to async function

      expect(mockPrismaClient.$executeRaw).toHaveBeenCalledWith(
        expect.stringContaining('INSERT INTO helix_sync_failures')
      );
    });

    it('should retry failed Helix synchronizations', async () => {
      const failedSyncs = [
        {
          kiosk_id: 'kiosk-001',
          asset_id: 1,
          asset_tag: 'TEST-001',
          model: 'Test Model',
          status: 'active',
          retry_count: 1,
          metadata: '{"department": "IT"}'
        }
      ];

      mockPrismaClient.$queryRaw.mockResolvedValue(failedSyncs);
      mockPrismaClient.inventoryAsset.findUnique.mockResolvedValue({
        id: 1,
        asset_tag: 'TEST-001',
        model: 'Test Model',
        status: 'active'
      });

      // Mock successful retry
      jest.spyOn(HelixKioskIntegrationService, 'syncWithHelix').mockResolvedValue({
        status: 'synced',
        helixEntityId: 'helix-123'
      });

      mockPrismaClient.$executeRaw.mockResolvedValue([]);

      const result = await inventoryService.retryFailedHelixSyncs({ maxRetries: 10 }); // TODO-LINT: move to async function

      expect(result.total).toBe(1);
      expect(result.successful).toBe(1);
      expect(result.failed).toBe(0);
    });

    it('should handle retry failures appropriately', async () => {
      const failedSyncs = [
        {
          kiosk_id: 'kiosk-001',
          asset_id: 1,
          asset_tag: 'TEST-001',
          retry_count: 2,
          metadata: '{}'
        }
      ];

      mockPrismaClient.$queryRaw.mockResolvedValue(failedSyncs);
      mockPrismaClient.inventoryAsset.findUnique.mockResolvedValue({
        id: 1,
        asset_tag: 'TEST-001'
      });

      // Mock failed retry
      jest.spyOn(HelixKioskIntegrationService, 'syncWithHelix').mockRejectedValue(
        new Error('Persistent API failure')
      );

      const result = await inventoryService.retryFailedHelixSyncs({ maxRetries: 10 }); // TODO-LINT: move to async function

      expect(result.total).toBe(1);
      expect(result.successful).toBe(0);
      expect(result.failed).toBe(1);
      expect(result.errors).toHaveLength(1);
    });
  });

  describe('Kiosk Organizational Assignment', () => {
    it('should assign kiosk to organizational unit successfully', async () => {
      const kioskId = 'kiosk-001';
      const orgData = {
        organizationId: 1,
        department: 'Information Technology',
        floor: '2nd Floor',
        room: 'Server Room 201',
        building: 'Main Building'
      };
      const assignedBy = 'admin-user';

      mockPrismaClient.kiosk.findUnique.mockResolvedValue({
        id: kioskId,
        active: true
      });

      mockPrismaClient.$executeRaw.mockResolvedValue([{ id: 1 }]);
      mockPrismaClient.kiosk.update.mockResolvedValue({});

      const result = await inventoryService.assignKioskToOrganization(
        kioskId,
        orgData,
        assignedBy
      ); // TODO-LINT: move to async function

      expect(result.success).toBe(true);
      expect(result.kioskId).toBe(kioskId);
      expect(result.assignment.organizationId).toBe(orgData.organizationId);
      expect(result.assignment.department).toBe(orgData.department);
      expect(result.assignedBy).toBe(assignedBy);
    });

    it('should validate organization data correctly', () => {
      const validOrgData = {
        organizationId: 1,
        department: 'IT',
        floor: '2nd Floor',
        room: 'Room 201',
        building: 'Main Building'
      };

      const result = inventoryService.validateOrganizationData(validOrgData);

      expect(result.organizationId).toBe(1);
      expect(result.department).toBe('IT');
      expect(result.floor).toBe('2nd Floor');
      expect(result.room).toBe('Room 201');
      expect(result.building).toBe('Main Building');
    });

    it('should reject invalid organization data', () => {
      const testCases = [
        {
          data: { department: 'IT' }, // Missing organizationId
          error: 'Organization ID is required'
        },
        {
          data: { organizationId: 'invalid' }, // Non-numeric organizationId
          error: 'Organization ID is required'
        },
        {
          data: { 
            organizationId: 1, 
            department: 'a'.repeat(101) // Too long department
          },
          error: 'Department must be a string with max 100 characters'
        }
      ];

      testCases.forEach(({ data, error }) => {
        expect(() => {
          inventoryService.validateOrganizationData(data);
        }).toThrow(error);
      });
    });
  });

  describe('Kiosk Metadata Collection', () => {
    it('should collect system metadata from active kiosk', async () => {
      const kioskId = 'kiosk-001';
      const mockKiosk = {
        id: kioskId,
        active: true,
        lastSeen: new Date(Date.now() - 5 * 60 * 1000), // 5 minutes ago
        version: '1.2.0',
        currentStatus: 'online',
        schedule: { hours: '9-17', timezone: 'EST' },
        assetRegistry: []
      };

      mockPrismaClient.kiosk.findUnique.mockResolvedValue(mockKiosk);
      mockPrismaClient.$executeRaw.mockResolvedValue([]);

      const result = await inventoryService.collectKioskMetadata(kioskId, 'system'); // TODO-LINT: move to async function

      expect(result.success).toBe(true);
      expect(result.kioskId).toBe(kioskId);
      expect(result.metadataType).toBe('system');
      expect(result.collectedMetadata).toHaveProperty('lastSeen');
      expect(result.collectedMetadata).toHaveProperty('version');
      expect(result.collectedMetadata).toHaveProperty('status');
    });

    it('should collect asset metadata from kiosk', async () => {
      const kioskId = 'kiosk-001';
      const mockKiosk = {
        id: kioskId,
        active: true,
        assetRegistry: [
          {
            assetId: 1,
            status: 'active',
            lastCheckIn: new Date(Date.now() - 30 * 60 * 1000), // 30 minutes ago
            helixSyncStatus: 'synced',
            asset: {
              assetTag: 'TEST-001',
              model: 'Test Model'
            }
          },
          {
            assetId: 2,
            status: 'active',
            lastCheckIn: new Date(), // Recent check-in
            helixSyncStatus: 'synced',
            asset: {
              assetTag: 'TEST-002',
              model: 'Test Model 2'
            }
          }
        ]
      };

      mockPrismaClient.kiosk.findUnique.mockResolvedValue(mockKiosk);
      mockPrismaClient.$queryRaw.mockResolvedValue([]);
      mockPrismaClient.$executeRaw.mockResolvedValue([]);

      const result = await inventoryService.collectKioskMetadata(kioskId, 'assets'); // TODO-LINT: move to async function

      expect(result.success).toBe(true);
      expect(result.collectedMetadata.assets).toBeDefined();
      expect(result.collectedMetadata.assets.totalRegistered).toBe(2);
      expect(result.collectedMetadata.assets.activeAssets).toBe(2);
      expect(result.collectedMetadata.assets.assetSummary).toHaveLength(2);
    });

    it('should collect performance metadata from kiosk', async () => {
      const kioskId = 'kiosk-001';

      mockPrismaClient.kiosk.findUnique.mockResolvedValue({
        id: kioskId,
        active: true,
        assetRegistry: []
      });

      // Mock performance metrics queries
      mockPrismaClient.$queryRaw
        .mockResolvedValueOnce([{ 
          total_interactions: 150, 
          active_days: 25, 
          avg_session_duration: 3600 
        }])
        .mockResolvedValueOnce([
          { helix_sync_status: 'synced', count: 45, avg_sync_time: 2.5 },
          { helix_sync_status: 'failed', count: 5, avg_sync_time: null }
        ]);

      mockPrismaClient.$executeRaw.mockResolvedValue([]);

      const result = await inventoryService.collectKioskMetadata(kioskId, 'performance'); // TODO-LINT: move to async function

      expect(result.success).toBe(true);
      expect(result.collectedMetadata.performance).toBeDefined();
      expect(result.collectedMetadata.performance.interactions).toBeDefined();
      expect(result.collectedMetadata.performance.syncPerformance).toBeDefined();
    });

    it('should calculate kiosk uptime correctly', () => {
      const onlineKiosk = {
        lastSeen: new Date(Date.now() - 10 * 60 * 1000) // 10 minutes ago
      };

      const offlineKiosk = {
        lastSeen: new Date(Date.now() - 90 * 60 * 1000) // 90 minutes ago
      };

      const neverSeenKiosk = {
        lastSeen: null
      };

      const onlineResult = inventoryService.calculateKioskUptime(onlineKiosk);
      expect(onlineResult.status).toBe('online');
      expect(onlineResult.lastSeenMinutesAgo).toBe(10);

      const offlineResult = inventoryService.calculateKioskUptime(offlineKiosk);
      expect(offlineResult.status).toBe('offline');
      expect(offlineResult.lastSeenMinutesAgo).toBe(90);

      const neverSeenResult = inventoryService.calculateKioskUptime(neverSeenKiosk);
      expect(neverSeenResult).toBeNull();
    });

    it('should handle inactive kiosk gracefully', async () => {
      const kioskId = 'kiosk-inactive';

      mockPrismaClient.kiosk.findUnique.mockResolvedValue({
        id: kioskId,
        active: false
      });

      await expect(
        inventoryService.collectKioskMetadata(kioskId, 'system')
      ).rejects.toThrow('Kiosk kiosk-inactive is not active'); // TODO-LINT: move to async function
    });
  });

  describe('Integration Tests', () => {
    it('should handle complete workflow: assign, sync, collect metadata', async () => {
      const kioskId = 'kiosk-workflow';
      const assetId = 1;
      const orgData = {
        organizationId: 1,
        department: 'IT',
        floor: '2nd Floor'
      };

      // Mock all required database operations
      mockPrismaClient.kiosk.findUnique.mockResolvedValue({
        id: kioskId,
        active: true,
        lastSeen: new Date(),
        version: '1.0.0',
        assetRegistry: []
      });

      mockPrismaClient.inventoryAsset.findUnique.mockResolvedValue({
        id: assetId,
        asset_tag: 'WORKFLOW-001',
        model: 'Test Model',
        status: 'active'
      });

      mockPrismaClient.$executeRaw.mockResolvedValue([]);
      mockPrismaClient.kiosk.update.mockResolvedValue({});
      mockPrismaClient.$queryRaw.mockResolvedValue([]);

      // Mock successful Helix sync
      jest.spyOn(HelixKioskIntegrationService, 'syncWithHelix').mockResolvedValue({
        status: 'synced',
        helixEntityId: 'helix-workflow-123'
      });

      // Step 1: Assign kiosk to organization
      const assignResult = await inventoryService.assignKioskToOrganization(
        kioskId,
        orgData,
        'admin-user'
      ); // TODO-LINT: move to async function
      expect(assignResult.success).toBe(true);

      // Step 2: Sync asset with kiosk
      const syncResult = await inventoryService.syncAssetWithKiosk(
        assetId,
        kioskId,
        { department: orgData.department }
      ); // TODO-LINT: move to async function
      expect(syncResult.success).toBe(true);
      expect(syncResult.syncStatus).toBe('synced');

      // Step 3: Collect metadata
      const metadataResult = await inventoryService.collectKioskMetadata(kioskId, 'all'); // TODO-LINT: move to async function
      expect(metadataResult.success).toBe(true);
    });
  });
});
