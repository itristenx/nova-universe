/**
 * Email Actions Routes
 * Handles email-based workflow actions like approve/deny from email links
 * Similar to ServiceNow email actions
 */

import express from 'express';
import crypto from 'crypto';
import { logger } from '../logger.js';
import enhancedEmailTrackingService from '../services/enhanced-email-tracking.service.js';
import { audit } from '../middleware/audit.js';

const router = express.Router();

/**
 * Handle email action: Approve
 * GET /api/v1/email-actions/approve?token=<token>
 */
router.get('/approve', audit('email_action_approve'), async (req, res) => {
  try {
    const { token } = req.query;
    
    if (!token) {
      return res.status(400).json({
        success: false,
        error: 'Missing action token'
      });
    }

    // Process the action token
    const actionData = await enhancedEmailTrackingService.processActionToken(
      token, 
      req.get('User-Agent'), 
      req.ip
    );

    const { ticketId, workflowId, instanceId } = actionData.context;

    // Execute approval logic
    const result = await executeApprovalAction(ticketId, workflowId, instanceId, 'approved', req);

    // Return user-friendly response page
    res.send(generateActionResponsePage('approved', ticketId, result));

  } catch (error) {
    logger.error('Error processing email approval action:', error);
    res.status(400).send(generateErrorPage(error.message));
  }
});

/**
 * Handle email action: Deny/Reject
 * GET /api/v1/email-actions/deny?token=<token>
 */
router.get('/deny', audit('email_action_deny'), async (req, res) => {
  try {
    const { token } = req.query;
    
    if (!token) {
      return res.status(400).json({
        success: false,
        error: 'Missing action token'
      });
    }

    // Process the action token
    const actionData = await enhancedEmailTrackingService.processActionToken(
      token, 
      req.get('User-Agent'), 
      req.ip
    );

    const { ticketId, workflowId, instanceId } = actionData.context;

    // Execute denial logic
    const result = await executeApprovalAction(ticketId, workflowId, instanceId, 'denied', req);

    // Return user-friendly response page
    res.send(generateActionResponsePage('denied', ticketId, result));

  } catch (error) {
    logger.error('Error processing email denial action:', error);
    res.status(400).send(generateErrorPage(error.message));
  }
});

/**
 * Handle email action: Comment (redirect to ticket)
 * GET /api/v1/email-actions/comment?token=<token>
 */
router.get('/comment', audit('email_action_comment'), async (req, res) => {
  try {
    const { token } = req.query;
    
    if (!token) {
      return res.status(400).json({
        success: false,
        error: 'Missing action token'
      });
    }

    // Process the action token
    const actionData = await enhancedEmailTrackingService.processActionToken(
      token, 
      req.get('User-Agent'), 
      req.ip
    );

    const { ticketId } = actionData.context;
    const redirectUrl = `${process.env.PUBLIC_URL || 'https://nova.local'}/tickets/${ticketId}#comment`;

    // Redirect to ticket with comment section focused
    res.redirect(redirectUrl);

  } catch (error) {
    logger.error('Error processing email comment action:', error);
    res.status(400).send(generateErrorPage(error.message));
  }
});

/**
 * Email tracking pixel endpoint
 * GET /api/v1/email-tracking/pixel/:trackingId.png
 */
router.get('/pixel/:trackingId.png', async (req, res) => {
  try {
    const { trackingId } = req.params;
    
    // Log email open event
    logger.info('Email opened', {
      trackingId,
      userAgent: req.get('User-Agent'),
      ip: req.ip,
      timestamp: new Date()
    });

    // Return 1x1 transparent PNG
    const pixel = Buffer.from([
      0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A, 0x00, 0x00, 0x00, 0x0D,
      0x49, 0x48, 0x44, 0x52, 0x00, 0x00, 0x00, 0x01, 0x00, 0x00, 0x00, 0x01,
      0x08, 0x06, 0x00, 0x00, 0x00, 0x1F, 0x15, 0xC4, 0x89, 0x00, 0x00, 0x00,
      0x0A, 0x49, 0x44, 0x41, 0x54, 0x78, 0x9C, 0x63, 0x00, 0x01, 0x00, 0x00,
      0x05, 0x00, 0x01, 0x0D, 0x0A, 0x2D, 0xB4, 0x00, 0x00, 0x00, 0x00, 0x49,
      0x45, 0x4E, 0x44, 0xAE, 0x42, 0x60, 0x82
    ]);

    res.set({
      'Content-Type': 'image/png',
      'Content-Length': pixel.length,
      'Cache-Control': 'no-cache, no-store, must-revalidate',
      'Pragma': 'no-cache',
      'Expires': '0'
    });

    res.send(pixel);

  } catch (error) {
    logger.error('Error serving tracking pixel:', error);
    res.status(500).send('Error');
  }
});

/**
 * Webhook for processing incoming email replies
 * POST /api/v1/email-actions/webhook/reply
 */
router.post('/webhook/reply', audit('email_reply_webhook'), async (req, res) => {
  try {
    const emailData = req.body;
    
    // Validate webhook signature if configured
    if (process.env.EMAIL_WEBHOOK_SECRET) {
      const signature = req.get('X-Email-Signature');
      if (!validateWebhookSignature(signature, emailData)) {
        return res.status(401).json({ error: 'Invalid webhook signature' });
      }
    }

    // Process email reply
    const result = await enhancedEmailTrackingService.processEmailReply(emailData);

    res.json(result);

  } catch (error) {
    logger.error('Error processing email reply webhook:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to process email reply'
    });
  }
});

/**
 * Execute approval/denial action on ticket or workflow with proper error handling
 */
async function executeApprovalAction(ticketId, workflowId, instanceId, decision, req) {
  try {
    let result = {};

    if (workflowId && instanceId) {
      // Handle workflow approval with proper error handling
      try {
        const workflowService = await import('../services/workflow.service.js');
        
        // Check if the service has the expected method
        if (workflowService.default && typeof workflowService.default.processApprovalDecision === 'function') {
          result = await workflowService.default.processApprovalDecision(instanceId, decision, {
            approvedBy: 'email_action',
            metadata: {
              userAgent: req.get('User-Agent'),
              ip: req.ip,
              timestamp: new Date()
            }
          });
        } else if (workflowService.processApprovalDecision && typeof workflowService.processApprovalDecision === 'function') {
          result = await workflowService.processApprovalDecision(instanceId, decision, {
            approvedBy: 'email_action',
            metadata: {
              userAgent: req.get('User-Agent'),
              ip: req.ip,
              timestamp: new Date()
            }
          });
        } else {
          logger.warn('Workflow service does not have processApprovalDecision method, falling back to ticket update');
          throw new Error('Workflow approval method not available');
        }
      } catch (workflowError) {
        logger.error('Error processing workflow approval, falling back to ticket update:', workflowError);
        // Fall back to ticket update if workflow processing fails
        if (ticketId) {
          const ticketService = await import('../services/enhanced-ticket.service.js');
          result = await ticketService.TicketService.updateTicketStatus(ticketId, {
            status: decision === 'approved' ? 'approved' : 'rejected',
            updatedBy: 'email_action',
            comment: `${decision.charAt(0).toUpperCase() + decision.slice(1)} via email action (workflow fallback)`,
            metadata: {
              approvalMethod: 'email',
              userAgent: req.get('User-Agent'),
              ip: req.ip,
              workflowFallback: true
            }
          });
        }
      }
    } else if (ticketId) {
      // Handle ticket approval (e.g., for service requests)
      const ticketService = await import('../services/enhanced-ticket.service.js');
      result = await ticketService.TicketService.updateTicketStatus(ticketId, {
        status: decision === 'approved' ? 'approved' : 'rejected',
        updatedBy: 'email_action',
        comment: `${decision.charAt(0).toUpperCase() + decision.slice(1)} via email action`,
        metadata: {
          approvalMethod: 'email',
          userAgent: req.get('User-Agent'),
          ip: req.ip
        }
      });
    }

    // Send notification about the action (with error handling)
    try {
      const notificationService = await import('../services/notification.service.js');
      if (notificationService.NotificationService && typeof notificationService.NotificationService.sendApprovalNotification === 'function') {
        await notificationService.NotificationService.sendApprovalNotification(
          ticketId, 
          decision, 
          'email_action'
        );
      }
    } catch (notificationError) {
      logger.error('Error sending approval notification:', notificationError);
      // Don't fail the approval if notification fails
    }

    return result;
  } catch (error) {
    logger.error('Error executing approval action:', error);
    throw error;
  }
}

/**
 * Generate user-friendly response page for email actions
 */
function generateActionResponsePage(action, ticketId, result) {
  const title = action === 'approved' ? 'Request Approved' : 'Request Denied';
  const message = action === 'approved' 
    ? 'Your approval has been recorded successfully.'
    : 'Your denial has been recorded successfully.';

  // Enhanced response with result details
  const resultDetails = result ? {
    timestamp: result.timestamp || new Date().toISOString(),
    transactionId: result.transactionId || ticketId,
    status: result.status || 'processed',
    processingTime: result.processingTime || 'immediate'
  } : null;

  // Additional context based on result data
  let additionalInfo = '';
  if (resultDetails) {
    additionalInfo = `
      <div class="result-details">
        <p><strong>Transaction ID:</strong> ${resultDetails.transactionId}</p>
        <p><strong>Processed at:</strong> ${new Date(resultDetails.timestamp).toLocaleString()}</p>
        <p><strong>Status:</strong> ${resultDetails.status}</p>
        ${resultDetails.processingTime !== 'immediate' ? 
          `<p><strong>Processing time:</strong> ${resultDetails.processingTime}</p>` : ''}
      </div>
    `;
  }

  return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>${title} - Nova</title>
      <style>
        body {
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          margin: 0;
          padding: 20px;
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .container {
          background: white;
          border-radius: 12px;
          padding: 40px;
          box-shadow: 0 20px 40px rgba(0,0,0,0.1);
          text-align: center;
          max-width: 500px;
          width: 100%;
        }
        .icon {
          font-size: 64px;
          margin-bottom: 20px;
        }
        .success { color: #22c55e; }
        .error { color: #ef4444; }
        h1 {
          color: #1f2937;
          margin-bottom: 10px;
          font-size: 28px;
        }
        p {
          color: #6b7280;
          font-size: 16px;
          line-height: 1.6;
          margin-bottom: 30px;
        }
        .ticket-info {
          background: #f8fafc;
          border-radius: 8px;
          padding: 16px;
          margin: 20px 0;
        }
        .result-details {
          background: #e0f2fe;
          border-radius: 8px;
          padding: 16px;
          margin: 20px 0;
          border-left: 4px solid #0ea5e9;
        }
        .result-details p {
          margin-bottom: 8px;
          font-size: 14px;
        }
        .btn {
          display: inline-block;
          background: #3b82f6;
          color: white;
          padding: 12px 24px;
          border-radius: 8px;
          text-decoration: none;
          font-weight: 500;
          transition: background 0.2s;
        }
        .btn:hover {
          background: #2563eb;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="icon ${action === 'approved' ? 'success' : 'error'}">
          ${action === 'approved' ? '✅' : '❌'}
        </div>
        <h1>${title}</h1>
        <p>${message}</p>
        <div class="ticket-info">
          <strong>Ticket ID:</strong> ${ticketId}<br>
          <strong>Action:</strong> ${action.charAt(0).toUpperCase() + action.slice(1)}<br>
          <strong>Processed:</strong> ${new Date().toLocaleString()}
        </div>
        ${additionalInfo}
        <a href="${process.env.PUBLIC_URL || 'https://nova.local'}/tickets/${ticketId}" class="btn">
          View Ticket
        </a>
      </div>
    </body>
    </html>
  `;
}

/**
 * Generate error page
 */
function generateErrorPage(errorMessage) {
  return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Action Failed - Nova</title>
      <style>
        body {
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          margin: 0;
          padding: 20px;
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .container {
          background: white;
          border-radius: 12px;
          padding: 40px;
          box-shadow: 0 20px 40px rgba(0,0,0,0.1);
          text-align: center;
          max-width: 500px;
          width: 100%;
        }
        .icon {
          font-size: 64px;
          margin-bottom: 20px;
          color: #ef4444;
        }
        h1 {
          color: #1f2937;
          margin-bottom: 10px;
          font-size: 28px;
        }
        p {
          color: #6b7280;
          font-size: 16px;
          line-height: 1.6;
          margin-bottom: 30px;
        }
        .error-message {
          background: #fef2f2;
          border: 1px solid #fecaca;
          border-radius: 8px;
          padding: 16px;
          margin: 20px 0;
          color: #dc2626;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="icon">⚠️</div>
        <h1>Action Failed</h1>
        <p>We encountered an error processing your request.</p>
        <div class="error-message">
          ${errorMessage}
        </div>
        <p>Please contact support if this issue persists.</p>
      </div>
    </body>
    </html>
  `;
}

/**
 * Validate webhook signature for security
 */
function validateWebhookSignature(signature, payload) {
  if (!process.env.EMAIL_WEBHOOK_SECRET || !signature) {
    return false;
  }

  const expectedSignature = crypto
    .createHmac('sha256', process.env.EMAIL_WEBHOOK_SECRET)
    .update(JSON.stringify(payload))
    .digest('hex');

  return signature === `sha256=${expectedSignature}`;
}

export default router;