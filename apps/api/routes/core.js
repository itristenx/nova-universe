import express from 'express';
import db from '../db.js';
import { logger } from '../logger.js';

const router = express.Router();

// GET /core/config?kiosk_id=
router.get('/config', async (req, res) => {
  try {
    const kioskId = req.query.kiosk_id || req.query.kioskId;
    if (!kioskId) {
      return res.status(400).json({ success: false, error: 'Missing kiosk_id', errorCode: 'MISSING_KIOSK_ID' });
    }

    // Fetch kiosk record if present
    db.get('SELECT * FROM kiosks WHERE id = $1', [kioskId], (err, kiosk) => {
      if (err) {
        logger.error('DB error fetching kiosk:', err);
        return res.status(500).json({ success: false, error: 'Database error', errorCode: 'DB_ERROR' });
      }

      // Fetch global config values
      db.all('SELECT key, value FROM config', (cErr, rows) => {
        if (cErr) {
          logger.error('DB error fetching config:', cErr);
          return res.status(500).json({ success: false, error: 'Config error', errorCode: 'CONFIG_ERROR' });
        }
        const cfg = Object.fromEntries((rows || []).map(r => [r.key, r.value]));

        const theme = {
          logo_url: (kiosk && kiosk.logoUrl) || cfg.logoUrl || '/logo.png',
          primary_color: cfg.theme_primary_color || '#1D1EFF'
        };

        const forms = {
          default_ticket_form_id: cfg.default_ticket_form_id || 'form_incident_kiosk'
        };

        const cosmo = {
          enabled: (cfg.cosmo_enabled === '1' || cfg.cosmo_enabled === 'true'),
          preset_prompt: cfg.cosmo_preset_prompt || 'Hi! How can I help you today?'
        };

        const response = {
          theme,
          forms,
          cosmo,
        };

        return res.json(response);
      });
    });
  } catch (error) {
    logger.error('Error in /core/config:', error);
    res.status(500).json({ success: false, error: 'Internal server error', errorCode: 'INTERNAL_ERROR' });
  }
});

export default router;