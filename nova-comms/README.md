# Nova Comms

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](../LICENSE)
[![Open Issues](https://img.shields.io/github/issues/itristenx/nova-universe)](https://github.com/itristenx/nova-universe/issues)

---

## About

Slack-based communication and conversational interface for Nova Universe. Supports ticket intake, status, queue summaries, feedback, assignment, and AI-powered suggestions.

---

## Features

- `/it-help` and `/new-ticket`: Modal ticket intake with dynamic options
- `/nova-status`: System status (agent/admin)
- `/nova-queue`: Pulse queue summary (agent/admin)
- `/nova-feedback`: Feedback modal
- `/nova-assign`: Assign current thread to an agent (agent/admin)
- `/nova-summarize`: AI summary (agent/admin, optional)
- App mention AI suggestions via Cosmo (optional)
- Keyword triggers for triage and routing
- RBAC checks via Nova Helix (Slack user → Nova user → roles)
- Supports Slack OAuth installation or classic bot token

## Setup

### Prerequisites

- Node.js 18+
- Nova API reachable
- Slack workspace with app installed

### Installation

```bash
npm install
```

Create `.env` (see `.env.example`):

- Choose either classic bot token or OAuth installation (recommended)
- Set `API_URL`, `JWT_SECRET`, and optional `COMMS_AI_ENABLED`

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
- OAuth (optional but preferred):
  - Provide `SLACK_CLIENT_ID`, `SLACK_CLIENT_SECRET`, `SLACK_STATE_SECRET`, `SLACK_SCOPES`

## Auth & RBAC

- Slack user is resolved to a Nova user via API: `POST /auth/slack/resolve` (fallback `/api/auth/slack/resolve`)
- Commands that require elevated permissions enforce roles: `agent` or `admin`
  - Protected: `/nova-status`, `/nova-queue`, `/nova-assign`, `/nova-summarize`, `approve_request` action
  - Open: `/new-ticket`, `/it-help`, `/nova-feedback`
- If a user is not linked or lacks roles, ephemeral error is posted with guidance

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
- POST `/workflows/approve` → approve requests (action handler)
- POST `/feedback` → submit feedback
- POST `/auth/slack/resolve` → Slack→Nova user mapping

## Local Testing

- Use ngrok to expose `SLACK_PORT`
- Run tests: `npm test`

## Security

- Slack signing verification
- JWT to Nova API
- RBAC checks on privileged actions
- Least-privilege scopes

## Monitoring

- Logs include command usage, API calls, and failures
