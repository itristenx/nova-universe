/**
 * Microsoft 365 Connector
 * Provides room calendar synchronization and email send/receive via Microsoft Graph API
 *
 * @author Nova Team
 * @version 1.0.0
 */

import { IConnector, ConnectorType, HealthStatus } from '../nova-integration-layer.js';
import axios from 'axios';

/**
 * Microsoft 365 connector implementing OAuth 2.0 client credentials and Microsoft Graph API
 */
export class Microsoft365Connector extends IConnector {
  constructor() {
    super('microsoft365-connector', 'Microsoft 365', '1.0.0', ConnectorType.COLLABORATION);
    this.config = null;
    this.token = null;
    this.tokenExpiresAt = 0;
    this.client = axios.create({
      baseURL: 'https://graph.microsoft.com/v1.0',
      timeout: 30000,
    });
  }

  /**
   * Initialize connector with enterprise configuration
   * @param {object} config - { tenantId, clientId, clientSecret }
   */
  async initialize(config) {
    try {
      this.config = config;
      this.validateConfig(config);
      await this.refreshAccessToken();
      await this.health();
      console.log('Microsoft 365 connector initialized successfully');
    } catch (error) {
      console.error('Failed to initialize Microsoft 365 connector:', error);
      throw error;
    }
  }

  /**
   * Validate configuration
   */
  validateConfig(config) {
    if (!config?.tenantId || !config?.clientId || !config?.clientSecret) {
      throw new Error('Missing required Microsoft 365 configuration');
    }
  }

  /**
   * Refresh OAuth token using client credentials
   */
  async refreshAccessToken() {
    const tokenUrl = `https://login.microsoftonline.com/${this.config.tenantId}/oauth2/v2.0/token`;
    const params = new URLSearchParams();
    params.append('client_id', this.config.clientId);
    params.append('client_secret', this.config.clientSecret);
    params.append('scope', 'https://graph.microsoft.com/.default');
    params.append('grant_type', 'client_credentials');

    const response = await axios.post(tokenUrl, params.toString(), {
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    });

    this.token = response.data.access_token;
    this.tokenExpiresAt = Date.now() + (response.data.expires_in - 60) * 1000;
    this.client.defaults.headers.common.Authorization = `Bearer ${this.token}`;
  }

  /**
   * Ensure a valid access token exists
   */
  async ensureToken() {
    if (!this.token || Date.now() >= this.tokenExpiresAt) {
      await this.refreshAccessToken();
    }
  }

  /**
   * Health check against Microsoft Graph
   */
  async health() {
    try {
      await this.ensureToken();
      const response = await this.client.get('/organization?$top=1');
      const status = response.status === 200 ? HealthStatus.HEALTHY : HealthStatus.DEGRADED;
      return { status, lastCheck: new Date() };
    } catch (error) {
      return { status: HealthStatus.UNHEALTHY, lastCheck: new Date(), message: error.message };
    }
  }

  /**
   * List events for a room mailbox
   * @param {string} roomEmail - Room mailbox address
   * @param {Date} start - Start time
   * @param {Date} end - End time
   */
  async listRoomEvents(roomEmail, start, end) {
    await this.ensureToken();
    const params = {
      startDateTime: start.toISOString(),
      endDateTime: end.toISOString(),
    };
    const response = await this.client.get(`/users/${encodeURIComponent(roomEmail)}/calendarView`, { params });
    return response.data.value || [];
  }

  /**
   * Create an event in a room mailbox
   * @param {string} roomEmail
   * @param {object} event
   */
  async createRoomEvent(roomEmail, event) {
    await this.ensureToken();
    const response = await this.client.post(`/users/${encodeURIComponent(roomEmail)}/events`, event);
    return response.data;
  }

  /**
   * Retrieve messages for a mailbox. Supports delta queries.
   * @param {string} mailbox - mailbox email
   * @param {string} [deltaLink] - optional deltaLink for incremental sync
   */
  async listMessages(mailbox, deltaLink) {
    await this.ensureToken();
    const url = deltaLink || `/users/${encodeURIComponent(mailbox)}/messages`;
    const response = await this.client.get(url);
    return response.data;
  }

  /**
   * Send email from specified mailbox
   * @param {string} mailbox - mailbox email
   * @param {object} message - Graph message object
   */
  async sendMail(mailbox, message) {
    await this.ensureToken();
    await this.client.post(`/users/${encodeURIComponent(mailbox)}/sendMail`, {
      message,
      saveToSentItems: true,
    });
    return { success: true };
  }
}

export default Microsoft365Connector;

