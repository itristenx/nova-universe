import axios from 'axios';
import db from '../db.js';
import { logger } from '../logger.js';

const GRAPH_BASE = 'https://graph.microsoft.com/v1.0';
export const envTokenProvider = async () => {
  const token = process.env.M365_TOKEN;
  if (!token) {
    throw new Error('M365_TOKEN is not configured');
  }
  return token;
};

function buildAuthHeader(token) {
  return { Authorization: `Bearer ${token}` };
}

export default class M365EmailService {
  constructor({ tokenProvider, pollInterval = 300000, pageSize = 50 }) {
    this.tokenProvider = tokenProvider;
    this.pollInterval = pollInterval;
    this.pageSize = pageSize;
    this.pageOffset = 0;
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
        'SELECT id, address, queue FROM email_accounts WHERE enabled = true ORDER BY id LIMIT $1 OFFSET $2',
        [this.pageSize, this.pageOffset]
      );
      if (accounts.rowCount === 0) {
        this.pageOffset = 0;
        return;
      }
      this.pageOffset += accounts.rowCount;
      if (accounts.rowCount < this.pageSize) {
        this.pageOffset = 0;
      }
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

      const base = process.env.API_BASE_URL;
      if (!base) {
        throw new Error('API_BASE_URL is not configured');
      }
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
