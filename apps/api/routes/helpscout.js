import express from 'express';
import axios from 'axios';
import { getHelpScoutConfig } from '../utils/serviceHelpers.js';
import { authenticateJWT } from '../middleware/auth.js';
import db from '../db.js';
import { logger } from '../logger.js';

const router = express.Router();

// Import HelpScout tickets
router.post('/import', authenticateJWT, async (req, res) => {
  try {
    // Use environment configuration first, then fallback to request body
    const helpscoutConfig = getHelpScoutConfig();
    
    if (!helpscoutConfig) {
      const { apiKey, mailboxId } = req.body;
      
      if (!apiKey || !mailboxId) {
        return res.status(400).json({ 
          error: 'HelpScout not configured. Provide API key and Mailbox ID in request body or set environment variables.' 
        });
      }
      
      helpscoutConfig = { apiKey, mailboxId };
    }

    logger.info('Starting HelpScout ticket import', { 
      mailboxId: helpscoutConfig.mailboxId,
      userId: req.user?.id 
    });

    // Get conversations from HelpScout
    const response = await axios.get(
      `https://api.helpscout.net/v2/conversations`,
      {
        headers: { 
          Authorization: `Bearer ${helpscoutConfig.apiKey}`,
          'Content-Type': 'application/json'
        },
        params: { 
          mailbox: helpscoutConfig.mailboxId,
          status: 'active,pending',
          embed: 'threads'
        },
      }
    );

    const conversations = response.data._embedded?.conversations || [];
    let importedCount = 0;
    let skippedCount = 0;

    // Process and save tickets to database
    for (const conversation of conversations) {
      try {
        // Check if ticket already exists
        const existingTicket = await db.one(
          'SELECT id FROM tickets WHERE external_id = $1 AND external_source = $2',
          [conversation.id.toString(), 'helpscout']
        ).catch(() => null);

        if (existingTicket) {
          skippedCount++;
          continue;
        }

        // Create ticket from HelpScout conversation
        const ticketData = {
          title: conversation.subject || `HelpScout Conversation #${conversation.number}`,
          description: conversation.preview || 'Imported from HelpScout',
          status: mapHelpScoutStatus(conversation.status),
          priority: mapHelpScoutPriority(conversation.tags),
          external_id: conversation.id.toString(),
          external_source: 'helpscout',
          external_url: `https://secure.helpscout.net/conversation/${conversation.id}`,
          customer_email: conversation.customer?.email || null,
          customer_name: conversation.customer?.name || null,
          created_at: new Date(conversation.createdAt),
          updated_at: new Date(conversation.modifiedAt || conversation.createdAt),
          imported_by: req.user?.id || null
        };

        await db.none(`
          INSERT INTO tickets (
            title, description, status, priority, external_id, external_source, 
            external_url, customer_email, customer_name, created_at, updated_at, imported_by
          ) VALUES (
            $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12
          )
        `, [
          ticketData.title, ticketData.description, ticketData.status, ticketData.priority,
          ticketData.external_id, ticketData.external_source, ticketData.external_url,
          ticketData.customer_email, ticketData.customer_name, ticketData.created_at,
          ticketData.updated_at, ticketData.imported_by
        ]);

        importedCount++;
        logger.debug('Imported HelpScout ticket', { 
          conversationId: conversation.id, 
          ticketTitle: ticketData.title 
        });

      } catch (ticketError) {
        logger.error('Failed to import individual ticket', { 
          conversationId: conversation.id, 
          error: ticketError.message 
        });
      }
    }

    logger.info('HelpScout import completed', { 
      total: conversations.length, 
      imported: importedCount, 
      skipped: skippedCount 
    });

    res.status(200).json({ 
      message: 'HelpScout tickets imported successfully',
      summary: {
        total: conversations.length,
        imported: importedCount,
        skipped: skippedCount
      }
    });

  } catch (error) {
    logger.error('HelpScout import failed', { error: error.message });
    res.status(500).json({ 
      error: 'Failed to import tickets from HelpScout',
      details: error.message 
    });
  }
});

// Helper function to map HelpScout status to our ticket status
function mapHelpScoutStatus(helpscoutStatus) {
  const statusMap = {
    'active': 'open',
    'pending': 'pending',
    'closed': 'closed',
    'spam': 'closed'
  };
  return statusMap[helpscoutStatus] || 'open';
}

// Helper function to determine priority from HelpScout tags
function mapHelpScoutPriority(tags = []) {
  const tagString = tags.join(' ').toLowerCase();
  
  if (tagString.includes('urgent') || tagString.includes('high') || tagString.includes('critical')) {
    return 'high';
  } else if (tagString.includes('low')) {
    return 'low';
  }
  
  return 'medium';
}

export default router;
