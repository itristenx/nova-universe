export class SentinelChannel {
  constructor({ baseUrl, token }) {
    this.baseUrl = baseUrl;
    this.token = token;
  }

  async send({ title, message, severity, metadata }) {
    // Placeholder
    return { accepted: true };
  }
}