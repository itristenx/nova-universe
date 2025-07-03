# CueIT Slack Service

Slack slash command integration that lets users submit tickets directly from Slack.

## Setup
1. Create a Slack app (see [Slack's app setup docs](https://api.slack.com/apps)) and add a `/new-ticket` slash command. The [slash command guide](https://api.slack.com/interactivity/slash-commands) explains how to configure the command and obtain your tokens.
2. Run `npm install` in this directory.
3. Create a `.env` file with the following variables:
   - `SLACK_SIGNING_SECRET`
   - `SLACK_BOT_TOKEN`
   - `BACKEND_URL`
   - optional `SLACK_PORT` (defaults to `3001`)
4. Start the service with `node index.js`.

## Local Testing
Slack slash commands require a public HTTPS endpoint. While developing you can expose your local service using [ngrok](https://ngrok.com/):

```bash
npx ngrok http $SLACK_PORT
```

Use the HTTPS forwarding address printed by ngrok as the request URL for your `/new-ticket` command.
