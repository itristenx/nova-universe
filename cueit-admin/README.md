# CueIT Admin

React based interface for viewing help desk tickets and managing system settings.

## Setup
1. Run `npm install` in this directory.
2. Copy `.env.example` to `.env` and set `VITE_API_URL`. You can also set `VITE_LOGO_URL` and `VITE_ACTIVATE_URL`.
3. Start the dev server with `npm run dev`.

The admin UI lets you search tickets, edit configuration values, activate kiosk devices and manage users from the new **Users** tab in Settings.
Icons come from [Heroicons](https://github.com/tailwindlabs/heroicons) and are imported as React components.

### Theme

Design tokens live in `../../design/theme.js`. Import from `src/theme.js` to use
the same colors, fonts and spacing across components. Tailwind and DaisyUI are
configured to read from this file so any new pages should reference these
tokens.

