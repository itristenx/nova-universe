# Nova Comms

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](../LICENSE)
[![Open Issues](https://img.shields.io/github/issues/itristenx/nova-universe)](https://github.com/itristenx/nova-universe/issues)

---

## About

A Slack bot that integrates with the Nova Universe ticketing system, allowing users to submit support tickets directly from Slack. Part of the open source [Nova Universe](../README.md) platform.

---

## Features

- `/it-help` and `/new-ticket` for ticket submission via modal
- `/nova-status` summarizes current status and monitor health
- `/nova-queue` shows Pulse queue summary
- `/nova-feedback` submits product feedback
- `/nova-assign <TICKET_ID>` suggests an assignee using Cosmo (e.g., `INC000123`)
- Mentions: `@Cosmo` starts an AI conversation in thread
- Interactive modal forms with dynamic system and urgency options
- Automatic ticket confirmation with clickable links
- JWT-based authentication with the Nova Platform API
- Error handling and fallback options

## Setup

### Prerequisites

- Node.js 18+
- Nova Platform API server running
- Slack workspace with bot permissions

### Installation

1. Install dependencies:

   ```bash
   npm install
   ```

2. Create a `.env` file with required variables:

   ```env
   SLACK_SIGNING_SECRET=your_signing_secret
   SLACK_BOT_TOKEN=xoxb-your-bot-token
   API_URL=http://localhost:3000
   JWT_SECRET=your_jwt_secret
   JWT_EXPIRES_IN=1h
   VITE_ADMIN_URL=http://localhost:5173
   SLACK_PORT=3001
   # Optional service identity (recommended)
   COMMS_SERVICE_USER_ID=comms-service
   COMMS_SERVICE_USER_EMAIL=comms@nova.local
   COMMS_SERVICE_USER_NAME=Nova Comms Bot
   COMMS_SERVICE_USER_ROLE=technician
   COMMS_TENANT_ID=default
   ```

3. Start the service:
   ```bash
   npm start
   ```

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

### `/nova-assign <TICKET_ID>`

Asks Cosmo to suggest an assignee for a ticket (e.g., `INC000123`, `REQ000045`).

## Local Testing

Slack slash commands require a public HTTPS endpoint. While developing you can expose your local service using [ngrok](https://ngrok.com/):

```bash
npx ngrok http $SLACK_PORT
```

Use the HTTPS forwarding address printed by ngrok as the request URL for your commands.

## Environment Variables

| Variable              | Description                                 | Required           |
| --------------------- | ------------------------------------------- | ------------------ |
| SLACK_SIGNING_SECRET  | Slack app signing secret                    | Yes                |
| SLACK_BOT_TOKEN       | Bot User OAuth token                        | Yes                |
| API_URL               | Nova Platform API base URL                  | Yes                |
| JWT_SECRET            | Secret for JWT generation                   | Yes                |
| JWT_EXPIRES_IN        | JWT expiration time                         | No (default: 1h)   |
| VITE_ADMIN_URL        | Admin portal URL for links                  | No                 |
| SLACK_PORT            | Port for the service                        | No (default: 3001) |
| COMMS*SERVICE_USER*\* | Optional service identity for Nova API JWTs | No                 |

## Deployment

### Production Deployment

1. Set up a secure HTTPS endpoint
2. Configure environment variables
3. Update Slack app URLs to production endpoints
4. Ensure Nova Platform API is accessible from the deployment environment

### Docker Support

Create a `Dockerfile`:

```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
EXPOSE 3001
CMD ["npm", "start"]
```

## Security

- All requests verified using Slack signing secrets
- JWT tokens used for API authentication
- Service JWTs include tenant and role claims used by Nova API auth
- Environment variables for sensitive configuration
- Input validation on all user data

## Monitoring

The service logs:

- Incoming slash commands
- API requests and responses
- Error conditions
- Performance metrics

Consider integrating with monitoring services for production deployments.

## Community & Contributing

- [Contributing Guidelines](../.github/CONTRIBUTING.md)
- [Code of Conduct](../.github/CODE_OF_CONDUCT.md)
- [Security Policy](../.github/SECURITY.md)
- [Open an Issue](https://github.com/itristenx/nova-universe/issues)
- [Submit a Pull Request](https://github.com/itristenx/nova-universe/pulls)

---

## License

This project is licensed under the [MIT License](../LICENSE).

---

## Credits & Acknowledgments

- [othneildrew/Best-README-Template](https://github.com/othneildrew/Best-README-Template) for README inspiration
- All contributors and open source dependencies
