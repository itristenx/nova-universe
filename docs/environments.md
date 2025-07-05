# Local vs Production Setup

This project ships with sample environment files for each app. Copy these files to `.env` and adjust the values for your environment.

## Local Development

1. `cueit-api/.env.example`
   - Use the default `SMTP_HOST=localhost` and `SMTP_PORT=1025` with [Mailpit](https://github.com/axllent/mailpit).
   - Set `HELPDESK_EMAIL` to any address for testing.
   - Set `TLS_CERT_PATH` and `TLS_KEY_PATH` to local certificate files if you want to enable HTTPS.
   - Keep `ADMIN_URL` and other URLs as `https://localhost` when TLS is enabled, otherwise `http://localhost`.
   - `SESSION_SECRET` can be any string during local development.
   - `CORS_ORIGINS` lists allowed origins as a comma-separated string.
2. `cueit-admin/.env.example`
   - `VITE_API_URL` should match your local API URL.
   - Leave `VITE_LOGO_URL` and `VITE_ACTIVATE_URL` as provided or point to local resources.
3. `cueit-activate/.env.example`
   - `VITE_API_URL` should point to the local backend.
   - `VITE_ADMIN_URL` can stay on `https://localhost:5173` if the admin UI runs locally with TLS.
4. `cueit-slack/.env.example`
   - Use dummy values for `SLACK_SIGNING_SECRET` and `SLACK_BOT_TOKEN`.
   - `API_URL` should match the local API URL.

## HTTPS Setup

To run all services over HTTPS during development:

1. Generate a self-signed certificate:

   ```bash
   openssl req -x509 -newkey rsa:2048 -nodes -keyout key.pem -out cert.pem -days 365
   ```

2. Set `TLS_CERT_PATH` and `TLS_KEY_PATH` in `cueit-api/.env` to the paths of `cert.pem` and `key.pem`.
3. Update the URLs in the other `.env` files to use `https://localhost` as shown in the examples.

## Production Deployment

When deploying to a live environment you must update each `.env` file with real values:

- Provide your actual SMTP server credentials so ticket emails are delivered.
- Use HTTPS URLs for all services and SAML configuration.
- Set a strong random `SESSION_SECRET` for the API.
- Replace Slack tokens and signing secret with the real app credentials.

Copy the respective `.env.example` file to `.env` in each folder, then edit the settings above before starting the services.
