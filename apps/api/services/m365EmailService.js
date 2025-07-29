import axios from 'axios';
import db from '../db.js';
import { logger } from '../logger.js';

const GRAPH_BASE = 'https://graph.microsoft.com/v1.0';
export const envTokenProvider = async () => process.env.M365_TOKEN;

function buildAuthHeader(token) {
  return { Authorization: `Bearer ${token}` };
}

export default class M365EmailService {
  constructor({ tokenProvider, pollInterval = 300000 }) {
    this.tokenProvider = tokenProvider;
    this.pollInterval = pollInterval;
    this.timer = null;
  }

  async start() {
    await this.poll();
    this.timer = setInterval(() => this.poll(), this.pollInterval);
  }

  stop() {
    if (this.timer) clearInterval(this.timer);
  }

  async poll() {
    try {
      const accounts = await db.query(
        'SELECT id, address, queue FROM email_accounts WHERE enabled = true'
      );
      for (const acct of accounts.rows) {
        await this.checkAccount(acct);
      }
    } catch (err) {
      logger.error('M365 poll error', err);
    }
  }

  async checkAccount(acct) {
    const token = await this.tokenProvider();
    const url = `${GRAPH_BASE}/users/${acct.address}/mailFolders/inbox/messages?$filter=isRead eq false`;
    try {
      const res = await axios.get(url, { headers: buildAuthHeader(token) });
      const messages = res.data.value || [];
      for (const msg of messages) {
        await this.handleMessage(acct, msg, token);
      }
    } catch (err) {
      logger.error('Error fetching messages', err?.response?.data || err.message);
    }
  }

  async handleMessage(acct, msg, token) {
    try {
      await axios.patch(`${GRAPH_BASE}/users/${acct.address}/messages/${msg.id}`,
        { isRead: true },
        { headers: buildAuthHeader(token) }
      );

      const base = process.env.API_BASE_URL || 'http://localhost:3000';
      await axios.post(`${base}/api/v1/synth/email-ingest`, {
        accountId: acct.id,
        queue: acct.queue,
        subject: msg.subject,
        body: msg.body?.content,
        from: msg.from?.emailAddress?.address
      });
    } catch (err) {
      logger.error('Error processing message', err?.response?.data || err.message);
    }
  }
}
