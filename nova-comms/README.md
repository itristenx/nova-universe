# Nova Comms

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](../LICENSE)
[![Open Issues](https://img.shields.io/github/issues/itristenx/nova-universe)](https://github.com/itristenx/nova-universe/issues)

---

## About

Slack-based communication and conversational interface for Nova Universe. Supports ticket intake, status, queue summaries, feedback, assignment, and AI-powered suggestions.

---

## Features

- `/it-help` and `/new-ticket`: Modal ticket intake with dynamic options
- `/nova-status`: System status
- `/nova-queue`: Pulse queue summary
- `/nova-feedback`: Feedback modal
- `/nova-assign`: Assign current thread to an agent
- `/nova-summarize`: AI summary of channel/thread (optional)
- App mention AI suggestions via Cosmo
- Keyword triggers for triage and routing (e.g., "urgent", "escalate", "sev1")

## Setup

### Prerequisites

- Node.js 18+
- Nova API reachable
- Slack workspace with app installed

### Installation

```bash
npm install
```

Create `.env`:

```env
SLACK_SIGNING_SECRET=your_signing_secret
SLACK_BOT_TOKEN=xoxb-your-bot-token
API_URL=http://localhost:3000
JWT_SECRET=your_jwt_secret
JWT_EXPIRES_IN=1h
VITE_ADMIN_URL=http://localhost:5173
SLACK_PORT=3001
COMMS_AI_ENABLED=true
```

Start:

```bash
npm start
```

### Slack App Configuration

- Slash Commands:
  - `/it-help`, `/new-ticket`, `/nova-status`, `/nova-queue`, `/nova-feedback`, `/nova-assign`, `/nova-summarize`
- Interactivity & Events:
  - Request URL: `https://your-domain.com/slack/events`
  - Subscribe to `app_mention`
- Scopes:
  - `commands`, `chat:write`, `chat:write.public`, `reactions:write`, `users:read`, `channels:read`, `app_mentions:read`

## API Integration

- GET `/api/config` → systems and urgency levels
- POST `/submit-ticket` → create ticket
- GET `/status` or `/api/status` → system status fallback
- GET `/pulse/queues/summary` or `/api/queues/summary` → queue summary
- GET `/pulse/agents` → list agents for assignment
- POST `/pulse/assign` → assign thread
- POST `/ai/cosmo/suggest` → AI suggestions
- POST `/ai/cosmo/summarize` → AI summary (optional)
- POST `/comms/triage` → keyword triage hook
- POST `/feedback` → submit feedback

## Commands

Refer to features list for supported commands and modals.

## Local Testing

Use ngrok to expose the port specified by `SLACK_PORT`.

## Security

- Slack signing secret verification
- JWT to Nova API
- Least-privilege scopes

## Monitoring

- Logs include command usage and API calls. Integrate with your logging stack.
