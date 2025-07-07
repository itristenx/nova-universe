# CueIT Slack Integration

A Slack bot that integrates with the CueIT ticketing system, allowing users to submit support tickets directly from Slack.

## Features

- `/new-ticket` slash command for ticket submission
- Interactive modal forms with dynamic system and urgency options
- Automatic ticket confirmation with clickable links
- JWT-based authentication with the CueIT API
- Error handling and fallback options

## Setup

### Prerequisites

- Node.js 18+
- CueIT API server running
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
   ```

3. Start the service:
   ```bash
   npm start
   ```

### Slack App Configuration

1. Create a new Slack app at https://api.slack.com/apps
2. Enable the following features:
   - Slash Commands
   - Interactive Components
   - Bot Users

3. Add the `/new-ticket` slash command:
   - Command: `/new-ticket`
   - Request URL: `https://your-domain.com/slack/events`
   - Short Description: "Submit a new support ticket"

4. Set up Interactive Components:
   - Request URL: `https://your-domain.com/slack/events`

5. Configure OAuth & Permissions with these scopes:
   - `commands` - Add slash commands
   - `chat:write` - Send messages
   - `users:read` - View user information

## API Integration

The Slack bot communicates with the CueIT API using JWT tokens:

- Fetches system and urgency configuration from `/api/config`
- Submits tickets via `/submit-ticket`
- Handles authentication and error responses

## Commands

### `/new-ticket`

Opens an interactive modal for ticket submission with fields:
- Name (required)
- Email (required)  
- Title (required)
- System (dropdown, loaded from API config)
- Urgency (dropdown, loaded from API config)
- Description (optional)

## Local Testing
Slack slash commands require a public HTTPS endpoint. While developing you can expose your local service using [ngrok](https://ngrok.com/):

```bash
npx ngrok http $SLACK_PORT
```

Use the HTTPS forwarding address printed by ngrok as the request URL for your `/new-ticket` command.

## Development

### Running Tests

```bash
npm test
```

### Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| SLACK_SIGNING_SECRET | Slack app signing secret | Yes |
| SLACK_BOT_TOKEN | Bot User OAuth token | Yes |
| API_URL | CueIT API base URL | Yes |
| JWT_SECRET | Secret for JWT generation | Yes |
| JWT_EXPIRES_IN | JWT expiration time | No (default: 1h) |
| VITE_ADMIN_URL | Admin panel URL for links | No |
| SLACK_PORT | Port for the service | No (default: 3001) |

### Error Handling

The bot includes comprehensive error handling:
- Network timeouts and connection errors
- Invalid API responses
- Missing configuration data
- Slack API errors

When errors occur, users receive helpful messages and the bot attempts to provide fallback functionality.

## Deployment

### Production Deployment

1. Set up a secure HTTPS endpoint
2. Configure environment variables
3. Update Slack app URLs to production endpoints
4. Ensure CueIT API is accessible from the deployment environment

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
- Environment variables for sensitive configuration
- Input validation on all user data

## Monitoring

The service logs:
- Incoming slash commands
- API requests and responses
- Error conditions
- Performance metrics

Consider integrating with monitoring services for production deployments.

## Contributing

1. Fork the repository
2. Create a feature branch
3. Add tests for new functionality
4. Ensure all tests pass
5. Submit a pull request

## License

MIT
