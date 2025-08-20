# Nova Universe Integrations

This package contains the Nova Integration Layer (NIL) and related connectors for enterprise system integration.

## Overview

The Nova Integration Layer is an enterprise-grade integration framework that provides:

- **Universal Connectors**: Pre-built connectors for popular enterprise systems
- **Notification Platform**: Multi-channel notification delivery system  
- **Standard Integration Patterns**: Following Enterprise Integration Patterns (EIP)
- **Circuit Breaker**: Resilience patterns for external system calls
- **Rate Limiting**: Built-in protection against API abuse

## Structure

```
packages/integrations/
├── integration/
│   ├── nova-integration-layer.js     # Main integration engine
│   └── connectors/                   # System-specific connectors
│       ├── crowdstrike-connector.js
│       ├── intune-connector.js
│       ├── jamf-connector.js
│       ├── nova-synth-connector.js
│       ├── okta-connector.js
│       ├── slack-connector.js
│       └── zoom-connector.js
└── notification/
    └── nova-notification-platform.js # Multi-channel notifications
```

## Available Connectors

### Identity & Access Management
- **Okta Connector**: User provisioning, authentication, and group management
- **Intune Connector**: Device management and compliance policies
- **Jamf Connector**: Apple device management and security

### Security & Compliance  
- **CrowdStrike Connector**: Endpoint protection and threat intelligence

### Communication & Collaboration
- **Slack Connector**: Team communication and workflow integration
- **Zoom Connector**: Meeting management and user provisioning

### AI & Automation
- **Nova Synth Connector**: AI-powered automation and workflow intelligence

## Usage

### Basic Integration Layer Usage

```javascript
import { NovaIntegrationLayer } from '@nova-universe/integrations';

const integration = new NovaIntegrationLayer({
  enableMetrics: true,
  enableAudit: true,
  rateLimit: {
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 1000 // requests per window
  }
});

await integration.initialize();
```

### Using Connectors

```javascript
import { SlackConnector } from '@nova-universe/integrations/connectors/slack-connector';

const slackConnector = new SlackConnector();
await slackConnector.initialize({
  botToken: process.env.SLACK_BOT_TOKEN,
  userToken: process.env.SLACK_USER_TOKEN
});

// Send a message
await slackConnector.sendMessage({
  channel: '#general',
  text: 'Hello from Nova Universe!'
});
```

### Notification Platform

```javascript
import { novaNotificationPlatform } from '@nova-universe/integrations/notification';

await novaNotificationPlatform.sendNotification({
  id: 'notification-123',
  title: 'System Alert',
  message: 'Service is now operational',
  channels: [
    { type: 'email', recipients: ['admin@company.com'] },
    { type: 'slack', channel: '#alerts' },
    { type: 'in_app', users: ['user123'] }
  ]
});
```

## Configuration

### Environment Variables

```env
# Database connections
CORE_DATABASE_URL=postgresql://...
INTEGRATION_DATABASE_URL=postgresql://...

# Connector configurations
OKTA_DOMAIN=your-org.okta.com
OKTA_TOKEN=your-api-token

SLACK_BOT_TOKEN=xoxb-your-bot-token
SLACK_USER_TOKEN=xoxp-your-user-token

CROWDSTRIKE_CLIENT_ID=your-client-id
CROWDSTRIKE_CLIENT_SECRET=your-client-secret

# Optional: Disable Prisma if databases not available
PRISMA_DISABLED=true
```

## Development

### Testing

```bash
# Test syntax
node -c packages/integrations/integration/nova-integration-layer.js

# Test connectors
node -c packages/integrations/integration/connectors/*.js

# Run integration tests
npm run test:integration
```

### Adding New Connectors

1. Create a new connector file in `integration/connectors/`
2. Extend the `IConnector` base class
3. Implement required methods: `initialize()`, `getHealth()`, `sync()`
4. Add connector to the integration layer registry
5. Update tests and documentation

## License

MIT License - see LICENSE file for details.
