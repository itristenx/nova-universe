// Nova Sentinel - Notification Service
// Complete notification provider management and delivery

import nodemailer from 'nodemailer';
import fetch from 'node-fetch';
import winston from 'winston';

const logger = winston.createLogger({
  level: 'info',
  format: winston.format.simple(),
  transports: [new winston.transports.Console()]
});

export class NotificationService {
  constructor(database) {
    this.database = database;
    this.emailTransporter = null;
    this.isInitialized = false;
  }

  async initialize() {
    try {
      // Initialize email transporter
      await this.initializeEmailTransporter();
      
      this.isInitialized = true;
      logger.info('Notification service initialized');
    } catch (error) {
      logger.error('Failed to initialize notification service:', error);
      throw error;
    }
  }

  async initializeEmailTransporter() {
    try {
      // Configure email transporter
      this.emailTransporter = nodemailer.createTransporter({
        host: process.env.SMTP_HOST || 'localhost',
        port: parseInt(process.env.SMTP_PORT || '587'),
        secure: process.env.SMTP_SECURE === 'true',
        auth: {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASS
        }
      });

      // Test email connection
      if (process.env.SMTP_USER) {
        await this.emailTransporter.verify();
        logger.info('Email transporter configured successfully');
      }
    } catch (error) {
      logger.warn('Email transporter configuration failed:', error.message);
      // Don't throw - email notifications are optional
    }
  }

  // ========================================================================
  // NOTIFICATION PROVIDERS MANAGEMENT
  // ========================================================================

  async createNotificationProvider(providerData) {
    try {
      const stmt = this.database.db.prepare(`
        INSERT INTO notifications (id, uptime_kuma_id, tenant_id, created_by, name, type, config, is_default, active)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
      `);

      const id = crypto.randomUUID();
      stmt.run(
        id,
        providerData.uptimeKumaId,
        providerData.tenantId,
        providerData.createdBy,
        providerData.name,
        providerData.type,
        JSON.stringify(providerData.config),
        providerData.isDefault || false,
        providerData.active !== false
      );

      return { id, ...providerData };
    } catch (error) {
      logger.error('Error creating notification provider:', error);
      throw error;
    }
  }

  async getNotificationProviders(tenantId) {
    try {
      const stmt = this.database.db.prepare(`
        SELECT * FROM notifications WHERE tenant_id = ? AND active = true ORDER BY name
      `);

      const providers = stmt.all(tenantId);
      return providers.map(provider => ({
        ...provider,
        config: JSON.parse(provider.config)
      }));
    } catch (error) {
      logger.error('Error getting notification providers:', error);
      return [];
    }
  }

  async testNotificationProvider(providerData) {
    try {
      const testMessage = {
        title: 'Test Notification',
        message: 'This is a test notification from Nova Sentinel',
        severity: 'info',
        timestamp: new Date().toISOString()
      };

      const result = await this.sendNotification(providerData, testMessage);
      return { success: true, result };
    } catch (error) {
      logger.error('Notification test failed:', error);
      return { success: false, error: error.message };
    }
  }

  // ========================================================================
  // NOTIFICATION DELIVERY
  // ========================================================================

  async sendNotification(provider, message) {
    const { type, config } = provider;

    switch (type) {
      case 'email':
        return await this.sendEmailNotification(config, message);
      case 'slack':
        return await this.sendSlackNotification(config, message);
      case 'discord':
        return await this.sendDiscordNotification(config, message);
      case 'webhook':
        return await this.sendWebhookNotification(config, message);
      case 'telegram':
        return await this.sendTelegramNotification(config, message);
      case 'teams':
        return await this.sendTeamsNotification(config, message);
      default:
        throw new Error(`Unsupported notification type: ${type}`);
    }
  }

  async sendEmailNotification(config, message) {
    if (!this.emailTransporter) {
      throw new Error('Email transporter not configured');
    }

    const html = this.generateEmailHTML(message);

    const mailOptions = {
      from: config.from || process.env.SMTP_FROM,
      to: config.to,
      subject: `${message.title} - Nova Sentinel`,
      text: message.message,
      html: html
    };

    const result = await this.emailTransporter.sendMail(mailOptions);
    return { messageId: result.messageId, accepted: result.accepted };
  }

  async sendSlackNotification(config, message) {
    const payload = {
      text: message.title,
      attachments: [{
        color: this.getSeverityColor(message.severity),
        fields: [{
          title: 'Message',
          value: message.message,
          short: false
        }, {
          title: 'Time',
          value: new Date(message.timestamp).toLocaleString(),
          short: true
        }]
      }]
    };

    const response = await fetch(config.webhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      throw new Error(`Slack notification failed: ${response.statusText}`);
    }

    return { status: 'sent', platform: 'slack' };
  }

  async sendDiscordNotification(config, message) {
    const payload = {
      embeds: [{
        title: message.title,
        description: message.message,
        color: parseInt(this.getSeverityColor(message.severity).replace('#', ''), 16),
        timestamp: message.timestamp,
        footer: {
          text: 'Nova Sentinel'
        }
      }]
    };

    const response = await fetch(config.webhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      throw new Error(`Discord notification failed: ${response.statusText}`);
    }

    return { status: 'sent', platform: 'discord' };
  }

  async sendWebhookNotification(config, message) {
    const payload = {
      title: message.title,
      message: message.message,
      severity: message.severity,
      timestamp: message.timestamp,
      source: 'nova-sentinel',
      ...config.customFields
    };

    const response = await fetch(config.url, {
      method: config.method || 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...config.headers
      },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      throw new Error(`Webhook notification failed: ${response.statusText}`);
    }

    return { status: 'sent', platform: 'webhook' };
  }

  async sendTelegramNotification(config, message) {
    const text = `*${message.title}*\n\n${message.message}\n\n_${new Date(message.timestamp).toLocaleString()}_`;
    
    const url = `https://api.telegram.org/bot${config.botToken}/sendMessage`;
    const payload = {
      chat_id: config.chatId,
      text: text,
      parse_mode: 'Markdown'
    };

    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      throw new Error(`Telegram notification failed: ${response.statusText}`);
    }

    return { status: 'sent', platform: 'telegram' };
  }

  async sendTeamsNotification(config, message) {
    const payload = {
      '@type': 'MessageCard',
      '@context': 'http://schema.org/extensions',
      summary: message.title,
      themeColor: this.getSeverityColor(message.severity),
      sections: [{
        activityTitle: message.title,
        activitySubtitle: new Date(message.timestamp).toLocaleString(),
        text: message.message,
        markdown: true
      }]
    };

    const response = await fetch(config.webhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      throw new Error(`Teams notification failed: ${response.statusText}`);
    }

    return { status: 'sent', platform: 'teams' };
  }

  // ========================================================================
  // STATUS PAGE NOTIFICATIONS
  // ========================================================================

  async notifyStatusPageSubscribers(statusPageId, notification) {
    try {
      const subscribers = await this.database.getSubscribers(statusPageId, notification.type);
      
      if (subscribers.length === 0) {
        logger.debug(`No subscribers for status page ${statusPageId}`);
        return;
      }

      const results = [];
      
      for (const subscriber of subscribers) {
        try {
          const emailConfig = {
            to: subscriber.email,
            from: process.env.SMTP_FROM || 'noreply@nova-sentinel.com'
          };

          const message = {
            title: notification.title,
            message: notification.content,
            severity: notification.type === 'incident' ? 'error' : 'info',
            timestamp: new Date().toISOString()
          };

          await this.sendEmailNotification(emailConfig, message);
          results.push({ email: subscriber.email, status: 'sent' });
        } catch (error) {
          logger.error(`Failed to notify subscriber ${subscriber.email}:`, error);
          results.push({ email: subscriber.email, status: 'failed', error: error.message });
        }
      }

      logger.info(`Notified ${results.filter(r => r.status === 'sent').length}/${subscribers.length} subscribers`);
      return results;
    } catch (error) {
      logger.error('Error notifying status page subscribers:', error);
      throw error;
    }
  }

  async sendSubscriptionConfirmation(subscriptionData) {
    try {
      if (!this.emailTransporter) {
        throw new Error('Email transporter not configured');
      }

      const { email, statusPageTitle, confirmationUrl } = subscriptionData;

      const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>Confirm Your Subscription</title>
</head>
<body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
  <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
    <h2 style="color: #2563eb;">Confirm Your Subscription</h2>
    <p>Thank you for subscribing to updates for <strong>${statusPageTitle}</strong>.</p>
    <p>To confirm your subscription and start receiving notifications, please click the button below:</p>
    <div style="text-align: center; margin: 30px 0;">
      <a href="${confirmationUrl}" 
         style="background: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
        Confirm Subscription
      </a>
    </div>
    <p style="color: #666; font-size: 14px;">
      If the button doesn't work, you can copy and paste this link into your browser:<br>
      <a href="${confirmationUrl}">${confirmationUrl}</a>
    </p>
    <hr style="margin: 30px 0; border: none; border-top: 1px solid #eee;">
    <p style="color: #666; font-size: 12px;">
      This confirmation email was sent to ${email}. If you did not request this subscription, you can safely ignore this email.
    </p>
  </div>
</body>
</html>`;

      const mailOptions = {
        from: process.env.SMTP_FROM || 'noreply@nova-sentinel.com',
        to: email,
        subject: `Confirm subscription to ${statusPageTitle}`,
        html: html
      };

      await this.emailTransporter.sendMail(mailOptions);
      logger.info(`Subscription confirmation sent to ${email}`);
    } catch (error) {
      logger.error('Failed to send subscription confirmation:', error);
      throw error;
    }
  }

  // ========================================================================
  // MONITOR NOTIFICATIONS
  // ========================================================================

  async notifyMonitorEvent(monitor, event, providers) {
    try {
      if (!providers || providers.length === 0) {
        logger.debug(`No notification providers for monitor ${monitor.name}`);
        return;
      }

      const message = this.formatMonitorEventMessage(monitor, event);
      const results = [];

      for (const provider of providers) {
        try {
          const result = await this.sendNotification(provider, message);
          results.push({ provider: provider.name, status: 'sent', result });
        } catch (error) {
          logger.error(`Failed to send notification via ${provider.name}:`, error);
          results.push({ provider: provider.name, status: 'failed', error: error.message });
        }
      }

      return results;
    } catch (error) {
      logger.error('Error sending monitor notifications:', error);
      throw error;
    }
  }

  formatMonitorEventMessage(monitor, event) {
    const isDown = event.type === 'monitor_down';
    
    return {
      title: `${monitor.name} is ${isDown ? 'DOWN' : 'UP'}`,
      message: isDown 
        ? `Monitor "${monitor.name}" has failed.\n\nError: ${event.heartbeat.msg || 'Unknown error'}\nURL: ${monitor.config?.url || 'N/A'}`
        : `Monitor "${monitor.name}" has recovered.\n\nResponse time: ${event.heartbeat.ping || 0}ms`,
      severity: isDown ? 'error' : 'success',
      timestamp: event.heartbeat.time || new Date().toISOString(),
      metadata: {
        monitorId: monitor.uptime_kuma_id,
        monitorType: monitor.type,
        responseTime: event.heartbeat.ping,
        previousStatus: event.previousStatus
      }
    };
  }

  // ========================================================================
  // UTILITY METHODS
  // ========================================================================

  generateEmailHTML(message) {
    const severityColors = {
      success: '#10b981',
      info: '#3b82f6',
      warning: '#f59e0b',
      error: '#ef4444'
    };

    const color = severityColors[message.severity] || '#6b7280';

    return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>${message.title}</title>
</head>
<body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0;">
  <div style="max-width: 600px; margin: 0 auto; background: #ffffff;">
    <div style="background: ${color}; color: white; padding: 20px; text-align: center;">
      <h1 style="margin: 0; font-size: 24px;">${message.title}</h1>
    </div>
    <div style="padding: 30px;">
      <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
        <pre style="white-space: pre-wrap; margin: 0; font-family: inherit;">${message.message}</pre>
      </div>
      <p style="color: #666; font-size: 14px; margin: 0;">
        <strong>Time:</strong> ${new Date(message.timestamp).toLocaleString()}<br>
        <strong>Source:</strong> Nova Sentinel
      </p>
    </div>
    <div style="background: #f8f9fa; padding: 20px; text-align: center; color: #666; font-size: 12px;">
      <p style="margin: 0;">This notification was sent by Nova Sentinel monitoring system.</p>
    </div>
  </div>
</body>
</html>`;
  }

  getSeverityColor(severity) {
    const colors = {
      success: '#10b981',
      info: '#3b82f6',
      warning: '#f59e0b',
      error: '#ef4444'
    };
    return colors[severity] || '#6b7280';
  }

  async healthCheck() {
    return this.isInitialized;
  }

  async close() {
    if (this.emailTransporter) {
      this.emailTransporter.close();
      this.emailTransporter = null;
    }
    this.isInitialized = false;
    logger.info('Notification service closed');
  }
}

export default NotificationService;
