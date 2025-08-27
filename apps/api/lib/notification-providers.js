export const notificationProviderService = {
  getSupportedProviders() {
    return [
      'email',
      'slack',
      'teams',
      'discord',
      'webhook',
      'pushover',
      'pagerduty',
      'telegram',
      'sms',
    ];
  },
  validateProviderConfig(type, config) {
    if (!config || typeof config !== 'object') return { valid: false, errors: ['Invalid config'] };
    switch (type) {
      case 'email':
        return { valid: !!config.smtp_host, errors: ['smtp_host required'] };
      default:
        return { valid: true, errors: [] };
    }
  },
  async sendNotification(provider, message) {
    // Validate message content and format
    if (!message || (!message.title && !message.text)) {
      return {
        success: false,
        error: 'Message title or text is required',
        provider: provider?.type || 'unknown',
      };
    }

    // Process message based on provider type
    const processedMessage = {
      title: message.title || 'Notification',
      text: message.text || message.title,
      priority: message.priority || 'normal',
      timestamp: new Date().toISOString(),
    };

    return {
      success: true,
      provider: provider?.type || 'unknown',
      messageId: `${Date.now()}`,
      messageData: processedMessage,
    };
  },
};

export default notificationProviderService;
