# Local vs Production Setup

This project ships with sample environment files for each app. Copy these files to `.env` and adjust the values for your environment.

## Local Development

1. `cueit-api/.env.example`
   - Use the default `SMTP_HOST=localhost` and `SMTP_PORT=1025` with [Mailpit](https://github.com/axllent/mailpit).
   - Set `HELPDESK_EMAIL` to any address for testing.
   - Keep `ADMIN_URL` and all other URLs as `http://localhost` values.
   - `SESSION_SECRET` can be any string during local development.
2. `cueit-admin/.env.example`
   - `VITE_API_URL` should match your local API URL.
   - Leave `VITE_LOGO_URL` and `VITE_ACTIVATE_URL` as provided or point to local resources.
3. `cueit-activate/.env.example`
   - `VITE_API_URL` should point to the local backend.
   - `VITE_ADMIN_URL` can stay on `http://localhost:5173` if the admin UI runs locally.
4. `cueit-slack/.env.example`
   - Use dummy values for `SLACK_SIGNING_SECRET` and `SLACK_BOT_TOKEN`.
   - `API_URL` should match the local API URL.

## Production Deployment

When deploying to a live environment you must update each `.env` file with real values:

- Provide your actual SMTP server credentials so ticket emails are delivered.
- Use HTTPS URLs for all services and SAML configuration.
- Set a strong random `SESSION_SECRET` for the API.
- Replace Slack tokens and signing secret with the real app credentials.

Copy the respective `.env.example` file to `.env` in each folder, then edit the settings above before starting the services.
