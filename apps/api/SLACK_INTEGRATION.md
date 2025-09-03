# Nova Comms Slack Integration

Enhanced Slack integration for Nova Universe that provides comprehensive ticket management and AI conversation capabilities directly within Slack.

## Features

### Ticket Management Commands
- `/it-help` - User-friendly ticket creation via interactive modal
- `/new-ticket` - Traditional ticket creation command
- **NEW**: Message shortcuts to convert any Slack message into a ticket
- **NEW**: Global shortcuts for quick ticket creation

### System Monitoring
- `/nova-status` - System status and monitor health summary
- `/nova-queue` - Pulse queue metrics and open ticket counts
- `/nova-feedback` - Submit platform feedback to Nova team
- `/nova-assign` - Get AI-powered assignment recommendations

### AI Conversation
- **ENHANCED**: `@Cosmo` mentions for full AI conversations
- **NEW**: Threaded conversation support with state management
- Automatic conversation cleanup after 1 hour of inactivity

## Message-to-Ticket Feature

The enhanced integration includes powerful message shortcuts that allow users and agents to convert any Slack message into a support ticket:

### How it Works
1. Right-click on any Slack message
2. Select "More actions" → "Create Ticket"
3. Modal opens with message content pre-filled in description
4. User completes ticket details (title, priority, category, contact info)
5. Ticket is created with full context including:
   - Original message content
   - Message author information
   - Channel and timestamp
   - Link back to original message

### Benefits
- **Fast ticket creation**: No need to copy/paste message content
- **Full context preservation**: All message metadata is captured
- **User-friendly**: Works with any message in any channel
- **Agent workflow**: Perfect for agents monitoring channels

## Enhanced Cosmo Integration

The Cosmo AI assistant now supports full conversation threading:

### Features
- **Persistent conversations**: State maintained across message threads
- **Context awareness**: Knows previous conversation history
- **Automatic cleanup**: Conversations expire after 1 hour
- **Thread-safe**: Multiple conversations can run simultaneously

### Usage
```
@Cosmo help me troubleshoot a network issue
```
Cosmo will respond in a thread and remember the conversation context for follow-up questions.

## API Endpoints

### Health & Status
- `GET /api/v1/comms/health` - Service health check
- `GET /api/v1/comms/slack/status` - Slack integration status
- `POST /api/v1/comms/slack/initialize` - Initialize Slack integration
- `POST /api/v1/comms/slack/test` - Test Slack connectivity

### Commands & Features
- `GET /api/v1/comms/slack/commands` - List all commands and shortcuts
- `POST /api/v1/comms/slack/message-to-ticket` - Test message conversion

## Configuration

Required environment variables:
```bash
# Slack Integration
SLACK_BOT_TOKEN=xoxb-your-bot-token
SLACK_SIGNING_SECRET=your-signing-secret

# Service Authentication
JWT_SECRET=your-jwt-secret
JWT_EXPIRES_IN=1h

# Nova Universe Integration
API_URL=http://localhost:3000
VITE_ADMIN_URL=https://your-admin-portal.com

# Service Identity (optional)
COMMS_SERVICE_USER_ID=comms-service
COMMS_SERVICE_USER_EMAIL=comms@nova.local
COMMS_SERVICE_USER_NAME=Nova Comms Bot
COMMS_SERVICE_USER_ROLE=technician
COMMS_TENANT_ID=default
```

## Slack App Configuration

### Required Scopes
```
Bot Token Scopes:
- app_mentions:read
- chat:write
- commands
- conversations.history:read
- users:read
```

### Slash Commands
Configure these commands in your Slack app:
- `/it-help` → `https://your-api.com/slack/events`
- `/new-ticket` → `https://your-api.com/slack/events`
- `/nova-status` → `https://your-api.com/slack/events`
- `/nova-queue` → `https://your-api.com/slack/events`
- `/nova-feedback` → `https://your-api.com/slack/events`
- `/nova-assign` → `https://your-api.com/slack/events`

### Interactive Components
Configure these shortcuts:
- **Message Shortcut**: `create_ticket_from_message`
- **Global Shortcut**: `quick_ticket`

### Event Subscriptions
Enable these events:
- `app_mention` (for Cosmo conversations)

## Integration Architecture

The Slack integration is fully merged into the main Nova Universe API:

```
apps/api/
├── services/nova-comms.js    # Core Slack service logic
├── routes/comms.js           # REST API endpoints
└── index.js                  # Service initialization
```

### Service Lifecycle
1. API starts up and checks for Slack credentials
2. If found, initializes Slack app with all handlers
3. Registers slash commands, shortcuts, and event handlers
4. Service runs alongside main API on same port
5. All ticket creation uses real Nova Universe API endpoints

## Error Handling

The integration includes comprehensive error handling:
- Graceful fallbacks when API is unavailable
- User-friendly error messages in Slack
- Automatic retry logic for transient failures
- Detailed logging for troubleshooting

## Security

- JWT-based service-to-service authentication
- Slack signature verification for all webhooks
- No storage of sensitive user data
- Conversation state cleanup for privacy