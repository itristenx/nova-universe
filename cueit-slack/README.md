# CueIT Slack Service

Slack slash command integration that lets users submit tickets directly from Slack.

## Setup
1. Create a Slack app (see [Slack's app setup docs](https://api.slack.com/apps)) and add a `/new-ticket` slash command. The [slash command guide](https://api.slack.com/interactivity/slash-commands) explains how to configure the command and obtain your tokens.
2. Run `npm install` in this directory.
3. Copy `.env.example` to `.env` and set:
   - `SLACK_SIGNING_SECRET`
   - `SLACK_BOT_TOKEN`
   - `API_URL`
   - optional `SLACK_PORT` (defaults to `3001`)
   - optional `VITE_ADMIN_URL` for a link in confirmation messages
4. Start the service with `node index.js`.

The modal fetches available systems and urgency levels from your backend via
`/api/config`. Ensure `JWT_SECRET` matches the backend so this request is
authorized.

## Local Testing
Slack slash commands require a public HTTPS endpoint. While developing you can expose your local service using [ngrok](https://ngrok.com/):

```bash
npx ngrok http $SLACK_PORT
```

Use the HTTPS forwarding address printed by ngrok as the request URL for your `/new-ticket` command.
