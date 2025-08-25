import express from 'express';
import { EmailIntegrationService } from '../services/email-integration.service.js';
import { authenticateToken } from '../middleware/auth.js';
import { validateRequest } from '../middleware/validation.js';
import { body, param, query } from 'express-validator';
import logger from '../logger.js';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const router = express.Router();
const emailService = new EmailIntegrationService();

// Initialize email service
emailService.initialize().catch((error) => {
  logger.error('Failed to initialize email service:', error);
});

/**
 * Get all email accounts
 */
router.get('/accounts', authenticateToken, async (req, res) => {
  try {
    const accounts = await prisma.emailAccount.findMany({
      select: {
        id: true,
        address: true,
        displayName: true,
        provider: true,
        queue: true,
        isActive: true,
        sendAutoReply: true,
        autoCreateTickets: true,
        lastProcessed: true,
        createdAt: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    res.json({
      success: true,
      data: accounts,
    });
  } catch (error) {
    logger.error('Error fetching email accounts:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch email accounts',
    });
  }
});

/**
 * Create new email account
 */
router.post(
  '/accounts',
  authenticateToken,
  [
    body('address').isEmail().withMessage('Valid email address is required'),
    body('provider').isIn(['microsoft', 'imap', 'pop3']).withMessage('Invalid provider'),
    body('queue').optional().isString(),
    body('displayName').optional().isString(),
  ],
  validateRequest,
  async (req, res) => {
    try {
      const accountData = req.body;

      // Validate required fields based on provider
      if (accountData.provider === 'microsoft') {
        const requiredFields = ['tenantId', 'clientId', 'clientSecret'];
        for (const field of requiredFields) {
          if (!accountData[field]) {
            return res.status(400).json({
              success: false,
              error: `${field} is required for Microsoft provider`,
            });
          }
        }
      } else if (accountData.provider === 'imap' || accountData.provider === 'pop3') {
        const requiredFields = ['imapHost', 'username', 'password'];
        for (const field of requiredFields) {
          if (!accountData[field]) {
            return res.status(400).json({
              success: false,
              error: `${field} is required for ${accountData.provider.toUpperCase()} provider`,
            });
          }
        }
      }

      const account = await emailService.configureEmailAccount(accountData);

      res.status(201).json({
        success: true,
        data: {
          id: account.id,
          address: account.address,
          provider: account.provider,
          isActive: account.isActive,
        },
      });
    } catch (error) {
      logger.error('Error creating email account:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to create email account',
      });
    }
  },
);

/**
 * Update email account
 */
router.put(
  '/accounts/:id',
  authenticateToken,
  [
    param('id').isUUID().withMessage('Valid account ID is required'),
    body('address').optional().isEmail(),
    body('isActive').optional().isBoolean(),
    body('sendAutoReply').optional().isBoolean(),
    body('autoCreateTickets').optional().isBoolean(),
  ],
  validateRequest,
  async (req, res) => {
    try {
      const { id } = req.params;
      const updateData = req.body;

      const account = await prisma.emailAccount.update({
        where: { id },
        data: updateData,
      });

      // Reload email accounts in service
      await emailService.loadEmailAccounts();

      res.json({
        success: true,
        data: {
          id: account.id,
          address: account.address,
          isActive: account.isActive,
          updatedAt: account.updatedAt,
        },
      });
    } catch (error) {
      logger.error('Error updating email account:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to update email account',
      });
    }
  },
);

/**
 * Delete email account
 */
router.delete(
  '/accounts/:id',
  authenticateToken,
  [param('id').isUUID().withMessage('Valid account ID is required')],
  validateRequest,
  async (req, res) => {
    try {
      const { id } = req.params;

      await prisma.emailAccount.delete({
        where: { id },
      });

      // Reload email accounts in service
      await emailService.loadEmailAccounts();

      res.json({
        success: true,
        message: 'Email account deleted successfully',
      });
    } catch (error) {
      logger.error('Error deleting email account:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to delete email account',
      });
    }
  },
);

/**
 * Test email account connection
 */
router.post(
  '/accounts/:id/test',
  authenticateToken,
  [param('id').isUUID().withMessage('Valid account ID is required')],
  validateRequest,
  async (req, res) => {
    try {
      const { id } = req.params;

      const account = await prisma.emailAccount.findUnique({
        where: { id },
      });

      if (!account) {
        return res.status(404).json({
          success: false,
          error: 'Email account not found',
        });
      }

      // Test connection based on provider
      let testResult;
      if (account.provider === 'microsoft') {
        testResult = await emailService.testMicrosoftConnection(account);
      } else {
        testResult = await emailService.testIMAPConnection(account);
      }

      res.json({
        success: true,
        data: {
          connected: testResult.success,
          message: testResult.message,
          lastTested: new Date(),
        },
      });
    } catch (error) {
      logger.error('Error testing email account:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to test email account connection',
      });
    }
  },
);

/**
 * Send email from ticket
 */
router.post(
  '/send',
  authenticateToken,
  [
    body('ticketId').isUUID().withMessage('Valid ticket ID is required'),
    body('to').isEmail().withMessage('Valid recipient email is required'),
    body('subject').isString().isLength({ min: 1 }).withMessage('Subject is required'),
    body('html').optional().isString(),
    body('text').optional().isString(),
  ],
  validateRequest,
  async (req, res) => {
    try {
      const { ticketId, to, subject, html, text } = req.body;
      const userId = req.user.id;

      await emailService.sendTicketEmail(ticketId, userId, {
        to,
        subject,
        html,
        text,
      });

      res.json({
        success: true,
        message: 'Email sent successfully',
      });
    } catch (error) {
      logger.error('Error sending email:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to send email',
      });
    }
  },
);

/**
 * Get email statistics
 */
router.get(
  '/stats',
  authenticateToken,
  [
    query('accountId').optional().isUUID(),
    query('startDate').optional().isISO8601(),
    query('endDate').optional().isISO8601(),
  ],
  validateRequest,
  async (req, res) => {
    try {
      const { accountId, startDate, endDate } = req.query;

      const dateRange = {
        start: startDate || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
        end: endDate || new Date().toISOString(),
      };

      if (accountId) {
        const stats = await emailService.getEmailStats(accountId, dateRange);
        res.json({
          success: true,
          data: stats,
        });
      } else {
        // Get stats for all accounts
        const accounts = await prisma.emailAccount.findMany({
          where: { isActive: true },
          select: { id: true, address: true },
        });

        const allStats = await Promise.all(
          accounts.map(async (account) => {
            const stats = await emailService.getEmailStats(account.id, dateRange);
            return {
              accountId: account.id,
              address: account.address,
              ...stats,
            };
          }),
        );

        res.json({
          success: true,
          data: {
            accounts: allStats,
            summary: {
              totalAccounts: accounts.length,
              totalTicketsCreated: allStats.reduce(
                (sum, stat) => sum + stat.totalTicketsCreated,
                0,
              ),
            },
          },
        });
      }
    } catch (error) {
      logger.error('Error fetching email stats:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to fetch email statistics',
      });
    }
  },
);

/**
 * Manual email processing trigger
 */
router.post('/process', authenticateToken, async (req, res) => {
  try {
    await emailService.processIncomingEmails();

    res.json({
      success: true,
      message: 'Email processing triggered successfully',
    });
  } catch (error) {
    logger.error('Error triggering email processing:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to trigger email processing',
    });
  }
});

/**
 * Get email processing status
 */
router.get('/status', authenticateToken, async (req, res) => {
  try {
    const accounts = await prisma.emailAccount.findMany({
      where: { isActive: true },
      select: {
        id: true,
        address: true,
        provider: true,
        lastProcessed: true,
        isActive: true,
      },
    });

    res.json({
      success: true,
      data: {
        isProcessing: emailService.isProcessing,
        accounts: accounts,
        lastUpdate: new Date(),
      },
    });
  } catch (error) {
    logger.error('Error fetching email status:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch email processing status',
    });
  }
});

/**
 * Email webhook endpoint (for Microsoft Graph subscriptions)
 */
router.post('/webhook', async (req, res) => {
  try {
    // Validate webhook request
    const validationToken = req.query.validationToken;
    if (validationToken) {
      // Microsoft Graph subscription validation
      return res.send(validationToken);
    }

    // Process webhook notification
    const notification = req.body;
    logger.info('Received email webhook:', notification);

    // Trigger email processing for specific account
    if (notification.value && notification.value.length > 0) {
      await emailService.processIncomingEmails();
    }

    res.status(200).json({
      success: true,
      message: 'Webhook processed successfully',
    });
  } catch (error) {
    logger.error('Error processing email webhook:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to process webhook',
    });
  }
});

export default router;
