// Nova Sentinel - Notification System
// Handles email, SMS, and webhook notifications for monitoring events

import nodemailer, { Transporter } from 'nodemailer';
import twilio from 'twilio';
import axios from 'axios';
import { logger } from '../logger.js';

export interface NotificationChannel {
  id: string;
  type: 'email' | 'sms' | 'webhook' | 'slack' | 'discord';
  endpoint: string;
  enabled: boolean;
  settings: Record<string, any>;
}

export interface NotificationSubscription {
  id: string;
  tenant_id: string;
  user_id?: string;
  email?: string;
  phone?: string;
  channels: NotificationChannel[];
  monitors: string[];
  incident_types: string[];
  maintenance_notifications: boolean;
  verified: boolean;
}

export interface NotificationEvent {
  type: 'incident_created' | 'incident_updated' | 'incident_resolved' | 'monitor_down' | 'monitor_up' | 'maintenance_scheduled';
  monitor_id?: string;
  incident_id?: string;
  tenant_id: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  title: string;
  message: string;
  data: Record<string, any>;
}

class NotificationService {
  private emailTransporter: Transporter | null = null;
  private twilioClient: any = null;

  constructor() {
    this.initializeEmailTransporter();
    this.initializeTwilioClient();
  }

  private initializeEmailTransporter(): void {
    try {
      if (process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS) {
        this.emailTransporter = nodemailer.createTransport({
          host: process.env.SMTP_HOST,
          port: parseInt(process.env.SMTP_PORT || '587'),
          secure: process.env.SMTP_PORT === '465',
          auth: {
            user: process.env.SMTP_USER,
            pass: process.env.SMTP_PASS
          }
        });
        
        logger.info('Email transporter initialized');
      } else {
        logger.warn('Email configuration not found, email notifications disabled');
      }
    } catch (error: any) {
      logger.error(`Failed to initialize email transporter: ${error.message}`);
    }
  }

  private initializeTwilioClient(): void {
    try {
      if (process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN) {
        this.twilioClient = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);
        logger.info('Twilio client initialized');
      } else {
        logger.warn('Twilio configuration not found, SMS notifications disabled');
      }
    } catch (error: any) {
      logger.error(`Failed to initialize Twilio client: ${error.message}`);
    }
  }

  /**
   * Send notification to all relevant subscribers
   */
  async sendNotification(event: NotificationEvent): Promise<void> {
    try {
      const subscriptions = await this.getRelevantSubscriptions(event);
      
      for (const subscription of subscriptions) {
        await this.sendToSubscription(subscription, event);
      }
      
      logger.info(`Notifications sent for event: ${event.type} to ${subscriptions.length} subscribers`);
    } catch (error: any) {
      logger.error(`Failed to send notifications: ${error.message} for event: ${event.type}`);
    }
  }

  /**
   * Get subscriptions that should receive this notification
   */
  private async getRelevantSubscriptions(event: NotificationEvent): Promise<NotificationSubscription[]> {
    // This would query the database for relevant subscriptions
    // For now, return empty array as placeholder
    return [];
  }

  /**
   * Send notification to a specific subscription
   */
  private async sendToSubscription(subscription: NotificationSubscription, event: NotificationEvent): Promise<void> {
    for (const channel of subscription.channels) {
      if (!channel.enabled) continue;

      try {
        switch (channel.type) {
          case 'email':
            await this.sendEmail(subscription.email!, event, channel);
            break;
          case 'sms':
            await this.sendSMS(subscription.phone!, event, channel);
            break;
          case 'webhook':
            await this.sendWebhook(channel.endpoint, event, channel);
            break;
          case 'slack':
            await this.sendSlack(channel.endpoint, event, channel);
            break;
          case 'discord':
            await this.sendDiscord(channel.endpoint, event, channel);
            break;
        }
      } catch (error: any) {
        logger.error(`Failed to send notification via channel: ${channel.type} error: ${error.message}`);
      }
    }
  }

  /**
   * Send email notification
   */
  private async sendEmail(email: string, event: NotificationEvent, channel: NotificationChannel): Promise<void> {
    if (!this.emailTransporter) {
      throw new Error('Email transporter not initialized');
    }

    const template = this.getEmailTemplate(event);
    
    await this.emailTransporter.sendMail({
      from: process.env.SMTP_FROM || 'Nova Sentinel <notifications@nova.local>',
      to: email,
      subject: template.subject,
      html: template.html,
      text: template.text
    });

    logger.info(`Email notification sent to: ${email} for event: ${event.type}`);
  }

  /**
   * Send SMS notification
   */
  private async sendSMS(phone: string, event: NotificationEvent, channel: NotificationChannel): Promise<void> {
    if (!this.twilioClient) {
      throw new Error('Twilio client not initialized');
    }

    const message = this.getSMSMessage(event);
    
    await this.twilioClient.messages.create({
      body: message,
      from: process.env.TWILIO_PHONE_NUMBER,
      to: phone
    });

    logger.info(`SMS notification sent to: ${phone} for event: ${event.type}`);
  }

  /**
   * Send webhook notification
   */
  private async sendWebhook(url: string, event: NotificationEvent, channel: NotificationChannel): Promise<void> {
    const payload = {
      event_type: event.type,
      timestamp: new Date().toISOString(),
      severity: event.severity,
      title: event.title,
      message: event.message,
      data: event.data
    };

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      'User-Agent': 'Nova-Sentinel/1.0'
    };

    // Add authentication if configured
    if (channel.settings.secret) {
      headers['X-Nova-Signature'] = this.generateSignature(payload, channel.settings.secret);
    }

    await axios.post(url, payload, {
      headers,
      timeout: 10000
    });

    logger.info(`Webhook notification sent to: ${url} for event: ${event.type}`);
  }

  /**
   * Send Slack notification
   */
  private async sendSlack(webhookUrl: string, event: NotificationEvent, channel: NotificationChannel): Promise<void> {
    const color = this.getSeverityColor(event.severity);
    
    const payload = {
      attachments: [{
        color,
        title: event.title,
        text: event.message,
        fields: [
          {
            title: 'Severity',
            value: event.severity.toUpperCase(),
            short: true
          },
          {
            title: 'Time',
            value: new Date().toLocaleString(),
            short: true
          }
        ],
        footer: 'Nova Sentinel',
        footer_icon: 'https://nova.local/icon.png'
      }]
    };

    await axios.post(webhookUrl, payload);
    logger.info(`Slack notification sent for event: ${event.type}`);
  }

  /**
   * Send Discord notification
   */
  private async sendDiscord(webhookUrl: string, event: NotificationEvent, channel: NotificationChannel): Promise<void> {
    const color = this.getSeverityColorHex(event.severity);
    
    const payload = {
      embeds: [{
        title: event.title,
        description: event.message,
        color: parseInt(color.replace('#', ''), 16),
        fields: [
          {
            name: 'Severity',
            value: event.severity.toUpperCase(),
            inline: true
          },
          {
            name: 'Time',
            value: new Date().toLocaleString(),
            inline: true
          }
        ],
        footer: {
          text: 'Nova Sentinel'
        },
        timestamp: new Date().toISOString()
      }]
    };

    await axios.post(webhookUrl, payload);
    logger.info(`Discord notification sent for event: ${event.type}`);
  }

  /**
   * Generate email template based on event
   */
  private getEmailTemplate(event: NotificationEvent): { subject: string; html: string; text: string } {
    const subject = `[${event.severity.toUpperCase()}] ${event.title}`;
    
    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <title>${subject}</title>
          <style>
            body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: #f8f9fa; padding: 20px; border-radius: 8px; margin-bottom: 20px; }
            .severity { padding: 4px 8px; border-radius: 4px; color: white; font-weight: bold; }
            .critical { background: #dc3545; }
            .high { background: #fd7e14; }
            .medium { background: #ffc107; color: #000; }
            .low { background: #20c997; }
            .footer { margin-top: 30px; padding-top: 20px; border-top: 1px solid #dee2e6; color: #6c757d; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h2>${event.title}</h2>
              <span class="severity ${event.severity}">${event.severity.toUpperCase()}</span>
            </div>
            <div class="content">
              <p>${event.message}</p>
              ${event.data.monitor_name ? `<p><strong>Monitor:</strong> ${event.data.monitor_name}</p>` : ''}
              ${event.data.url ? `<p><strong>URL:</strong> ${event.data.url}</p>` : ''}
              <p><strong>Time:</strong> ${new Date().toLocaleString()}</p>
            </div>
            <div class="footer">
              <p>This notification was sent by Nova Sentinel. <a href="${process.env.FRONTEND_URL}/monitoring">View Dashboard</a></p>
            </div>
          </div>
        </body>
      </html>
    `;
    
    const text = `
${subject}

${event.message}

${event.data.monitor_name ? `Monitor: ${event.data.monitor_name}` : ''}
${event.data.url ? `URL: ${event.data.url}` : ''}
Time: ${new Date().toLocaleString()}

This notification was sent by Nova Sentinel.
    `;

    return { subject, html, text };
  }

  /**
   * Generate SMS message based on event
   */
  private getSMSMessage(event: NotificationEvent): string {
    return `[${event.severity.toUpperCase()}] ${event.title}\n\n${event.message}\n\nTime: ${new Date().toLocaleString()}`;
  }

  /**
   * Get color for severity level (Slack)
   */
  private getSeverityColor(severity: string): string {
    const colors = {
      critical: 'danger',
      high: 'warning',
      medium: 'warning',
      low: 'good'
    };
    return colors[severity] || 'good';
  }

  /**
   * Get hex color for severity level (Discord)
   */
  private getSeverityColorHex(severity: string): string {
    const colors = {
      critical: '#dc3545',
      high: '#fd7e14', 
      medium: '#ffc107',
      low: '#20c997'
    };
    return colors[severity] || '#20c997';
  }

  /**
   * Generate webhook signature
   */
  private generateSignature(payload: any, secret: string): string {
    const crypto = require('crypto');
    const body = JSON.stringify(payload);
    return crypto.createHmac('sha256', secret).update(body).digest('hex');
  }

  /**
   * Test notification delivery
   */
  async testNotification(channel: NotificationChannel): Promise<boolean> {
    const testEvent: NotificationEvent = {
      type: 'incident_created',
      tenant_id: 'test',
      severity: 'low',
      title: 'Test Notification',
      message: 'This is a test notification from Nova Sentinel to verify your notification channel is working correctly.',
      data: {}
    };

    try {
      switch (channel.type) {
        case 'email':
          await this.sendEmail(channel.endpoint, testEvent, channel);
          break;
        case 'sms':
          await this.sendSMS(channel.endpoint, testEvent, channel);
          break;
        case 'webhook':
          await this.sendWebhook(channel.endpoint, testEvent, channel);
          break;
        case 'slack':
          await this.sendSlack(channel.endpoint, testEvent, channel);
          break;
        case 'discord':
          await this.sendDiscord(channel.endpoint, testEvent, channel);
          break;
        default:
          throw new Error(`Unsupported channel type: ${channel.type}`);
      }
      return true;
    } catch (error: any) {
      logger.error(`Test notification failed for channel: ${channel.type} error: ${error.message}`);
      return false;
    }
  }
}

// Singleton instance
export const notificationService = new NotificationService();

/**
 * Send incident notification
 */
export async function sendIncidentNotification(incident: any, type: 'created' | 'updated' | 'resolved'): Promise<void> {
  const event: NotificationEvent = {
    type: `incident_${type}` as any,
    incident_id: incident.id,
    monitor_id: incident.monitor_id,
    tenant_id: incident.tenant_id,
    severity: incident.severity,
    title: `Incident ${type}: ${incident.summary}`,
    message: incident.description,
    data: {
      incident_id: incident.id,
      monitor_name: incident.monitor_name,
      status: incident.status,
      started_at: incident.started_at,
      resolved_at: incident.resolved_at
    }
  };

  await notificationService.sendNotification(event);
}

/**
 * Send monitor status notification
 */
export async function sendMonitorNotification(monitor: any, status: 'up' | 'down'): Promise<void> {
  const event: NotificationEvent = {
    type: status === 'down' ? 'monitor_down' : 'monitor_up',
    monitor_id: monitor.id,
    tenant_id: monitor.tenant_id,
    severity: status === 'down' ? 'high' : 'low',
    title: `Monitor ${status === 'down' ? 'Down' : 'Recovered'}: ${monitor.name}`,
    message: status === 'down' 
      ? `${monitor.name} is currently unreachable and may be experiencing issues.`
      : `${monitor.name} has recovered and is now responding normally.`,
    data: {
      monitor_id: monitor.id,
      monitor_name: monitor.name,
      url: monitor.url,
      type: monitor.type,
      status: status
    }
  };

  await notificationService.sendNotification(event);
}
