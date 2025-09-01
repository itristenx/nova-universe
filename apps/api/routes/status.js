import express from 'express';
import db from '../db.js';
// Lazy-load status page service to avoid ESM/TS import cost in non-feature paths
async function loadStatusPageServiceSafe() {
  try {
    // Import TS module at runtime; if unavailable, return null for graceful fallback
    const mod = await import('../lib/enhanced-status-pages.ts');
    return mod.statusPageService;
  } catch (e) {
    // Log the import failure for debugging, but don't break the app
    console.warn('Status page service unavailable:', e.message);
    // If it's a module not found error, it's expected in environments without enhanced status pages
    if (e.code !== 'MODULE_NOT_FOUND') {
      console.error('Unexpected error loading status page service:', e);
    }
    return null;
  }
}

const router = express.Router();
const STATUS_PAGES_ENABLED = process.env.FEATURE_STATUS_PAGES === 'true';

// GET /status/summary
router.get('/summary', (req, res) => {
  db.all('SELECT key, value FROM config', (err, rows) => {
    if (err) return res.status(500).json({ success: false, error: 'DB error' });
    const cfg = Object.fromEntries((rows || []).map((r) => [r.key, r.value]));
    const currentStatus = cfg.currentStatus || 'operational';

    res.json({
      success: true,
      status: currentStatus,
      components: [
        { id: 'api', name: 'API', status: 'operational' },
        { id: 'db', name: 'Database', status: 'operational' },
        { id: 'notifications', name: 'Notifications', status: 'operational' },
      ],
      updatedAt: new Date().toISOString(),
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
        [page.id],
      );
      monitors = ms?.rows || [];
      const inc = await db.query?.(
        `SELECT id, title, content, severity, status, created_at, updated_at, resolved_at
         FROM nova_status_page_incidents
         WHERE status_page_id = $1
         ORDER BY created_at DESC LIMIT 50`,
        [page.id],
      );
      incidents = inc?.rows || [];
    } catch {}
    const html = sps
      ? await sps.generateStatusPageHTML(page, monitors, incidents)
      : '<!doctype html><html><body><h1>Status</h1></body></html>';
    res.setHeader('Content-Type', 'text/html');
    res.send(html);
  } catch (error) {
    console.error('Failed to render status page HTML:', error);
    console.error('Status page slug:', req.params.slug);
    
    // Send a more informative error page instead of generic message
    const errorHtml = `<!doctype html>
      <html>
        <head><title>Status Page Error</title></head>
        <body>
          <h1>Status Page Temporarily Unavailable</h1>
          <p>We're experiencing technical difficulties rendering this status page.</p>
          <p>Please try again in a few moments or contact support if the issue persists.</p>
        </body>
      </html>`;
    
    res.status(500).setHeader('Content-Type', 'text/html').send(errorHtml);
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
        [page.id],
      );
      monitors = ms?.rows || [];
      const inc = await db.query?.(
        `SELECT id, title, content, severity, status, created_at, updated_at, resolved_at
         FROM nova_status_page_incidents
         WHERE status_page_id = $1
         ORDER BY created_at DESC LIMIT 50`,
        [page.id],
      );
      incidents = inc?.rows || [];
    } catch {}
    res.json({ page, monitors, incidents, timestamp: new Date().toISOString() });
  } catch (error) {
    console.error('Failed to load status page data:', error);
    console.error('Requested status page slug:', req.params.slug);
    
    // Provide detailed error information for debugging
    const errorDetails = {
      error: 'Failed to load status page',
      slug: req.params.slug,
      timestamp: new Date().toISOString(),
      message: error.message,
      // Don't expose stack trace in production
      ...(process.env.NODE_ENV !== 'production' && { stack: error.stack })
    };
    
    res.status(500).json(errorDetails);
  }
});

export default router;
