# Nova Universe API Events

This folder exposes a small event bus used by the backend to broadcast changes. When `SLACK_WEBHOOK_URL` is set in `.env`, the backend listens for these events and posts messages to the given Slack Incoming Webhook.

Events currently emitted:
- `kiosk-registered` – a kiosk was registered.
- `kiosk-deleted` – a kiosk was removed.
- `mail-error` – sending a ticket email failed.

## Configuration
- `SLACK_WEBHOOK_URL` – Slack Incoming Webhook used for notifications. If omitted, Slack posting is disabled.
