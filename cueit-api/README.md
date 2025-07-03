# CueIT API

An Express and SQLite API that receives help desk tickets and stores configuration.

## Setup
1. Run `npm install` in this folder.
2. Create a `.env` file with your SMTP details and set `HELPDESK_EMAIL`.
   Optional variables are `API_PORT` and `LOGO_URL`.
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
