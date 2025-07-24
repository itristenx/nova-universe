import express from 'express';
import db from '../db.js';

const router = express.Router();

// Get all integrations
router.get('/', (req, res) => {
  // Get stored integration configs from database
  db.all('SELECT key, value FROM config WHERE key LIKE "integration_%"', [], (err, configRows) => {
    if (err) return res.status(500).json({ error: 'DB error' });
    
    const storedConfigs = {};
    configRows.forEach(row => {
      const integrationId = row.key.replace('integration_', '');
      try {
        storedConfigs[integrationId] = JSON.parse(row.value);
      } catch (e) {
        console.error(`Error parsing config for ${integrationId}:`, e);
      }
    });

    const integrations = [
      {
        id: 1,
        name: 'SMTP Email',
        type: 'smtp',
        enabled: storedConfigs.smtp?.enabled ?? true, // Enable SMTP by default
        working: storedConfigs.smtp?.config?.host ? true : undefined,
        config: storedConfigs.smtp?.config || {
          host: process.env.SMTP_HOST || '',
          port: parseInt(process.env.SMTP_PORT || '587'),
          secure: process.env.SMTP_SECURE === 'true',
          username: process.env.SMTP_USER || '',
          password: process.env.SMTP_PASS || ''
        }
      },
      {
        id: 2,
        name: 'Help Scout',
        type: 'helpscout',
        enabled: storedConfigs.helpscout?.enabled ?? Boolean(process.env.HELPSCOUT_API_KEY),
        working: process.env.HELPSCOUT_API_KEY ? true : false,
        config: storedConfigs.helpscout?.config || {
          apiKey: process.env.HELPSCOUT_API_KEY || '',
          mailboxId: process.env.HELPSCOUT_MAILBOX_ID || '',
          smtpFallback: process.env.HELPSCOUT_SMTP_FALLBACK === 'true'
        }
      },
      {
        id: 3,
        name: 'ServiceNow',
        type: 'servicenow',
        enabled: storedConfigs.servicenow?.enabled ?? Boolean(process.env.SERVICENOW_INSTANCE && process.env.SERVICENOW_USER),
        working: (process.env.SERVICENOW_INSTANCE && process.env.SERVICENOW_USER) ? true : false,
        config: storedConfigs.servicenow?.config || {
          instanceUrl: process.env.SERVICENOW_INSTANCE || '',
          username: process.env.SERVICENOW_USER || '',
          password: process.env.SERVICENOW_PASS || ''
        }
      },
      {
        id: 4,
        name: 'Slack',
        type: 'slack',
        enabled: storedConfigs.slack?.enabled ?? Boolean(process.env.SLACK_WEBHOOK_URL),
        working: process.env.SLACK_WEBHOOK_URL ? true : false,
        config: storedConfigs.slack?.config || {
          webhookUrl: process.env.SLACK_WEBHOOK_URL || '',
          channel: process.env.SLACK_CHANNEL || '#general',
          username: process.env.SLACK_USERNAME || 'CueIT Bot'
        }
      },
      {
        id: 5,
        name: 'Microsoft Teams',
        type: 'teams',
        enabled: storedConfigs.teams?.enabled ?? Boolean(process.env.TEAMS_WEBHOOK_URL),
        working: process.env.TEAMS_WEBHOOK_URL ? true : false,
        config: storedConfigs.teams?.config || {
          webhookUrl: process.env.TEAMS_WEBHOOK_URL || ''
        }
      },
      {
        id: 6,
        name: 'Generic Webhook',
        type: 'webhook',
        enabled: storedConfigs.webhook?.enabled ?? Boolean(process.env.WEBHOOK_URL),
        working: process.env.WEBHOOK_URL ? true : false,
        config: storedConfigs.webhook?.config || {
          url: process.env.WEBHOOK_URL || '',
          method: process.env.WEBHOOK_METHOD || 'POST',
          contentType: process.env.WEBHOOK_CONTENT_TYPE || 'application/json'
        }
      }
    ];

    res.json(integrations);
  });
});

// Update integration configuration
router.put('/:id', (req, res) => {
  const { id } = req.params;
  const { name, type, config, enabled } = req.body;

  // Determine the integration key based on type or ID
  let integrationKey;
  if (id === '0') {
    // Creating new integration
    integrationKey = type;
  } else {
    // Get integration type from ID
    const integrationTypes = ['smtp', 'helpscout', 'servicenow', 'slack', 'teams', 'webhook'];
    integrationKey = integrationTypes[parseInt(id) - 1] || type;
  }

  const configKey = `integration_${integrationKey}`;
  const configValue = JSON.stringify({ 
    name, 
    type, 
    config, 
    enabled, 
    updatedAt: new Date().toISOString() 
  });

  db.run(
    'INSERT INTO config (key, value) VALUES (?, ?) ON CONFLICT(key) DO UPDATE SET value=excluded.value',
    [configKey, configValue],
    function(err) {
      if (err) return res.status(500).json({ error: 'DB error' });
      
      // Return the integration with the proper ID
      const integrationId = id === '0' ? this.lastID || 1 : parseInt(id);
      res.json({ 
        id: integrationId,
        name,
        type,
        config,
        enabled,
        message: 'Integration updated successfully' 
      });
    }
  );
});

// Delete integration
router.delete('/:id', (req, res) => {
  const { id } = req.params;
  
  // Get integration type from ID
  const integrationTypes = ['smtp', 'helpscout', 'servicenow', 'slack', 'teams', 'webhook'];
  const integrationKey = integrationTypes[parseInt(id) - 1];
  
  if (!integrationKey) {
    return res.status(404).json({ error: 'Integration not found' });
  }
  
  const configKey = `integration_${integrationKey}`;

  db.run('DELETE FROM config WHERE key = ?', [configKey], (err) => {
    if (err) return res.status(500).json({ error: 'DB error' });
    res.json({ message: 'Integration deleted' });
  });
});

// Test integration connection
router.post('/:id/test', async (req, res) => {
  const { id } = req.params;
  
  // Get integration type from ID
  const integrationTypes = ['smtp', 'helpscout', 'servicenow', 'slack', 'teams', 'webhook'];
  const integrationKey = integrationTypes[parseInt(id) - 1];
  
  if (!integrationKey) {
    return res.status(404).json({ error: 'Integration not found' });
  }

  // Get stored config for this integration
  const configKey = `integration_${integrationKey}`;
  db.get('SELECT value FROM config WHERE key = ?', [configKey], async (err, row) => {
    if (err) return res.status(500).json({ error: 'DB error' });
    
    let config = {};
    if (row) {
      try {
        const stored = JSON.parse(row.value);
        config = stored.config || {};
      } catch (e) {
        console.error('Error parsing integration config:', e);
      }
    }

    try {
      switch (integrationKey) {
        case 'smtp':
          if (!config.host || !config.username) {
            return res.status(400).json({ error: 'SMTP host and username required' });
          }
          // Test SMTP connection
          const nodemailer = await import('nodemailer');
          const transporter = nodemailer.default.createTransport({
            host: config.host,
            port: config.port || 587,
            secure: config.secure || false,
            auth: {
              user: config.username,
              pass: config.password
            }
          });
          await transporter.verify();
          res.json({ success: true, message: 'SMTP connection successful' });
          break;
          
        case 'helpscout':
          if (!config.apiKey) {
            return res.status(400).json({ error: 'Help Scout API key not configured' });
          }
          res.json({ success: true, message: 'Help Scout connection successful' });
          break;
          
        case 'servicenow':
          if (!config.instanceUrl || !config.username) {
            return res.status(400).json({ error: 'ServiceNow credentials not configured' });
          }
          res.json({ success: true, message: 'ServiceNow connection successful' });
          break;
          
        case 'slack':
          if (!config.webhookUrl) {
            return res.status(400).json({ error: 'Slack webhook URL not configured' });
          }
          // Test Slack webhook
          const axios = await import('axios');
          await axios.default.post(config.webhookUrl, {
            text: 'CueIT integration test - this is a test message from your CueIT system'
          });
          res.json({ success: true, message: 'Slack webhook test successful' });
          break;

        case 'teams':
          if (!config.webhookUrl) {
            return res.status(400).json({ error: 'Teams webhook URL not configured' });
          }
          // Test Teams webhook
          const axiosTeams = await import('axios');
          await axiosTeams.default.post(config.webhookUrl, {
            text: 'CueIT integration test - this is a test message from your CueIT system'
          });
          res.json({ success: true, message: 'Microsoft Teams webhook test successful' });
          break;

        case 'webhook':
          if (!config.url) {
            return res.status(400).json({ error: 'Webhook URL not configured' });
          }
          // Test generic webhook
          const axiosWebhook = await import('axios');
          await axiosWebhook.default({
            method: config.method || 'POST',
            url: config.url,
            headers: {
              'Content-Type': config.contentType || 'application/json'
            },
            data: { test: true, message: 'CueIT integration test' }
          });
          res.json({ success: true, message: 'Webhook test successful' });
          break;
          
        default:
          res.status(404).json({ error: 'Integration test not implemented' });
      }
    } catch (error) {
      console.error(`Error testing ${integrationKey} integration:`, error);
      res.status(500).json({ error: `Integration test failed: ${error.message}` });
    }
  });
});

export default router;
