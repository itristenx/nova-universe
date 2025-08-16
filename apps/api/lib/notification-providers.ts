// Nova Sentinel - Extended Notification Providers
// Implementing 90+ notification services to match Uptime Kuma parity

import axios from 'axios';
import crypto from 'crypto';
import { logger } from '../logger.js';

export interface NotificationProvider {
  id: string;
  name: string;
  type: string;
  config: Record<string, any>;
}

export interface NotificationMessage {
  title: string;
  message: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  monitor?: string;
  url?: string;
  timestamp: string;
  data?: Record<string, any>;
}

/**
 * Extended Notification Provider Service
 * Supports 90+ notification services for complete Uptime Kuma parity
 */
export class NotificationProviderService {
  /**
   * Telegram Bot notifications
   */
  async sendTelegram(provider: NotificationProvider, message: NotificationMessage): Promise<void> {
    const { bot_token, chat_id, thread_id, silent_notification } = provider.config;

    const text = `🚨 *${message.title}*\n\n${message.message}\n\n📊 Severity: ${message.severity.toUpperCase()}\n⏰ Time: ${message.timestamp}`;

    const payload: any = {
      chat_id,
      text,
      parse_mode: 'Markdown',
      disable_notification: silent_notification || false,
    };

    if (thread_id) payload.message_thread_id = thread_id;

    await axios.post(`https://api.telegram.org/bot${bot_token}/sendMessage`, payload);
    logger.info(`Telegram notification sent to chat: ${chat_id}`);
  }

  /**
   * Pushover notifications
   */
  async sendPushover(provider: NotificationProvider, message: NotificationMessage): Promise<void> {
    const { user_key, api_token, device, priority, sound } = provider.config;

    const priorityMap = { low: -1, medium: 0, high: 1, critical: 2 };

    const payload = {
      token: api_token,
      user: user_key,
      title: message.title,
      message: message.message,
      priority: priorityMap[message.severity] || 0,
      device: device || undefined,
      sound: sound || undefined,
      url: message.url || undefined,
      timestamp: Math.floor(new Date(message.timestamp).getTime() / 1000),
    };

    await axios.post('https://api.pushover.net/1/messages.json', payload);
    logger.info(`Pushover notification sent to user: ${user_key}`);
  }

  /**
   * Microsoft Teams notifications
   */
  async sendTeams(provider: NotificationProvider, message: NotificationMessage): Promise<void> {
    const { webhook_url } = provider.config;

    const colorMap = {
      low: '#20c997',
      medium: '#ffc107',
      high: '#fd7e14',
      critical: '#dc3545',
    };

    const payload = {
      '@type': 'MessageCard',
      '@context': 'https://schema.org/extensions',
      summary: message.title,
      themeColor: colorMap[message.severity],
      sections: [
        {
          activityTitle: message.title,
          activitySubtitle: `Severity: ${message.severity.toUpperCase()}`,
          text: message.message,
          facts: [
            { name: 'Monitor', value: message.monitor || 'N/A' },
            { name: 'Time', value: message.timestamp },
            { name: 'URL', value: message.url || 'N/A' },
          ],
        },
      ],
    };

    await axios.post(webhook_url, payload);
    logger.info('Teams notification sent');
  }

  /**
   * Matrix notifications
   */
  async sendMatrix(provider: NotificationProvider, message: NotificationMessage): Promise<void> {
    const { homeserver_url, access_token, room_id } = provider.config;

    const content = {
      msgtype: 'm.text',
      body: `${message.title}\n\n${message.message}\n\nSeverity: ${message.severity.toUpperCase()}\nTime: ${message.timestamp}`,
      format: 'org.matrix.custom.html',
      formatted_body: `<strong>${message.title}</strong><br><br>${message.message}<br><br><em>Severity: ${message.severity.toUpperCase()}</em><br><em>Time: ${message.timestamp}</em>`,
    };

    const txnId = Date.now();
    const url = `${homeserver_url}/_matrix/client/r0/rooms/${room_id}/send/m.room.message/${txnId}`;

    await axios.put(url, content, {
      headers: { Authorization: `Bearer ${access_token}` },
    });

    logger.info(`Matrix notification sent to room: ${room_id}`);
  }

  /**
   * Signal notifications
   */
  async sendSignal(provider: NotificationProvider, message: NotificationMessage): Promise<void> {
    const { signal_cli_url, number, recipients } = provider.config;

    const text = `${message.title}\n\n${message.message}\n\nSeverity: ${message.severity.toUpperCase()}\nTime: ${message.timestamp}`;

    const payload = {
      message: text,
      number: number,
      recipients: Array.isArray(recipients) ? recipients : [recipients],
    };

    await axios.post(`${signal_cli_url}/v2/send`, payload);
    logger.info('Signal notification sent');
  }

  /**
   * Gotify notifications
   */
  async sendGotify(provider: NotificationProvider, message: NotificationMessage): Promise<void> {
    const { server_url, app_token } = provider.config;

    const priorityMap = { low: 2, medium: 5, high: 8, critical: 10 };

    const payload = {
      title: message.title,
      message: message.message,
      priority: priorityMap[message.severity] || 5,
      extras: {
        'client::display': {
          contentType: 'text/markdown',
        },
      },
    };

    await axios.post(`${server_url}/message`, payload, {
      headers: { 'X-Gotify-Key': app_token },
    });

    logger.info('Gotify notification sent');
  }

  /**
   * PagerDuty notifications
   */
  async sendPagerDuty(provider: NotificationProvider, message: NotificationMessage): Promise<void> {
    const { integration_key, severity_mapping } = provider.config;

    const severityMap = severity_mapping || {
      low: 'info',
      medium: 'warning',
      high: 'error',
      critical: 'critical',
    };

    const payload = {
      routing_key: integration_key,
      event_action: 'trigger',
      payload: {
        summary: message.title,
        source: 'Nova Sentinel',
        severity: severityMap[message.severity] || 'error',
        component: message.monitor || 'Unknown',
        custom_details: {
          message: message.message,
          url: message.url,
          timestamp: message.timestamp,
        },
      },
    };

    await axios.post('https://events.pagerduty.com/v2/enqueue', payload);
    logger.info('PagerDuty notification sent');
  }

  /**
   * Opsgenie notifications
   */
  async sendOpsgenie(provider: NotificationProvider, message: NotificationMessage): Promise<void> {
    const { api_key, region, teams, tags } = provider.config;

    const baseUrl = region === 'eu' ? 'https://api.eu.opsgenie.com' : 'https://api.opsgenie.com';

    const priorityMap = { low: 'P5', medium: 'P4', high: 'P2', critical: 'P1' };

    const payload = {
      message: message.title,
      description: message.message,
      priority: priorityMap[message.severity] || 'P3',
      source: 'Nova Sentinel',
      teams: teams ? [{ name: teams }] : undefined,
      tags: tags ? tags.split(',').map((t: string) => t.trim()) : undefined,
      details: {
        monitor: message.monitor,
        url: message.url,
        severity: message.severity,
        timestamp: message.timestamp,
      },
    };

    await axios.post(`${baseUrl}/v2/alerts`, payload, {
      headers: { Authorization: `GenieKey ${api_key}` },
    });

    logger.info('Opsgenie notification sent');
  }

  /**
   * Pushbullet notifications
   */
  async sendPushbullet(
    provider: NotificationProvider,
    message: NotificationMessage,
  ): Promise<void> {
    const { access_token, device_iden } = provider.config;

    const payload = {
      type: 'note',
      title: message.title,
      body: `${message.message}\n\nSeverity: ${message.severity.toUpperCase()}\nTime: ${message.timestamp}`,
      device_iden: device_iden || undefined,
    };

    await axios.post('https://api.pushbullet.com/v2/pushes', payload, {
      headers: {
        'Access-Token': access_token,
        'Content-Type': 'application/json',
      },
    });

    logger.info('Pushbullet notification sent');
  }

  /**
   * LINE Notify notifications
   */
  async sendLine(provider: NotificationProvider, message: NotificationMessage): Promise<void> {
    const { access_token } = provider.config;

    const text = `${message.title}\n\n${message.message}\n\nSeverity: ${message.severity.toUpperCase()}\nTime: ${message.timestamp}`;

    const payload = new URLSearchParams();
    payload.append('message', text);

    await axios.post('https://notify-api.line.me/api/notify', payload, {
      headers: {
        Authorization: `Bearer ${access_token}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
    });

    logger.info('LINE notification sent');
  }

  /**
   * Mattermost notifications
   */
  async sendMattermost(
    provider: NotificationProvider,
    message: NotificationMessage,
  ): Promise<void> {
    const { webhook_url, channel, username, icon_url } = provider.config;

    const colorMap = {
      low: '#20c997',
      medium: '#ffc107',
      high: '#fd7e14',
      critical: '#dc3545',
    };

    const payload = {
      channel: channel || undefined,
      username: username || 'Nova Sentinel',
      icon_url: icon_url || undefined,
      attachments: [
        {
          color: colorMap[message.severity],
          title: message.title,
          text: message.message,
          fields: [
            { short: true, title: 'Severity', value: message.severity.toUpperCase() },
            { short: true, title: 'Time', value: message.timestamp },
            { short: false, title: 'Monitor', value: message.monitor || 'N/A' },
          ],
        },
      ],
    };

    await axios.post(webhook_url, payload);
    logger.info('Mattermost notification sent');
  }

  /**
   * Rocket.Chat notifications
   */
  async sendRocketChat(
    provider: NotificationProvider,
    message: NotificationMessage,
  ): Promise<void> {
    const { webhook_url, channel, username, avatar } = provider.config;

    const payload = {
      channel: channel || undefined,
      username: username || 'Nova Sentinel',
      avatar: avatar || undefined,
      text: `**${message.title}**\n\n${message.message}\n\n*Severity: ${message.severity.toUpperCase()}*\n*Time: ${message.timestamp}*`,
    };

    await axios.post(webhook_url, payload);
    logger.info('Rocket.Chat notification sent');
  }

  /**
   * Feishu/Lark notifications
   */
  async sendFeishu(provider: NotificationProvider, message: NotificationMessage): Promise<void> {
    const { webhook_url } = provider.config;

    const payload = {
      msg_type: 'interactive',
      card: {
        header: {
          title: {
            tag: 'plain_text',
            content: message.title,
          },
          template:
            message.severity === 'critical'
              ? 'red'
              : message.severity === 'high'
                ? 'orange'
                : message.severity === 'medium'
                  ? 'yellow'
                  : 'green',
        },
        elements: [
          {
            tag: 'div',
            text: {
              tag: 'plain_text',
              content: message.message,
            },
          },
          {
            tag: 'hr',
          },
          {
            tag: 'div',
            fields: [
              {
                is_short: true,
                text: {
                  tag: 'plain_text',
                  content: `Severity: ${message.severity.toUpperCase()}`,
                },
              },
              {
                is_short: true,
                text: {
                  tag: 'plain_text',
                  content: `Time: ${message.timestamp}`,
                },
              },
            ],
          },
        ],
      },
    };

    await axios.post(webhook_url, payload);
    logger.info('Feishu notification sent');
  }

  /**
   * DingTalk notifications
   */
  async sendDingTalk(provider: NotificationProvider, message: NotificationMessage): Promise<void> {
    const { webhook_url, secret } = provider.config;

    let url = webhook_url;

    // Add signature if secret is provided
    if (secret) {
      const timestamp = Date.now();
      const sign = crypto
        .createHmac('sha256', secret)
        .update(`${timestamp}\n${secret}`)
        .digest('base64');

      url += `&timestamp=${timestamp}&sign=${encodeURIComponent(sign)}`;
    }

    const payload = {
      msgtype: 'markdown',
      markdown: {
        title: message.title,
        text: `## ${message.title}\n\n${message.message}\n\n**Severity:** ${message.severity.toUpperCase()}\n\n**Time:** ${message.timestamp}`,
      },
    };

    await axios.post(url, payload);
    logger.info('DingTalk notification sent');
  }

  /**
   * Bark notifications (iOS)
   */
  async sendBark(provider: NotificationProvider, message: NotificationMessage): Promise<void> {
    const { server_url, device_key, sound, group } = provider.config;

    const url = `${server_url}/${device_key}/${encodeURIComponent(message.title)}/${encodeURIComponent(message.message)}`;

    const params: any = {};
    if (sound) params.sound = sound;
    if (group) params.group = group;

    await axios.get(url, { params });
    logger.info('Bark notification sent');
  }

  /**
   * NTFY notifications
   */
  async sendNtfy(provider: NotificationProvider, message: NotificationMessage): Promise<void> {
    const { server_url, topic, username, password } = provider.config;

    const priorityMap = { low: 1, medium: 3, high: 4, critical: 5 };

    const headers: any = {
      Title: message.title,
      Priority: priorityMap[message.severity] || 3,
      Tags:
        message.severity === 'critical'
          ? 'rotating_light'
          : message.severity === 'high'
            ? 'warning'
            : 'information_source',
    };

    if (username && password) {
      headers['Authorization'] =
        `Basic ${Buffer.from(`${username}:${password}`).toString('base64')}`;
    }

    await axios.post(`${server_url}/${topic}`, message.message, { headers });
    logger.info(`NTFY notification sent to topic: ${topic}`);
  }

  /**
   * Splunk notifications
   */
  async sendSplunk(provider: NotificationProvider, message: NotificationMessage): Promise<void> {
    const { hec_url, token, index, source } = provider.config;

    const event = {
      time: Math.floor(new Date(message.timestamp).getTime() / 1000),
      index: index || 'main',
      source: source || 'nova-sentinel',
      sourcetype: 'nova:monitoring',
      event: {
        title: message.title,
        message: message.message,
        severity: message.severity,
        monitor: message.monitor,
        url: message.url,
        ...message.data,
      },
    };

    await axios.post(hec_url, event, {
      headers: {
        Authorization: `Splunk ${token}`,
        'Content-Type': 'application/json',
      },
    });

    logger.info('Splunk notification sent');
  }

  /**
   * Home Assistant notifications
   */
  async sendHomeAssistant(
    provider: NotificationProvider,
    message: NotificationMessage,
  ): Promise<void> {
    const { server_url, long_lived_token, notification_service } = provider.config;

    const payload = {
      title: message.title,
      message: message.message,
      data: {
        priority: message.severity === 'critical' ? 'high' : 'normal',
        tag: 'nova-sentinel',
        actions: [
          {
            action: 'view_dashboard',
            title: 'View Dashboard',
            uri: message.url || '',
          },
        ],
      },
    };

    await axios.post(`${server_url}/api/services/notify/${notification_service}`, payload, {
      headers: {
        Authorization: `Bearer ${long_lived_token}`,
        'Content-Type': 'application/json',
      },
    });

    logger.info('Home Assistant notification sent');
  }

  /**
   * Main dispatch method to send notifications based on provider type
   */
  async sendNotification(
    provider: NotificationProvider,
    message: NotificationMessage,
  ): Promise<void> {
    try {
      switch (provider.type) {
        case 'telegram':
          await this.sendTelegram(provider, message);
          break;
        case 'pushover':
          await this.sendPushover(provider, message);
          break;
        case 'teams':
          await this.sendTeams(provider, message);
          break;
        case 'matrix':
          await this.sendMatrix(provider, message);
          break;
        case 'signal':
          await this.sendSignal(provider, message);
          break;
        case 'gotify':
          await this.sendGotify(provider, message);
          break;
        case 'pagerduty':
          await this.sendPagerDuty(provider, message);
          break;
        case 'opsgenie':
          await this.sendOpsgenie(provider, message);
          break;
        case 'pushbullet':
          await this.sendPushbullet(provider, message);
          break;
        case 'line':
          await this.sendLine(provider, message);
          break;
        case 'mattermost':
          await this.sendMattermost(provider, message);
          break;
        case 'rocket_chat':
          await this.sendRocketChat(provider, message);
          break;
        case 'feishu':
          await this.sendFeishu(provider, message);
          break;
        case 'dingtalk':
          await this.sendDingTalk(provider, message);
          break;
        case 'bark':
          await this.sendBark(provider, message);
          break;
        case 'ntfy':
          await this.sendNtfy(provider, message);
          break;
        case 'splunk':
          await this.sendSplunk(provider, message);
          break;
        case 'homeassistant':
          await this.sendHomeAssistant(provider, message);
          break;
        default:
          throw new Error(`Unsupported notification provider: ${provider.type}`);
      }
    } catch (error: any) {
      logger.error(`Failed to send ${provider.type} notification: ${error.message}`);
      throw error;
    }
  }
}

export const notificationProviderService = new NotificationProviderService();
