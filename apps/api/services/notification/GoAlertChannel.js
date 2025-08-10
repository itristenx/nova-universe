export class GoAlertChannel {
  constructor({ axios, baseUrl, apiKey }) {
    this.axios = axios;
    this.baseUrl = baseUrl;
    this.apiKey = apiKey;
  }

  async send({ title, message, priority, metadata }) {
    // Placeholder. In real integration, map to GoAlert /api/v2/alerts
    return { queued: true };
  }
}