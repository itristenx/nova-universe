# Nova Comms - Quick Reference

## Overview
Nova Comms is a standalone Slack integration service that enables users to create support tickets directly from Slack without any mock data. All tickets are created through real API calls to the Nova Universe platform.

## Key Features
- ✅ **Real ticket creation** - No mock data, all API calls are genuine
- 🎯 **Interactive modals** - Rich Slack UI for ticket submission
- 🔐 **JWT authentication** - Secure API integration
- 🚀 **Production ready** - Docker support, health checks, error handling
- 📊 **Multiple commands** - Status, queues, feedback, AI assistance

## Slack Commands

| Command | Purpose | Example |
|---------|---------|---------|
| `/it-help` | Create support ticket | `/it-help` |
| `/new-ticket` | Create support ticket (alias) | `/new-ticket` |
| `/nova-status` | System status overview | `/nova-status` |
| `/nova-queue` | Queue metrics summary | `/nova-queue` |
| `/nova-feedback` | Submit feedback | `/nova-feedback Great system!` |
| `/nova-assign` | Get assignment suggestion | `/nova-assign INC000123` |
| `@Nova` | AI conversation | `@Nova help with printer issue` |

## Quick Start

1. **Configure environment:**
```bash
cp .env.example .env
# Edit .env with your Slack and API credentials
```

2. **Install and start:**
```bash
npm install
npm start
```

3. **Validate configuration:**
```bash
npm run validate
```

4. **Test integration:**
```bash
npm run demo
```

## Environment Variables

**Required:**
- `SLACK_SIGNING_SECRET` - From Slack app settings
- `SLACK_BOT_TOKEN` - Bot user OAuth token (xoxb-...)
- `API_URL` - Nova Universe API endpoint
- `JWT_SECRET` - Must match Nova API secret

**Optional:**
- `SLACK_PORT` - Service port (default: 3001)
- `VITE_ADMIN_URL` - Admin portal URL for ticket links
- `COMMS_SERVICE_USER_*` - Service identity settings

## API Integration

The service integrates with these Nova API endpoints:

- `POST /api/v1/orbit/tickets` - Create tickets
- `GET /api/config` - Fetch system configuration
- `GET /api/v1/pulse/queues/metrics` - Queue metrics
- `POST /api/v1/orbit/feedback` - Submit feedback
- `POST /api/v2/synth/conversation/start` - AI conversations
- `GET /api/status-config` - System status

## Deployment

**Docker (Recommended):**
```bash
docker build -t nova-comms .
docker run -d --env-file .env -p 3001:3001 nova-comms
```

**Docker Compose:**
```yaml
version: '3.8'
services:
  nova-comms:
    build: .
    ports:
      - "3001:3001"
    env_file: .env
    restart: unless-stopped
```

## Monitoring

- Health check: `GET /health`
- Logs: Service logs show all Slack interactions
- Metrics: Track ticket creation rates and API response times

## Security

- All Slack requests verified with signing secret
- JWT tokens used for API authentication
- No sensitive data logged in production
- Service runs with minimal permissions

## Troubleshooting

**Common Issues:**
1. **Commands not working** → Check Slack app webhook URLs
2. **Auth errors** → Verify JWT_SECRET matches API
3. **API timeouts** → Check API_URL accessibility
4. **SSL errors** → Ensure HTTPS for production

**Debug Mode:**
```bash
NODE_ENV=development npm start
```

See `SETUP.md` for detailed configuration instructions.

## Files Structure

```
apps/comms/nova-comms/
├── index.js              # Main service (Slack app)
├── environment.js        # Environment validation
├── package.json          # Dependencies and scripts
├── README.md             # Full documentation
├── SETUP.md              # Deployment guide
├── .env.example          # Environment template
├── Dockerfile            # Container build
├── validate.js           # Config validation
├── demo.js               # Demo workflow
├── test-integration.js   # Integration tests
└── health.js             # Health check server
```

## Development

```bash
# Install dependencies
npm install

# Validate configuration
npm run validate

# Run demo (shows workflow)
npm run demo

# Run integration tests
npm run test:integration

# Start in development mode
npm run dev
```

This service provides a complete, production-ready Slack integration for Nova Universe with no mock data - all operations use real API calls and create actual tickets in the system.