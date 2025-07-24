# Nova Platform API

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](../LICENSE)
[![Open Issues](https://img.shields.io/github/issues/itristenx/nova-universe)](https://github.com/itristenx/nova-universe/issues)

---

## About

Express and SQLite API for the open source [Nova Universe](../README.md) help desk platform. Handles ticket submission, configuration, and Nova Beacon kiosk management.

---

## Setup
1. Run `npm install` in this folder.
2. Create a `.env` file with your SMTP details and set `HELPDESK_EMAIL`.
   To use HelpScout instead, provide `HELPSCOUT_API_KEY` and
   `HELPSCOUT_MAILBOX_ID` (optionally `HELPSCOUT_SMTP_FALLBACK=true` to also
   send email). Optional variables are `API_PORT`, `LOGO_URL` and
   `KIOSK_TOKEN` used by Nova Beacon devices.
  For SAML login also provide `SESSION_SECRET`, `SAML_ENTRY_POINT`,
  `SAML_ISSUER`, `SAML_CERT`, `SAML_CALLBACK_URL` and optional
  `ADMIN_URL` used for the post-login redirect. The server will
  refuse to start if `SESSION_SECRET` is not set when authentication
  is enabled. Set `ADMIN_PASSWORD` to seed the initial admin password
  used for kiosk login and the `/api/admin-password` management
  endpoints. You may also set `ADMIN_EMAIL` and `ADMIN_NAME` to
  customise the seeded admin user. By default the credentials are
  `admin@example.com` / `admin` with the name `Admin`.
3. Start the server with `node index.js`.

Nova Beacon devices register with `/api/register-kiosk` and can be activated through the Nova Core admin UI.
If `KIOSK_TOKEN` is set the request must include this value in a `token` field
or `Authorization` header.

When `SLACK_WEBHOOK_URL` is provided the backend posts notification events to the given Slack Incoming Webhook.

## API Endpoints

The API exposes a small REST API over Express. It loads SMTP and other
settings from `.env` and listens on `API_PORT` (default `3000`).

### Ticket Submission

`POST /submit-ticket`

- Body fields: `name`, `email`, `title`, `system`, `urgency` and optional
  `description`.
- Sends an email via Nodemailer and records the request in the `logs` table.
- Responds with the generated `ticketId` and an `emailStatus` of `success` or
  `fail`.

### Logs and Configuration

- `GET /api/logs` – return ticket logs sorted by timestamp. Optional query
  parameters:
  - `start` – ISO timestamp to filter logs on or after this time.
  - `end` – ISO timestamp to filter logs on or before this time.
  - `status` – filter by `email_status` value (`success` or `fail`).
- `DELETE /api/logs/:id` – delete a log entry by numeric id.
- `DELETE /api/logs` – remove all log entries.
- Old logs older than 30 days are purged automatically (set `LOG_RETENTION_DAYS` to adjust).
- `GET /api/config` – return configuration key/value pairs.
- `PUT /api/config` – insert or update configuration values.
- `GET /api/directory-config` – retrieve directory integration settings.
- `PUT /api/directory-config` – update directory integration settings.

### Beacon Kiosk Management

- `POST /api/register-kiosk` – register or update a Nova Beacon device by ID.
- `GET /api/kiosks/:id` – fetch configuration for a specific kiosk.
- `PUT /api/kiosks/:id` – update kiosk branding and active state.
- `GET /api/kiosks` – list all kiosks.
- `PUT /api/kiosks/:id/active` – toggle its active flag.
- `GET /api/kiosks/:id/status` – fetch status settings for a kiosk.
- `PUT /api/kiosks/:id/status` – update status settings.
- `GET /api/kiosks/:id/users` – search the configured directory.
- `POST /api/kiosks/:id/users` – create a user when lookup fails.
- `DELETE /api/kiosks/:id` – delete a kiosk by id.
- `DELETE /api/kiosks` – remove all kiosks.

### Notifications

- `GET /api/notifications` – list all notifications.
- `POST /api/notifications` – create a notification with `message` and `level`.
- `DELETE /api/notifications/:id` – delete a notification.
- `GET /api/notifications/stream` – Server-Sent Events stream of active notifications.

### Database Schema

SQLite tables are created in `log.sqlite`:

- `logs` – ticket information and email status.
- `config` – configuration values.
- `kiosks` – registered kiosks with branding URLs and active state.
- `notifications` – messages broadcast to kiosks via SSE.

## Authentication

Admin endpoints require SAML authentication. Browsers are
redirected to `/login` which initiates the SAML flow. After the IdP
authenticates the user it sends them back to `/login/callback` and a
session is established. The logged-in user information can be
retrieved from `/api/me`.

You can also obtain a JSON Web Token by POSTing an admin password to
`/api/login`. Set `JWT_SECRET` (and optional `JWT_EXPIRES_IN`) in your
environment. Include `Authorization: Bearer <token>` when calling
protected endpoints.

To enable SAML configure these variables in `.env`:

- `SESSION_SECRET` – secret used to sign the Express session cookie. The API
  exits during startup if this variable is missing and authentication is
  enabled.
- `SAML_ENTRY_POINT` – Identity Provider login URL.
- `SAML_ISSUER` – the SP entity ID/issuer string.
- `SAML_CERT` – IdP certificate used to validate responses.
- `SAML_CALLBACK_URL` – URL on this service that the IdP
  redirects to after authentication (e.g. `http://localhost:3000/login/callback`).
- `ADMIN_URL` – URL of the Nova Core admin frontend to redirect to after login.
- `HELPSCOUT_API_KEY` – API key used to create HelpScout conversations.
- `HELPSCOUT_MAILBOX_ID` – ID of the HelpScout mailbox.
- `HELPSCOUT_SMTP_FALLBACK` – set to `true` to also send email via SMTP.
- `JWT_SECRET` – secret key used to sign JSON Web Tokens.
- `JWT_EXPIRES_IN` – optional token expiry like `1h`.
- `RATE_LIMIT_WINDOW` – rate limit window in milliseconds (default `60000`).
- `SUBMIT_TICKET_LIMIT` – max requests per window to `/submit-ticket` (default `10`).
- `API_LOGIN_LIMIT` – max requests per window to `/api/login` (default `5`).
- `AUTH_LIMIT` – max requests per window to `/login` routes (default `5`).

## SCIM Provisioning

Set `SCIM_TOKEN` in your `.env` file to enable the SCIM 2.0 endpoints under
`/scim/v2`. Identity providers must supply this token as a bearer token in the
`Authorization` header when creating, updating or deleting users.

Example user creation request:

```bash
curl -X POST \
  -H "Authorization: Bearer $SCIM_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"userName":"john@example.com","displayName":"John"}' \
  http://localhost:3000/scim/v2/Users
```

## Security

### Password Hashing

This application uses bcryptjs for password hashing with the following security configurations:

- **bcryptjs version**: Latest stable version (3.0.2)
- **Salt rounds**: 12 (provides strong protection against brute force attacks)
- **Future consideration**: For new projects, consider migrating to Argon2 which is the current OWASP recommended password hashing algorithm

All password hashing operations in the codebase consistently use 12 salt rounds, which provides a good balance between security and performance.

---

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
