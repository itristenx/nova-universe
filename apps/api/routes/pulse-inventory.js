// Enhanced Pulse Inventory Routes with Ticket History and Warranty Alerts
// Extensions to the Pulse API for comprehensive inventory management

import express from 'express';
import { authenticateJWT } from '../middleware/auth.js';
import { createRateLimit } from '../middleware/rateLimiter.js';
import { checkQueueAccess } from '../middleware/queueAccess.js';
import { body, param, query, validationResult } from 'express-validator';
import inventoryService from '../services/inventory.js';
import helixKioskIntegration from '../services/helixKioskIntegration.js';
import { logger } from '../logger.js';
import { encrypt, decrypt } from '../utils/encryption.js';
import { PrismaClient } from '../../../prisma/generated/core/index.js';

const router = express.Router();
const prisma = new PrismaClient();

/**
 * @swagger
 * /api/v1/pulse/inventory/assets:
 *   get:
 *     summary: Get inventory assets with enhanced details
 *     description: Returns assets with ticket history, warranty alerts, and status information
 *     tags: [Pulse - Inventory]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [active, inactive, maintenance, disposed, missing, retired]
 *         description: Filter by asset status
 *       - in: query
 *         name: assignedTo
 *         schema:
 *           type: string
 *         description: Filter by assigned user ID
 *       - in: query
 *         name: department
 *         schema:
 *           type: string
 *         description: Filter by department
 *       - in: query
 *         name: warrantyStatus
 *         schema:
 *           type: string
 *           enum: [ok, warning, critical, expired, no_warranty]
 *         description: Filter by warranty status
 *       - in: query
 *         name: includeHistory
 *         schema:
 *           type: boolean
 *           default: false
 *         description: Include ticket history in response
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 50
 *         description: Number of assets to return
 *       - in: query
 *         name: offset
 *         schema:
 *           type: integer
 *           default: 0
 *         description: Number of assets to skip
 *     responses:
 *       200:
 *         description: List of assets with enhanced details
 */
router.get('/assets',
  authenticateJWT,
  checkQueueAccess(req => req.query.queue),
  createRateLimit(15 * 60 * 1000, 200), // 200 requests per 15 minutes
  [
    query('status').optional().isIn(['active', 'inactive', 'maintenance', 'disposed', 'missing', 'retired']),
    query('warrantyStatus').optional().isIn(['ok', 'warning', 'critical', 'expired', 'no_warranty']),
    query('includeHistory').optional().isBoolean(),
    query('limit').optional().isInt({ min: 1, max: 200 }),
    query('offset').optional().isInt({ min: 0 })
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          error: 'Invalid parameters',
          details: errors.array(),
          errorCode: 'VALIDATION_ERROR'
        });
      }

      const {
        status,
        assignedTo,
        department,
        warrantyStatus,
        includeHistory = false,
        limit = 50,
        offset = 0
      } = req.query;

      // Build dynamic query using Prisma
      const where = {};
      
      if (status) where.status = status;
      if (assignedTo) where.assigned_to_user_id = assignedTo;
      if (department) where.department = department;

      // Handle warranty status filtering
      if (warrantyStatus) {
        const now = new Date();
        switch (warrantyStatus) {
          case 'no_warranty':
            where.warranty_expiry = null;
            break;
          case 'expired':
            where.warranty_expiry = { lt: now };
            break;
          case 'critical':
            where.AND = [
              { warranty_expiry: { gt: now } },
              { warranty_expiry: { lte: new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000) } }
            ];
            break;
          case 'warning':
            where.AND = [
              { warranty_expiry: { gt: new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000) } },
              { warranty_expiry: { lte: new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000) } }
            ];
            break;
          case 'ok':
            where.warranty_expiry = { gt: new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000) };
            break;
        }
      }

      // Get assets with related data
      const assets = await prisma.inventoryAsset.findMany({
        where,
        include: {
          statusLogs: {
            orderBy: { timestamp: 'desc' },
            take: 5,
            select: {
              id: true,
              previous_status: true,
              new_status: true,
              changed_by_user_id: true,
              notes: true,
              timestamp: true
            }
          },
          assignments: {
            where: { return_date: null },
            select: {
              id: true,
              assigned_date: true,
              expected_return: true,
              assigned_by: true,
              manager_id: true
            }
          }
        },
        orderBy: { updated_at: 'desc' },
        take: parseInt(limit),
        skip: parseInt(offset)
      });

      // Get warranty alerts for these assets
      const assetIds = assets.map(a => a.id);
      const warrantyAlerts = await prisma.$queryRaw`
        SELECT 
          asset_id,
          alert_type,
          days_remaining,
          notification_sent,
          dismissed
        FROM asset_warranty_alerts 
        WHERE asset_id = ANY(${assetIds}) 
          AND dismissed = false
        ORDER BY asset_id, days_remaining ASC
      `;

      // Get ticket history if requested
      let ticketHistory = [];
      if (includeHistory === 'true' || includeHistory === true) {
        ticketHistory = await prisma.$queryRaw`
          SELECT 
            ath.asset_id,
            ath.ticket_id,
            ath.relationship_type,
            ath.created_at,
            ath.ended_at,
            st.title,
            st.status as ticket_status,
            st.priority,
            u.name as requester_name
          FROM asset_ticket_history ath
          JOIN support_tickets st ON ath.ticket_id = st.id
          LEFT JOIN users u ON st.user_id = u.id
          WHERE ath.asset_id = ANY(${assetIds})
            AND ath.ended_at IS NULL
          ORDER BY ath.created_at DESC
        `;
      }

      // Group alerts and history by asset_id
      const alertsByAsset = {};
      warrantyAlerts.forEach(alert => {
        if (!alertsByAsset[alert.asset_id]) alertsByAsset[alert.asset_id] = [];
        alertsByAsset[alert.asset_id].push(alert);
      });

      const historyByAsset = {};
      ticketHistory.forEach(history => {
        if (!historyByAsset[history.asset_id]) historyByAsset[history.asset_id] = [];
        historyByAsset[history.asset_id].push(history);
      });

      // Enhance assets with additional data
      const enhancedAssets = assets.map(asset => {
        // Decrypt sensitive fields
        const decryptedAsset = {
          ...asset,
          serial_number: asset.serial_number_enc ? 
            inventoryService.decryptAssetField(asset.serial_number_enc) : null,
          warranty_info: asset.warranty_info_enc ? 
            inventoryService.decryptAssetField(asset.warranty_info_enc) : null,
          purchase_info: asset.purchase_info_enc ? 
            inventoryService.decryptAssetField(asset.purchase_info_enc) : null,
          maintenance_notes: asset.maintenance_notes_enc ? 
            inventoryService.decryptAssetField(asset.maintenance_notes_enc) : null,
          // Remove encrypted fields from response
          serial_number_enc: undefined,
          warranty_info_enc: undefined,
          purchase_info_enc: undefined,
          maintenance_notes_enc: undefined
        };

        // Calculate warranty status
        let warrantyStatusCalc = 'no_warranty';
        let warrantyDaysRemaining = null;
        
        if (asset.warranty_expiry) {
          const now = new Date();
          const daysRemaining = Math.floor((asset.warranty_expiry - now) / (24 * 60 * 60 * 1000));
          warrantyDaysRemaining = daysRemaining;
          
          if (daysRemaining < 0) {
            warrantyStatusCalc = 'expired';
          } else if (daysRemaining <= 7) {
            warrantyStatusCalc = 'critical';
          } else if (daysRemaining <= 30) {
            warrantyStatusCalc = 'warning';
          } else {
            warrantyStatusCalc = 'ok';
          }
        }

        return {
          ...decryptedAsset,
          warranty_status: warrantyStatusCalc,
          warranty_days_remaining: warrantyDaysRemaining,
          warranty_alerts: alertsByAsset[asset.id] || [],
          active_tickets: historyByAsset[asset.id] || [],
          status_history: asset.statusLogs,
          current_assignment: asset.assignments[0] || null
        };
      });

      // Get total count for pagination
      const totalCount = await prisma.inventoryAsset.count({ where });

      res.json({
        success: true,
        assets: enhancedAssets,
        pagination: {
          total: totalCount,
          limit: parseInt(limit),
          offset: parseInt(offset),
          hasMore: parseInt(offset) + parseInt(limit) < totalCount
        }
      });

    } catch (error) {
      logger.error('Error fetching enhanced inventory assets:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to fetch inventory assets',
        errorCode: 'INVENTORY_FETCH_ERROR'
      });
    }
  }
);

/**
 * @swagger
 * /api/v1/pulse/inventory/assets/{assetId}:
 *   get:
 *     summary: Get detailed asset information
 *     description: Returns comprehensive asset details including full history and alerts
 */
router.get('/assets/:assetId',
  authenticateJWT,
  [param('assetId').isInt({ min: 1 }).withMessage('Asset ID must be a positive integer')],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          error: 'Invalid asset ID',
          details: errors.array(),
          errorCode: 'VALIDATION_ERROR'
        });
      }

      const { assetId } = req.params;

      // Get asset with all related data
      const asset = await prisma.inventoryAsset.findUnique({
        where: { id: parseInt(assetId) },
        include: {
          statusLogs: {
            orderBy: { timestamp: 'desc' },
            select: {
              id: true,
              previous_status: true,
              new_status: true,
              changed_by_user_id: true,
              notes: true,
              timestamp: true
            }
          },
          assignments: {
            orderBy: { assigned_date: 'desc' },
            select: {
              id: true,
              user_id: true,
              org_id: true,
              customer_id: true,
              assigned_by: true,
              assigned_date: true,
              expected_return: true,
              return_date: true,
              manager_id: true
            }
          }
        }
      });

      if (!asset) {
        return res.status(404).json({
          success: false,
          error: 'Asset not found',
          errorCode: 'ASSET_NOT_FOUND'
        });
      }

      // Get warranty alerts
      const warrantyAlerts = await prisma.$queryRaw`
        SELECT 
          id,
          alert_type,
          alert_date,
          expiry_date,
          days_remaining,
          notification_sent,
          notification_sent_at,
          dismissed,
          dismissed_by,
          dismissed_at
        FROM asset_warranty_alerts 
        WHERE asset_id = ${parseInt(assetId)}
        ORDER BY alert_date DESC
      `;

      // Get ticket history
      const ticketHistory = await prisma.$queryRaw`
        SELECT 
          ath.id,
          ath.ticket_id,
          ath.relationship_type,
          ath.created_at,
          ath.ended_at,
          ath.notes,
          st.title,
          st.status as ticket_status,
          st.priority,
          st.created_at as ticket_created_at,
          st.updated_at as ticket_updated_at,
          u.name as requester_name,
          u.email as requester_email
        FROM asset_ticket_history ath
        JOIN support_tickets st ON ath.ticket_id = st.id
        LEFT JOIN users u ON st.user_id = u.id
        WHERE ath.asset_id = ${parseInt(assetId)}
        ORDER BY ath.created_at DESC
      `;

      // Get kiosk registry info
      const kioskRegistrations = await prisma.$queryRaw`
        SELECT 
          kar.kiosk_id,
          kar.registration_date,
          kar.last_check_in,
          kar.status as registry_status,
          kar.helix_sync_status,
          kar.helix_last_sync,
          k.active as kiosk_active,
          k.current_status as kiosk_status
        FROM kiosk_asset_registry kar
        JOIN kiosks k ON kar.kiosk_id = k.id
        WHERE kar.asset_id = ${parseInt(assetId)}
        ORDER BY kar.registration_date DESC
      `;

      // Decrypt sensitive fields
      const enhancedAsset = {
        ...asset,
        serial_number: asset.serial_number_enc ? 
          inventoryService.decryptAssetField(asset.serial_number_enc) : null,
        warranty_info: asset.warranty_info_enc ? 
          inventoryService.decryptAssetField(asset.warranty_info_enc) : null,
        purchase_info: asset.purchase_info_enc ? 
          inventoryService.decryptAssetField(asset.purchase_info_enc) : null,
        maintenance_notes: asset.maintenance_notes_enc ? 
          inventoryService.decryptAssetField(asset.maintenance_notes_enc) : null,
        // Remove encrypted fields
        serial_number_enc: undefined,
        warranty_info_enc: undefined,
        purchase_info_enc: undefined,
        maintenance_notes_enc: undefined
      };

      // Calculate warranty status
      let warrantyStatus = 'no_warranty';
      let warrantyDaysRemaining = null;
      
      if (asset.warranty_expiry) {
        const now = new Date();
        const daysRemaining = Math.floor((asset.warranty_expiry - now) / (24 * 60 * 60 * 1000));
        warrantyDaysRemaining = daysRemaining;
        
        if (daysRemaining < 0) {
          warrantyStatus = 'expired';
        } else if (daysRemaining <= 7) {
          warrantyStatus = 'critical';
        } else if (daysRemaining <= 30) {
          warrantyStatus = 'warning';
        } else {
          warrantyStatus = 'ok';
        }
      }

      res.json({
        success: true,
        asset: {
          ...enhancedAsset,
          warranty_status: warrantyStatus,
          warranty_days_remaining: warrantyDaysRemaining,
          warranty_alerts: warrantyAlerts,
          ticket_history: ticketHistory,
          kiosk_registrations: kioskRegistrations,
          assignment_history: asset.assignments,
          status_history: asset.statusLogs
        }
      });

    } catch (error) {
      logger.error('Error fetching asset details:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to fetch asset details',
        errorCode: 'ASSET_DETAIL_ERROR'
      });
    }
  }
);

/**
 * @swagger
 * /api/v1/pulse/inventory/assets/{assetId}/tickets:
 *   post:
 *     summary: Link ticket to asset
 *     description: Creates a relationship between a ticket and an asset
 */
router.post('/assets/:assetId/tickets',
  authenticateJWT,
  [
    param('assetId').isInt({ min: 1 }),
    body('ticketId').isInt({ min: 1 }).withMessage('Ticket ID is required'),
    body('relationshipType').isIn(['assigned_to', 'related_to', 'repair_for', 'replacement_for'])
      .withMessage('Invalid relationship type'),
    body('notes').optional().isString().isLength({ max: 1000 })
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          error: 'Invalid input',
          details: errors.array(),
          errorCode: 'VALIDATION_ERROR'
        });
      }

      const { assetId } = req.params;
      const { ticketId, relationshipType, notes } = req.body;
      const userId = req.user.id;

      // Verify asset exists
      const asset = await prisma.inventoryAsset.findUnique({
        where: { id: parseInt(assetId) }
      });

      if (!asset) {
        return res.status(404).json({
          success: false,
          error: 'Asset not found',
          errorCode: 'ASSET_NOT_FOUND'
        });
      }

      // Verify ticket exists
      const ticket = await prisma.supportTicket.findUnique({
        where: { id: parseInt(ticketId) }
      });

      if (!ticket) {
        return res.status(404).json({
          success: false,
          error: 'Ticket not found',
          errorCode: 'TICKET_NOT_FOUND'
        });
      }

      // Create ticket-asset relationship
      await prisma.$executeRaw`
        INSERT INTO asset_ticket_history (asset_id, ticket_id, relationship_type, created_by, notes)
        VALUES (${parseInt(assetId)}, ${parseInt(ticketId)}, ${relationshipType}, ${userId}, ${notes || null})
      `;

      logger.info(`Asset ${asset.asset_tag} linked to ticket ${ticket.id} by ${userId}`);

      res.json({
        success: true,
        message: 'Asset linked to ticket successfully',
        relationship: {
          assetId: parseInt(assetId),
          ticketId: parseInt(ticketId),
          relationshipType,
          createdBy: userId
        }
      });

    } catch (error) {
      logger.error('Error linking asset to ticket:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to link asset to ticket',
        errorCode: 'LINK_ERROR'
      });
    }
  }
);

/**
 * @swagger
 * /api/v1/pulse/inventory/assets/{id}/tickets:
 *   get:
 *     summary: Get ticket history for asset
 *     description: Retrieves all tickets associated with an asset
 */
router.get('/assets/:id/tickets',
  authenticateJWT,
  [param('id').isInt({ min: 1 })],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          error: 'Invalid input',
          details: errors.array(),
          errorCode: 'VALIDATION_ERROR'
        });
      }

      const { id: assetId } = req.params;

      // Get asset with ticket history
      const ticketHistory = await prisma.assetTicketHistory.findMany({
        where: {
          assetId: parseInt(assetId),
          endedAt: null // Only active relationships
        },
        include: {
          ticket: {
            select: {
              id: true,
              title: true,
              status: true,
              createdAt: true,
              updatedAt: true
            }
          }
        },
        orderBy: { createdAt: 'desc' }
      });

      res.json({
        success: true,
        assetId: parseInt(assetId),
        ticketHistory: ticketHistory.map(history => ({
          id: history.id,
          ticketId: history.ticketId,
          relationshipType: history.relationshipType,
          createdAt: history.createdAt,
          createdBy: history.createdBy,
          notes: history.notes,
          ticket: history.ticket
        }))
      });

    } catch (error) {
      logger.error('Error retrieving asset ticket history:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to retrieve ticket history',
        errorCode: 'HISTORY_ERROR'
      });
    }
  }
);

/**
 * @swagger
 * /api/v1/pulse/inventory/warranty-alerts:
 *   get:
 *     summary: Get warranty alerts
 *     description: Returns warranty alerts for assets
 */
router.get('/warranty-alerts',
  authenticateJWT,
  [
    query('alertType').optional().isIn(['warning', 'critical', 'expired']),
    query('dismissed').optional().isBoolean(),
    query('limit').optional().isInt({ min: 1, max: 200 }),
    query('offset').optional().isInt({ min: 0 })
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          error: 'Invalid parameters',
          details: errors.array(),
          errorCode: 'VALIDATION_ERROR'
        });
      }

      const {
        alertType,
        dismissed = false,
        limit = 50,
        offset = 0
      } = req.query;

      let whereClause = `WHERE awa.dismissed = ${dismissed}`;
      
      if (alertType) {
        whereClause += ` AND awa.alert_type = '${alertType}'`;
      }

      const alerts = await prisma.$queryRaw`
        SELECT 
          awa.id,
          awa.asset_id,
          awa.alert_type,
          awa.alert_date,
          awa.expiry_date,
          awa.days_remaining,
          awa.notification_sent,
          awa.notification_sent_at,
          ia.asset_tag,
          ia.model,
          ia.status as asset_status,
          ia.department,
          ia.assigned_to_user_id,
          u.name as assigned_user_name
        FROM asset_warranty_alerts awa
        JOIN inventory_assets ia ON awa.asset_id = ia.id
        LEFT JOIN users u ON ia.assigned_to_user_id = u.id
        ${whereClause}
        ORDER BY awa.days_remaining ASC, awa.alert_date DESC
        LIMIT ${parseInt(limit)} OFFSET ${parseInt(offset)}
      `;

      const totalCount = await prisma.$queryRaw`
        SELECT COUNT(*) as count
        FROM asset_warranty_alerts awa
        ${whereClause}
      `;

      res.json({
        success: true,
        alerts,
        pagination: {
          total: parseInt(totalCount[0].count),
          limit: parseInt(limit),
          offset: parseInt(offset),
          hasMore: parseInt(offset) + parseInt(limit) < parseInt(totalCount[0].count)
        }
      });

    } catch (error) {
      logger.error('Error fetching warranty alerts:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to fetch warranty alerts',
        errorCode: 'WARRANTY_ALERTS_ERROR'
      });
    }
  }
);

/**
 * @swagger
 * /api/v1/pulse/inventory/warranty-alerts/{alertId}/dismiss:
 *   post:
 *     summary: Dismiss warranty alert
 *     description: Marks a warranty alert as dismissed
 */
router.post('/warranty-alerts/:alertId/dismiss',
  authenticateJWT,
  [param('alertId').isInt({ min: 1 })],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          error: 'Invalid alert ID',
          details: errors.array(),
          errorCode: 'VALIDATION_ERROR'
        });
      }

      const { alertId } = req.params;
      const userId = req.user.id;

      await prisma.$executeRaw`
        UPDATE asset_warranty_alerts 
        SET dismissed = true,
            dismissed_by = ${userId},
            dismissed_at = CURRENT_TIMESTAMP
        WHERE id = ${parseInt(alertId)}
      `;

      res.json({
        success: true,
        message: 'Warranty alert dismissed successfully'
      });

    } catch (error) {
      logger.error('Error dismissing warranty alert:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to dismiss warranty alert',
        errorCode: 'DISMISS_ALERT_ERROR'
      });
    }
  }
);

/**
 * @swagger
 * /api/v1/pulse/inventory/kiosk-assets:
 *   get:
 *     summary: Get kiosk-registered assets
 *     description: Returns assets registered with kiosks and their Helix sync status
 */
router.get('/kiosk-assets',
  authenticateJWT,
  [
    query('kioskId').optional().isString(),
    query('helixSyncStatus').optional().isIn(['pending', 'synced', 'failed']),
    query('limit').optional().isInt({ min: 1, max: 200 }),
    query('offset').optional().isInt({ min: 0 })
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          error: 'Invalid parameters',
          details: errors.array(),
          errorCode: 'VALIDATION_ERROR'
        });
      }

      const {
        kioskId,
        helixSyncStatus,
        limit = 50,
        offset = 0
      } = req.query;

      let whereConditions = [];
      
      if (kioskId) {
        whereConditions.push(`kar.kiosk_id = '${kioskId}'`);
      }
      
      if (helixSyncStatus) {
        whereConditions.push(`kar.helix_sync_status = '${helixSyncStatus}'`);
      }

      const whereClause = whereConditions.length > 0 ? 
        `WHERE ${whereConditions.join(' AND ')}` : '';

      const kioskAssets = await prisma.$queryRaw`
        SELECT 
          kar.id as registry_id,
          kar.kiosk_id,
          kar.asset_id,
          kar.registration_date,
          kar.last_check_in,
          kar.status as registry_status,
          kar.helix_sync_status,
          kar.helix_last_sync,
          kar.helix_error_message,
          ia.asset_tag,
          ia.model,
          ia.status as asset_status,
          ia.department,
          k.active as kiosk_active,
          k.current_status as kiosk_status
        FROM kiosk_asset_registry kar
        JOIN inventory_assets ia ON kar.asset_id = ia.id
        JOIN kiosks k ON kar.kiosk_id = k.id
        ${whereClause}
        ORDER BY kar.registration_date DESC
        LIMIT ${parseInt(limit)} OFFSET ${parseInt(offset)}
      `;

      const totalCount = await prisma.$queryRaw`
        SELECT COUNT(*) as count
        FROM kiosk_asset_registry kar
        ${whereClause}
      `;

      res.json({
        success: true,
        kioskAssets,
        pagination: {
          total: parseInt(totalCount[0].count),
          limit: parseInt(limit),
          offset: parseInt(offset),
          hasMore: parseInt(offset) + parseInt(limit) < parseInt(totalCount[0].count)
        }
      });

    } catch (error) {
      logger.error('Error fetching kiosk assets:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to fetch kiosk assets',
        errorCode: 'KIOSK_ASSETS_ERROR'
      });
    }
  }
);

/**
 * @swagger
 * /api/v1/pulse/inventory/import:
 *   post:
 *     summary: Import assets from CSV
 *     description: Bulk import assets with validation and rollback capabilities
 */
router.post('/import',
  authenticateJWT,
  createRateLimit(15 * 60 * 1000, 5), // 5 imports per 15 minutes
  [
    body('csvData').isString().withMessage('CSV data is required'),
    body('filename').isString().withMessage('Filename is required'),
    body('validateOnly').optional().isBoolean()
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          error: 'Invalid input',
          details: errors.array(),
          errorCode: 'VALIDATION_ERROR'
        });
      }

      const { csvData, filename, validateOnly = false } = req.body;
      const userId = req.user.id;

      if (validateOnly) {
        // Perform validation only
        const records = inventoryService.parseCsvData(csvData);
        const validationResults = await inventoryService.validateRecords(records, 'validation-only');
        
        res.json({
          success: true,
          validationOnly: true,
          totalRecords: records.length,
          validRecords: validationResults.validatedData.length,
          invalidRecords: validationResults.errorCount,
          errors: validationResults.errors,
          warnings: validationResults.warnings
        });
      } else {
        // Perform full import
        const importResult = await inventoryService.importAssets(csvData, filename, userId);
        
        res.json({
          success: importResult.success,
          ...importResult
        });
      }

    } catch (error) {
      logger.error('Error importing assets:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to import assets',
        errorCode: 'IMPORT_ERROR',
        details: error.message
      });
    }
  }
);

/**
 * @swagger
 * /api/v1/pulse/inventory/import/{batchId}/rollback:
 *   post:
 *     summary: Rollback import batch
 *     description: Rollback a previously imported batch of assets
 */
router.post('/import/:batchId/rollback',
  authenticateJWT,
  [param('batchId').isUUID().withMessage('Valid batch ID is required')],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          error: 'Invalid batch ID',
          details: errors.array(),
          errorCode: 'VALIDATION_ERROR'
        });
      }

      const { batchId } = req.params;
      const userId = req.user.id;

      const rollbackResult = await inventoryService.rollbackImport(batchId, userId);

      res.json({
        success: rollbackResult.success,
        message: `Rollback completed: ${rollbackResult.deletedCount} assets removed`,
        deletedAssets: rollbackResult.deletedAssets
      });

    } catch (error) {
      logger.error('Error rolling back import:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to rollback import',
        errorCode: 'ROLLBACK_ERROR',
        details: error.message
      });
    }
  }
);

/**
 * @swagger
 * /api/v1/pulse/inventory/helix/sync:
 *   post:
 *     summary: Sync assets with Helix APIs
 *     description: Trigger bulk sync of kiosk assets with Helix identity service
 */
router.post('/helix/sync',
  authenticateJWT,
  createRateLimit(15 * 60 * 1000, 10), // 10 sync operations per 15 minutes
  async (req, res) => {
    try {
      const { limit = 100 } = req.body;

      const syncResults = await helixKioskIntegration.bulkSyncWithHelix({ limit });

      res.json({
        success: true,
        message: 'Helix sync completed',
        results: syncResults
      });

    } catch (error) {
      logger.error('Error syncing with Helix:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to sync with Helix',
        errorCode: 'HELIX_SYNC_ERROR',
        details: error.message
      });
    }
  }
);

/**
 * @swagger
 * /api/v1/pulse/inventory/helix/status:
 *   get:
 *     summary: Get Helix sync status
 *     description: Returns status of Helix integration and sync operations
 */
router.get('/helix/status',
  authenticateJWT,
  async (req, res) => {
    try {
      const syncStatus = await helixKioskIntegration.getHelixSyncStatus();

      res.json({
        success: true,
        helixSyncStatus: syncStatus
      });

    } catch (error) {
      logger.error('Error getting Helix sync status:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to get Helix sync status',
        errorCode: 'HELIX_STATUS_ERROR'
      });
    }
  }
);

export default router;
