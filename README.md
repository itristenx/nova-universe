# CueIT

CueIT is an internal help desk application used to submit and track IT tickets.

## Requirements
- [Node.js](https://nodejs.org/) 18 or higher

## Setup

### Backend
1. Navigate to `cueit-backend`.
2. Run `npm install` to install dependencies.
3. Create a `.env` file with your SMTP configuration and `HELPDESK_EMAIL`.
4. Start the server with `node index.js` (runs on port `3000`).

### Admin Frontend
1. Navigate to `cueit-admin`.
2. Run `npm install` to install dependencies.
3. Start the development server with `npm run dev`.
4. Open `http://localhost:5173` in your browser to access the admin UI.

The backend stores ticket logs in a local SQLite database (`cueit-backend/log.sqlite`).
