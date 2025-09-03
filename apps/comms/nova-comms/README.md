# Nova Comms

A Slack bot that integrates with the Nova Universe ticketing system, allowing users to submit support tickets directly from Slack. Part of the open source [Nova Universe](../../../README.md) platform.

---

## About

Nova Comms provides seamless Slack integration for Nova Universe, enabling teams to:
- Submit support tickets via interactive modals
- Check system status and queue metrics
- Get AI-powered assignment recommendations
- Interact with Cosmo AI assistant

## Features

- `/it-help` and `/new-ticket` for ticket submission via modal
- `/nova-status` summarizes current status and monitor health
- `/nova-queue` shows Pulse queue summary
- `/nova-feedback` submits product feedback
- `/nova-assign TKT-xxxxx` suggests an assignee using Cosmo
- Mentions: `@Cosmo` starts an AI conversation in thread
- Interactive modal forms with dynamic system and urgency options
- Automatic ticket confirmation with clickable links
- JWT-based authentication with the Nova Platform API
- Error handling and fallback options

## Prerequisites

- Node.js 18+ 
- Nova Universe API running and accessible
- Slack workspace with bot permissions

## Installation

```bash
cd apps/comms/nova-comms
npm install
cp .env.example .env
# Edit .env with your configuration
npm start
```

## API Integration

The Slack bot communicates with the Nova Platform API using a service JWT:

- Fetches config from `/api/config`
- Creates tickets via `/api/v1/orbit/tickets`
- Shows queue metrics via `/api/v1/pulse/queues/metrics`
- Submits feedback via `/api/v1/orbit/feedback`
- Starts Cosmo conversations via `/api/v2/synth/conversation/start`

## Commands

### `/it-help` and `/new-ticket`
Opens an interactive modal for ticket submission with fields:
- Name (required)
- Email (required)
- Title (required)
- System (dropdown, loaded from API config)
- Urgency (dropdown, loaded from API config)
- Description (optional)

### `/nova-status`
Displays aggregated help desk status and monitor uptime.

### `/nova-queue`
Shows a snapshot of Pulse queues and open counts.

### `/nova-feedback`
Sends general feedback to the platform.

### `/nova-assign TKT-xxxxx`
Asks Cosmo to suggest an assignee for a ticket.

### `@Cosmo`
Mention the bot to start an AI conversation thread.

## Setup

### Slack App Configuration

1. Create a new Slack app at `https://api.slack.com/apps`
2. Enable the following features:
   - Slash Commands
   - Interactivity & Shortcuts
   - Bot Users
   - Events API (subscribe to `app_mention`)

3. Add slash commands:
   - `/it-help` → Request URL: `https://your-domain.com/slack/events`
   - `/new-ticket` → Request URL: `https://your-domain.com/slack/events`
   - `/nova-status` → Request URL: `https://your-domain.com/slack/events`
   - `/nova-queue` → Request URL: `https://your-domain.com/slack/events`
   - `/nova-feedback` → Request URL: `https://your-domain.com/slack/events`
   - `/nova-assign` → Request URL: `https://your-domain.com/slack/events`

4. Set up Interactivity:
   - Request URL: `https://your-domain.com/slack/events`

5. Events API Subscriptions:
   - Subscribe to bot events: `app_mention`

6. OAuth & Permissions Scopes:
   - `commands`
   - `chat:write`
   - `chat:write.public` (optional for public channels)
   - `users:read`
   - `app_mentions:read`
   - `reactions:write` (optional)

7. Install the app to your workspace and copy the Bot User OAuth Token

### Local Testing

Slack slash commands require a public HTTPS endpoint. While developing you can expose your local service using [ngrok](https://ngrok.com/):

```bash
npx ngrok http $SLACK_PORT
```

Use the HTTPS forwarding address printed by ngrok as the request URL for your commands.

## Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| SLACK_SIGNING_SECRET | Slack app signing secret | Yes |
| SLACK_BOT_TOKEN | Bot User OAuth token | Yes |
| API_URL | Nova Platform API base URL | Yes |
| JWT_SECRET | Secret for JWT generation | Yes |
| JWT_EXPIRES_IN | JWT expiration time | No (default: 1h) |
| VITE_ADMIN_URL | Admin portal URL for links | No |
| SLACK_PORT | Port for the service | No (default: 3001) |
| COMMS_SERVICE_USER_* | Optional service identity for Nova API JWTs | No |

## Deployment

### Docker

```bash
docker build -t nova-comms .
docker run -d --env-file .env -p 3001:3001 nova-comms
```

### Production

For production deployment, ensure:
- All environment variables are properly configured
- The service is accessible from Slack's servers
- SSL/TLS termination is handled (e.g., via reverse proxy)
- Proper logging and monitoring are in place

## Troubleshooting

### Common Issues

1. **Slack verification failed**: Check `SLACK_SIGNING_SECRET` matches your app
2. **API calls failing**: Verify `API_URL` and `JWT_SECRET` are correct
3. **Commands not responding**: Check Slack app URLs point to your service
4. **Permissions errors**: Verify bot scopes in Slack app settings

### Debug Mode

Set `NODE_ENV=development` for detailed logging:

```bash
NODE_ENV=development npm start
```

## Security

- All Slack requests are verified using signing secrets
- API calls use JWT tokens with limited scope
- No sensitive data is logged in production
- Service runs with minimal required permissions

## License

MIT License - see LICENSE file for details