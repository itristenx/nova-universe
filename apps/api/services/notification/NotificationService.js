import { v4 as uuidv4 } from 'uuid';

export class NotificationService {
  constructor({ db, logger, m365EmailService }) {
    this.db = db;
    this.logger = logger;
    this.m365EmailService = m365EmailService;
  }

  async processEvent(event, app) {
    const eventId = uuidv4();
    const normalized = this.normalizeEvent(event, eventId);

    // Persist event
    await this.db.query(
      `INSERT INTO nova_notification_events (id, module, type, priority, title, message, timestamp, recipient_roles, recipient_users, actions, metadata)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)`,
      [
        eventId,
        normalized.module,
        normalized.type,
        normalized.priority,
        normalized.title,
        normalized.message,
        normalized.timestamp,
        JSON.stringify(normalized.recipient_roles || []),
        JSON.stringify(normalized.recipient_users || []),
        JSON.stringify(normalized.actions || []),
        JSON.stringify(normalized.metadata || {}),
      ]
    );

    // Resolve recipients and preferences
    const recipients = await this.resolveRecipients(normalized);
    const deliveries = [];

    for (const recipient of recipients) {
      const channels = await this.getEffectiveChannelsFor(recipient.userId, normalized);
      for (const channel of channels) {
        try {
          const result = await this.deliver(app, channel, recipient, normalized);
          deliveries.push({ userId: recipient.userId, channel, status: 'sent', result });
        } catch (err) {
          deliveries.push({ userId: recipient.userId, channel, status: 'failed', error: err.message });
        }
      }
    }

    // Store deliveries
    for (const d of deliveries) {
      await this.db.query(
        `INSERT INTO nova_notification_deliveries (event_id, user_id, channel, status, error, created_at)
         VALUES ($1, $2, $3, $4, $5, NOW())`,
        [eventId, d.userId, d.channel, d.status, d.error || null]
      );
    }

    return { eventId, deliveries };
  }

  normalizeEvent(event, eventId) {
    return {
      id: eventId,
      module: event.module || 'system',
      type: event.type,
      priority: event.priority || 'normal',
      title: event.title,
      message: event.message || '',
      timestamp: event.timestamp || new Date().toISOString(),
      recipient_roles: event.recipient_roles || [],
      recipient_users: event.recipient_users || [],
      actions: event.actions || [],
      metadata: event.metadata || {},
    };
  }

  async resolveRecipients(event) {
    const users = new Set(event.recipient_users || []);
    if ((event.recipient_roles || []).length > 0) {
      const { rows } = await this.db.query(
        `SELECT ur.user_id as id FROM user_roles ur JOIN roles r ON r.id = ur.role_id WHERE r.name = ANY($1::text[])`,
        [event.recipient_roles]
      );
      for (const row of rows) users.add(row.id);
    }
    return Array.from(users).map((userId) => ({ userId }));
  }

  async getEffectiveChannelsFor(userId, event) {
    const prefs = await this.getUserPreferences(userId);
    const modulePrefs = prefs.preferences?.[event.module]?.[event.type];
    if (Array.isArray(modulePrefs) && modulePrefs.length) return modulePrefs;
    // Default matrix per priority
    if (event.priority === 'critical') return ['push', 'email', 'in_app'];
    if (event.priority === 'high') return ['push', 'email', 'in_app'];
    if (event.priority === 'normal') return ['in_app'];
    return ['in_app'];
  }

  async deliver(app, channel, recipient, event) {
    switch (channel) {
      case 'in_app':
        if (app?.wsManager) {
          app.wsManager.sendToUser(recipient.userId, {
            type: 'notification',
            data: { title: event.title, message: event.message, level: this.mapLevel(event.priority), actions: event.actions, timestamp: event.timestamp },
          });
        }
        return true;
      case 'push':
        // Placeholder for mobile/browser push providers
        return true;
      case 'email': {
        const email = await this.lookupUserEmail(recipient.userId);
        if (!email) throw new Error('No email for user');
        await this.m365EmailService.sendEmail({
          from: process.env.M365_SENDER || process.env.SMTP_FROM || 'noreply@novauniverse.local',
          to: email,
          subject: event.title,
          html: `<p>${event.message}</p>`,
        });
        return true;
      }
      case 'slack':
      case 'teams':
      case 'webhook':
        // Placeholder: integrate via nova_notification_channels routing later
        return true;
      default:
        return true;
    }
  }

  mapLevel(priority) {
    switch (priority) {
      case 'critical':
        return 'error';
      case 'high':
        return 'warning';
      default:
        return 'info';
    }
  }

  async lookupUserEmail(userId) {
    const { rows } = await this.db.query('SELECT email FROM users WHERE id = $1 OR uuid::text = $1 LIMIT 1', [userId]);
    return rows?.[0]?.email || null;
  }

  async getUserPreferences(userId) {
    // Try core config table for per-user preferences JSON
    const { rows } = await this.db.query(
      `SELECT value FROM configurations WHERE key = $1 LIMIT 1`,
      [`user_prefs_${userId}`]
    );
    if (rows && rows[0] && rows[0].value) {
      try { return JSON.parse(rows[0].value); } catch { /* ignore */ }
    }
    // Default preferences
    return {
      user_id: userId,
      preferences: {},
      digest: { frequency: 'daily', channels: ['email'] },
      dnd: { enabled: false },
    };
  }

  async setUserPreferences(userId, prefs) {
    await this.db.query(
      `INSERT INTO configurations (id, key, value, type, category, "createdAt", "updatedAt")
       VALUES (gen_random_uuid(), $1, $2, 'string', 'notifications', NOW(), NOW())
       ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value, "updatedAt" = NOW()`,
      [`user_prefs_${userId}`, JSON.stringify(prefs)]
    );
    return prefs;
  }

  async listDeliveries({ userId, limit = 50 }) {
    const { rows } = await this.db.query(
      `SELECT * FROM nova_notification_deliveries
       WHERE ($1::text IS NULL OR user_id = $1)
       ORDER BY created_at DESC
       LIMIT $2`,
      [userId || null, limit]
    );
    return rows;
  }
}