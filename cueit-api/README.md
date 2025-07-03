# CueIT API

An Express and SQLite API that receives help desk tickets and stores configuration.

## Setup
1. Run `npm install` in this folder.
2. Create a `.env` file with your SMTP details and set `HELPDESK_EMAIL`.
   To use HelpScout instead, provide `HELPSCOUT_API_KEY` and
   `HELPSCOUT_MAILBOX_ID` (optionally `HELPSCOUT_SMTP_FALLBACK=true` to also
   send email). Optional variables are `API_PORT` and `LOGO_URL`.
  For SAML login also provide `SESSION_SECRET`, `SAML_ENTRY_POINT`,
  `SAML_ISSUER`, `SAML_CERT`, `SAML_CALLBACK_URL` and optional
  `ADMIN_URL` used for the post-login redirect. The server will
  refuse to start if `SESSION_SECRET` is not set when authentication
  is enabled. Set `ADMIN_PASSWORD` to seed the initial admin password
  used for kiosk login and the `/api/admin-password` management
  endpoints.
3. Start the server with `node index.js`.

Kiosk devices register with `/api/register-kiosk` and can be activated through the admin UI.

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

- `GET /api/logs` – return all ticket logs sorted by timestamp.
- `DELETE /api/logs/:id` – delete a log entry by numeric id.
- `DELETE /api/logs` – remove all log entries.
- `GET /api/config` – return configuration key/value pairs.
- `PUT /api/config` – insert or update configuration values.

### Kiosk Management

- `POST /api/register-kiosk` – register or update a kiosk device by ID.
- `GET /api/kiosks/:id` – fetch configuration for a specific kiosk.
- `PUT /api/kiosks/:id` – update kiosk branding and active state.
- `GET /api/kiosks` – list all kiosks.
- `PUT /api/kiosks/:id/active` – toggle its active flag.
- `DELETE /api/kiosks/:id` – delete a kiosk by id.
- `DELETE /api/kiosks` – remove all kiosks.

### Database Schema

SQLite tables are created in `log.sqlite`:

- `logs` – ticket information and email status.
- `config` – configuration values.
- `kiosks` – registered kiosks with branding URLs and active state.

## Authentication

Admin endpoints require SAML authentication. Browsers are
redirected to `/login` which initiates the SAML flow. After the IdP
authenticates the user it sends them back to `/login/callback` and a
session is established. The logged‑in user information can be
retrieved from `/api/me`.

To enable SAML configure these variables in `.env`:

- `SESSION_SECRET` – secret used to sign the Express session cookie. The API
  exits during startup if this variable is missing and authentication is
  enabled.
- `SAML_ENTRY_POINT` – Identity Provider login URL.
- `SAML_ISSUER` – the SP entity ID/issuer string.
- `SAML_CERT` – IdP certificate used to validate responses.
- `SAML_CALLBACK_URL` – URL on this service that the IdP
  redirects to after authentication (e.g. `http://localhost:3000/login/callback`).
- `ADMIN_URL` – URL of the admin frontend to redirect to after login.
- `HELPSCOUT_API_KEY` – API key used to create HelpScout conversations.
- `HELPSCOUT_MAILBOX_ID` – ID of the HelpScout mailbox.
- `HELPSCOUT_SMTP_FALLBACK` – set to `true` to also send email via SMTP.

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
