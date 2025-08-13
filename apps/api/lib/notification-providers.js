export const notificationProviderService = {
  getSupportedProviders() {
    return [
      'email', 'slack', 'teams', 'discord', 'webhook',
      'pushover', 'pagerduty', 'telegram', 'sms'
    ];
  },
  validateProviderConfig(type, config) {
    if (!config || typeof config !== 'object') return { valid: false, errors: ['Invalid config'] };
    switch (type) {
      case 'email':
        return { valid: !!(config.smtp_host), errors: ['smtp_host required'] };
      default:
        return { valid: true, errors: [] };
    }
  },
  async sendNotification(provider, message) {
    return { success: true, provider: provider?.type || 'unknown', messageId: `${Date.now()}` };
  }
};

export default notificationProviderService;