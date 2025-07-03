# CueIT Backend

An Express and SQLite API that receives help desk tickets and stores configuration.

## Setup
1. Run `npm install` in this folder.
2. Create a `.env` file with your SMTP details and set `HELPDESK_EMAIL`.
   Optional variables are `API_PORT` and `LOGO_URL`.
3. Start the server with `node index.js`.

Kiosk devices register with `/api/register-kiosk` and can be activated through the admin UI.
