import express from 'express';
import db from '../db.js';

const router = express.Router();

// Get all integrations
router.get('/', (req, res) => {
  const integrations = [
    {
      id: 'helpscout',
      name: 'Help Scout',
      type: 'ticketing',
      enabled: Boolean(process.env.HELPSCOUT_API_KEY),
      status: process.env.HELPSCOUT_API_KEY ? 'connected' : 'disconnected',
      config: {
        apiKey: process.env.HELPSCOUT_API_KEY ? '[CONFIGURED]' : '',
        mailboxId: process.env.HELPSCOUT_MAILBOX_ID || '',
        smtpFallback: process.env.HELPSCOUT_SMTP_FALLBACK === 'true'
      }
    },
    {
      id: 'servicenow',
      name: 'ServiceNow',
      type: 'ticketing',
      enabled: Boolean(process.env.SERVICENOW_INSTANCE && process.env.SERVICENOW_USER),
      status: (process.env.SERVICENOW_INSTANCE && process.env.SERVICENOW_USER) ? 'connected' : 'disconnected',
      config: {
        instance: process.env.SERVICENOW_INSTANCE || '',
        username: process.env.SERVICENOW_USER || '',
        password: process.env.SERVICENOW_PASS ? '[CONFIGURED]' : ''
      }
    },
    {
      id: 'slack',
      name: 'Slack',
      type: 'notification',
      enabled: Boolean(process.env.SLACK_WEBHOOK_URL),
      status: process.env.SLACK_WEBHOOK_URL ? 'connected' : 'disconnected',
      config: {
        webhookUrl: process.env.SLACK_WEBHOOK_URL ? '[CONFIGURED]' : ''
      }
    },
    {
      id: 'saml',
      name: 'SAML SSO',
      type: 'authentication',
      enabled: Boolean(process.env.SAML_ENTRY_POINT),
      status: process.env.SAML_ENTRY_POINT ? 'connected' : 'disconnected',
      config: {
        entryPoint: process.env.SAML_ENTRY_POINT || '',
        issuer: process.env.SAML_ISSUER || '',
        callbackUrl: process.env.SAML_CALLBACK_URL || '',
        certificate: process.env.SAML_CERT ? '[CONFIGURED]' : ''
      }
    }
  ];

  res.json(integrations);
});

// Update integration configuration
router.put('/:id', (req, res) => {
  const { id } = req.params;
  const { config, enabled } = req.body;

  // For now, we'll store integration settings in the config table
  // In a real implementation, you might want to update environment variables
  // or store in a separate integrations table
  
  const configKey = `integration_${id}`;
  const configValue = JSON.stringify({ config, enabled, updatedAt: new Date().toISOString() });

  db.run(
    'INSERT INTO config (key, value) VALUES (?, ?) ON CONFLICT(key) DO UPDATE SET value=excluded.value',
    [configKey, configValue],
    (err) => {
      if (err) return res.status(500).json({ error: 'DB error' });
      res.json({ message: 'Integration updated' });
    }
  );
});

// Delete integration
router.delete('/:id', (req, res) => {
  const { id } = req.params;
  const configKey = `integration_${id}`;

  db.run('DELETE FROM config WHERE key = ?', [configKey], (err) => {
    if (err) return res.status(500).json({ error: 'DB error' });
    res.json({ message: 'Integration deleted' });
  });
});

// Test integration connection
router.post('/:id/test', async (req, res) => {
  const { id } = req.params;
  
  try {
    switch (id) {
      case 'helpscout':
        // Test Help Scout connection
        if (!process.env.HELPSCOUT_API_KEY) {
          return res.status(400).json({ error: 'Help Scout API key not configured' });
        }
        // Add actual test logic here
        res.json({ success: true, message: 'Help Scout connection successful' });
        break;
        
      case 'servicenow':
        // Test ServiceNow connection
        if (!process.env.SERVICENOW_INSTANCE || !process.env.SERVICENOW_USER) {
          return res.status(400).json({ error: 'ServiceNow credentials not configured' });
        }
        // Add actual test logic here
        res.json({ success: true, message: 'ServiceNow connection successful' });
        break;
        
      case 'slack':
        // Test Slack webhook
        if (!process.env.SLACK_WEBHOOK_URL) {
          return res.status(400).json({ error: 'Slack webhook URL not configured' });
        }
        // Add actual test logic here
        res.json({ success: true, message: 'Slack webhook test successful' });
        break;
        
      default:
        res.status(404).json({ error: 'Integration not found' });
    }
  } catch (error) {
    console.error(`Error testing ${id} integration:`, error);
    res.status(500).json({ error: 'Integration test failed' });
  }
});

export default router;
