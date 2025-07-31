// Microsoft 365 Email Service: Polling, Webhook, Ticket Creation
import axios from 'axios';
import db from '../db.js';
import { logger } from '../logger.js';
import { ConfidentialClientApplication } from '@azure/msal-node';

const GRAPH_BASE = 'https://graph.microsoft.com/v1.0';

class M365EmailService {
  constructor() {
    this.pollIntervalMs = parseInt(process.env.M365_POLL_INTERVAL_MS || '60000');
    this.running = false;
    this.token = null;
    this.tokenExpires = 0;
    this.scopes = (process.env.M365_GRAPH_SCOPES ||
      'https://graph.microsoft.com/.default').split(' ');
    this.client = new ConfidentialClientApplication({
      auth: {
        clientId: process.env.M365_CLIENT_ID || '',
        clientSecret: process.env.M365_CLIENT_SECRET || '',
        authority: `https://login.microsoftonline.com/${process.env.M365_TENANT_ID}`,
      },
    });
  }

  async getToken() {
    if (this.token && Date.now() < this.tokenExpires - 60000) {
      return this.token;
    }
    const result = await this.client.acquireTokenByClientCredential({
      scopes: this.scopes,
    });
    this.token = result.accessToken;
    this.tokenExpires = result.expiresOn.getTime();
    return this.token;
  }

  async sendEmail({ from, to, subject, html }) {
    const token = await this.getToken();
    await axios.post(
      `${GRAPH_BASE}/users/${from}/sendMail`,
      {
        message: {
          subject,
          body: { contentType: 'HTML', content: html },
          toRecipients: (Array.isArray(to) ? to : [to]).map((addr) => ({
            emailAddress: { address: addr },
          })),
        },
        saveToSentItems: true,
      },
      { headers: { Authorization: `Bearer ${token}` } }
    );
  }

  async startPolling() {
    this.running = true;
    while (this.running) {
      try {
        await this.pollAllAccounts();
      } catch (err) {
        logger.error('M365 Polling error', err);
      }
      await new Promise(res => setTimeout(res, this.pollIntervalMs));
    }
  }

  async pollAllAccounts() {
    const accounts = await db.any('SELECT * FROM email_accounts WHERE enabled = TRUE AND webhook_mode = FALSE');
    for (const account of accounts) {
      await this.pollAccount(account);
    }
  }

  async pollAccount(account) {
    const token = await this.getToken();
    const url = `${GRAPH_BASE}/users/${account.address}/mailFolders/inbox/messages?$filter=isRead eq false`;
    const { data } = await axios.get(url, {
      headers: { Authorization: `Bearer ${token}` },
    });
    for (const message of data.value || []) {
      await this.handleNewMessage(message, account);
    }
  }

  async handleNewMessage(message, account) {
    const apiBase = process.env.API_URL || 'http://localhost:3000';
    try {
      await axios.post(`${apiBase}/api/v1/synth/email-ticket`, {
        account: account.queue,
        message,
      });
    } catch (err) {
      logger.error('Synth ticket error', err.message);
    }

    const token = await this.getToken();
    await axios.patch(
      `${GRAPH_BASE}/users/${account.address}/messages/${message.id}`,
      { isRead: true },
      { headers: { Authorization: `Bearer ${token}` } }
    );
  }

  async subscribeWebhooks() {
    const token = await this.getToken();
    const accounts = await db.any('SELECT * FROM email_accounts WHERE enabled = TRUE AND webhook_mode = TRUE');
    const baseUrl = process.env.PUBLIC_URL || process.env.API_URL || 'http://localhost:3000';
    for (const account of accounts) {
      try {
        const subscriptionPayload = {
          changeType: 'created',
          resource: `users/${account.address}/mailFolders('inbox')/messages`,
          notificationUrl: `${baseUrl}/api/graph-email-webhook`,
          expirationDateTime: new Date(Date.now() + 86400000).toISOString(),
          clientState: process.env.M365_WEBHOOK_SECRET,
        };
        const headers = { headers: { Authorization: `Bearer ${token}` } };
        await axios.post(`${GRAPH_BASE}/subscriptions`, subscriptionPayload, headers);
      } catch (err) {
        logger.error('Failed to subscribe webhook', err.message);
      }
    }
  }

  async handleWebhookNotification(notification) {
    if (notification.clientState !== process.env.M365_WEBHOOK_SECRET) return;
    const token = await this.getToken();
    const { data } = await axios.get(
      `${GRAPH_BASE}/${notification.resource}`,
      { headers: { Authorization: `Bearer ${token}` } }
    );
    const recipient = data.toRecipients?.[0]?.emailAddress?.address;
    if (!recipient) {
      logger.warn('Webhook notification missing recipient information');
      return;
    }
    const account = await db.oneOrNone('SELECT * FROM email_accounts WHERE address=$1', [recipient]);
    if (account) {
      await this.handleNewMessage(data, account);
    }
  }
}

export default new M365EmailService();
