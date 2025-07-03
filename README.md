# CueIT

CueIT is an internal help desk application used to submit and track IT tickets. The repository contains several apps:

- **cueit-backend** – Express/SQLite API
- **cueit-admin** – React admin interface
- **cueit-kiosk** – iPad kiosk for ticket submission
- **cueit-activate** – small React app for activating kiosks
- **cueit-slack** – Slack slash command integration

The `design/theme.js` file defines shared colors, fonts and spacing. Frontends
import these tokens so styles remain consistent across the admin UI, activation
page and SwiftUI kiosk app.

## Requirements
- [Node.js](https://nodejs.org/) 18 or higher
- npm
- sqlite3
- [Mailpit](https://github.com/axllent/mailpit) (SMTP testing server)
- Xcode on macOS if you plan to build the SwiftUI kiosk

## Setup

Run `./setup.sh` to install Node.js, SQLite and all project dependencies in one step.
You can also follow the manual instructions below.

### Backend
1. Navigate to `cueit-backend`.
2. Run `npm install` to install dependencies.
3. Create a `.env` file with your SMTP configuration and `HELPDESK_EMAIL`.
   You can also customize `API_PORT`, `LOGO_URL` and other defaults.
4. Start the server with `node index.js` (uses `API_PORT`, default `3000`).

### Admin Frontend
1. Navigate to `cueit-admin`.
2. Run `npm install` to install dependencies.
3. Create a `.env` file and set `VITE_API_URL` and `VITE_LOGO_URL`.
4. Start the development server with `npm run dev` and open `http://localhost:5173`.

### Activation Page
1. Navigate to `cueit-activate`.
2. Run `npm install` to install dependencies.
3. Create a `.env` file with `VITE_API_URL`.
4. Start the dev server with `npm run dev` and open the page to activate kiosks.

The backend stores ticket logs in a local SQLite database (`cueit-backend/log.sqlite`).
Configuration values are stored in the same database and can be edited from the admin UI.

### Slack Service
1. Create a Slack app following [Slack's app setup guide](https://api.slack.com/apps) and add a `/new-ticket` slash command (see [Slash commands documentation](https://api.slack.com/interactivity/slash-commands)). Set its request URL to this service.
2. Navigate to `cueit-slack` and run `npm install`.
3. Create a `.env` file with:
   - `SLACK_SIGNING_SECRET`
   - `SLACK_BOT_TOKEN`
   - `API_URL`
   - optional `SLACK_PORT` (defaults to `3001`)
 4. Start the service with `node index.js`. It listens on `SLACK_PORT`.
 5. For local testing expose the port with `ngrok` and use the HTTPS URL in your Slack command:

```bash
npx ngrok http $SLACK_PORT
```

### Running All Services

Scripts are provided to launch the API, admin UI, activation page and Slack
service together using `concurrently`.

#### macOS / Linux

```bash
./start-all.sh
```

#### Windows

```powershell
./start-all.ps1
```

The SwiftUI kiosk can only be built and run on macOS with Xcode installed.

## Testing the API

To manually submit a ticket you can use `curl`:

```bash
curl -X POST http://localhost:3000/submit-ticket \
  -H "Content-Type: application/json" \
  -d '{
    "name": "[CUSTOMER NAME]",
    "email": "example@example.com",
    "title": "IT Tester Account",
    "system": "[NAME OF SYSTEM]",
    "urgency": "[Urgent, High, Medium, Low]",
    "description": "This is an example of a description"
}'
```

For a complete description of all endpoints see
[cueit-backend/README.md](cueit-backend/README.md#api-endpoints).

## Kiosk Activation

When the iPad kiosk application launches it sends a `POST` request to
`/api/register-kiosk` with a unique identifier. The backend stores the kiosk in
the `kiosks` table with `active` set to `0` (inactive). A kiosk cannot submit
tickets until it is activated.

An administrator can toggle the `active` flag from the **Kiosks** tab in the
admin UI or by visiting the separate activation page provided by the
`cueit-activate` app. Both interfaces call
`PUT /api/kiosks/:id/active` to update the flag. The iPad app periodically
fetches its configuration from `/api/kiosks/:id`; if `active` is `0` it shows an
activation required message instead of the ticket form.
When `VITE_ADMIN_URL` is set, the activation page shows a link back to the admin
UI for convenience.

To remotely disable a kiosk open the **Kiosks** tab in the admin UI and toggle
the active switch to the off position. You can also send a `PUT` request to
`/api/kiosks/{id}/active` with `{ "active": false }` to deactivate a kiosk via
the API. The kiosk will stop displaying the ticket form once its next activation
check detects the change.

## Components

- **cueit-backend** – Express API with an SQLite database. It exposes endpoints
  for submitting tickets, viewing logs, managing configuration and controlling
  kiosk devices.
- **cueit-admin** – React SPA that consumes the backend API to display logs and
  edit configuration. It also manages kiosk activation and branding.
- **cueit-kiosk** – SwiftUI iPad app used by end users to submit tickets. It
  registers itself with the backend and displays the ticket form only when its
  `active` flag is enabled.
- **cueit-activate** – Tiny React app that lets you quickly activate a kiosk by
  ID without using the full admin interface.
- **cueit-slack** – Service handling the `/new-ticket` Slack slash command. It
  opens a modal and forwards submissions to the backend.

## Environment Variables

Each app relies on a few environment variables:

### Backend

- `HELPDESK_EMAIL` – destination address for ticket emails.
- `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS` – SMTP credentials used by
  Nodemailer.
- Optional: `API_PORT` (default `3000`), `LOGO_URL`, `FAVICON_URL`.

### Admin UI

- `VITE_API_URL` – base URL of the backend API.
- `VITE_LOGO_URL` – default logo shown before configuration is loaded.
- `VITE_FAVICON_URL` – default favicon for the page.
- `VITE_ACTIVATE_URL` – optional URL of the activation page for linking.

### Activation App

- `VITE_API_URL` – backend URL used for the activation request.
- `VITE_ADMIN_URL` – optional link back to the admin UI shown on the page.

### Slack Service

- `SLACK_SIGNING_SECRET` – Slack app signing secret.
- `SLACK_BOT_TOKEN` – bot token with permissions to open modals and post
  messages.
- `API_URL` – base URL of the backend API for ticket submission.
- Optional: `SLACK_PORT` (default `3001`).

## Future Improvements

Several security and usability features are planned for a future version of the API and frontends:

- **Authentication** – add JWT based auth to protect admin and Slack endpoints and store hashed admin passwords instead of plaintext.
- **Log filtering** – allow filtering ticket logs by date range or email status when querying the `/api/logs` endpoint.
- **HTTPS** – enable TLS so the backend, admin UI and kiosk all communicate over HTTPS.
- **Kiosk registration tokens** – require a token when calling `/api/register-kiosk` to prevent unauthorized devices from spoofing a kiosk ID.

