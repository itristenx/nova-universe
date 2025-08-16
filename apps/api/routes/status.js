import express from 'express';
import db from '../db.js';
// Lazy-load status page service to avoid ESM/TS import cost in non-feature paths
async function loadStatusPageServiceSafe() {
  try {
    // Import TS module at runtime; if unavailable, return null for graceful fallback
    const mod = await import('../lib/enhanced-status-pages.ts');
    return mod.statusPageService;
  } catch (e) {
    return null;
  }
}

const router = express.Router();
const STATUS_PAGES_ENABLED = process.env.FEATURE_STATUS_PAGES === 'true';

// GET /status/summary
router.get('/summary', (req, res) => {
  db.all("SELECT key, value FROM config", (err, rows) => {
    if (err) return res.status(500).json({ success: false, error: 'DB error' });
    const cfg = Object.fromEntries((rows || []).map(r => [r.key, r.value]));
    const currentStatus = cfg.currentStatus || 'operational';

    res.json({
      success: true,
      status: currentStatus,
      components: [
        { id: 'api', name: 'API', status: 'operational' },
        { id: 'db', name: 'Database', status: 'operational' },
        { id: 'notifications', name: 'Notifications', status: 'operational' }
      ],
      updatedAt: new Date().toISOString()
    });
  });
});

// GET /status-pages/:slug - render HTML of a status page
router.get('/status-pages/:slug', async (req, res) => {
  if (!STATUS_PAGES_ENABLED) {
    return res.status(404).send('Not found');
  }
  try {
    const slug = req.params.slug;
    const sps = await loadStatusPageServiceSafe();
    const page = sps ? await sps.getStatusPage(slug) : null;
    if (!page) {
      return res.status(404).send('Status page not found');
    }
    // Load monitors/incidents from DB if available
    let monitors = [];
    let incidents = [];
    try {
      const ms = await db.query?.(
        `SELECT m.id, m.name, sps.display_name, ms.is_up as status, sms.uptime_24h as uptime, sms.avg_response_time_24h as response_time
         FROM nova_status_page_monitors sps
         JOIN nova_monitors m ON m.id = sps.monitor_id
         LEFT JOIN nova_monitor_summary sms ON sms.id = m.id
         WHERE sps.status_page_id = $1`,
        [page.id]
      );
      monitors = ms?.rows || [];
      const inc = await db.query?.(
        `SELECT id, title, content, severity, status, created_at, updated_at, resolved_at
         FROM nova_status_page_incidents
         WHERE status_page_id = $1
         ORDER BY created_at DESC LIMIT 50`,
        [page.id]
      );
      incidents = inc?.rows || [];
    } catch {}
    const html = sps ? await sps.generateStatusPageHTML(page, monitors, incidents) : '<!doctype html><html><body><h1>Status</h1></body></html>';
    res.setHeader('Content-Type', 'text/html');
    res.send(html);
  } catch (error) {
    res.status(500).send('Failed to render status page');
  }
});

// JSON API: GET /pages/:slug
router.get('/pages/:slug', async (req, res) => {
  if (!STATUS_PAGES_ENABLED) {
    return res.status(404).json({ error: 'Feature disabled' });
  }
  try {
    const slug = req.params.slug;
    const sps = await loadStatusPageServiceSafe();
    const page = sps ? await sps.getStatusPage(slug) : null;
    if (!page) {
      return res.status(404).json({ error: 'Status page not found' });
    }
    let monitors = [];
    let incidents = [];
    try {
      const ms = await db.query?.(
        `SELECT m.id, m.name, sps.display_name, sms.is_up as is_up, sms.uptime_24h as uptime, sms.avg_response_time_24h as response_time
         FROM nova_status_page_monitors sps
         JOIN nova_monitors m ON m.id = sps.monitor_id
         LEFT JOIN nova_monitor_summary sms ON sms.id = m.id
         WHERE sps.status_page_id = $1`,
        [page.id]
      );
      monitors = ms?.rows || [];
      const inc = await db.query?.(
        `SELECT id, title, content, severity, status, created_at, updated_at, resolved_at
         FROM nova_status_page_incidents
         WHERE status_page_id = $1
         ORDER BY created_at DESC LIMIT 50`,
        [page.id]
      );
      incidents = inc?.rows || [];
    } catch {}
    res.json({ page, monitors, incidents, timestamp: new Date().toISOString() });
  } catch (error) {
    res.status(500).json({ error: 'Failed to load status page' });
  }
});

export default router;
