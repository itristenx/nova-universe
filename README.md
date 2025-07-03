# CueIT

CueIT is an internal help desk application used to submit and track IT tickets. The repository contains three apps:

- **cueit-backend** – Express/SQLite API
- **cueit-admin** – React admin interface
- **cueit-kiosk** – iPad kiosk for ticket submission

## Requirements
- [Node.js](https://nodejs.org/) 18 or higher
- npm
- sqlite3
- [Mailpit](https://github.com/axllent/mailpit) (SMTP testing server)

## Setup

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

The backend stores ticket logs in a local SQLite database (`cueit-backend/log.sqlite`).
Configuration values are stored in the same database and can be edited from the admin UI.

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
