# CueIT Activate

A minimal React page for activating kiosks.

## Setup
1. Run `npm install` in this folder.
2. Create a `.env` with `VITE_API_URL` pointing to the backend. Optionally set
   `VITE_ADMIN_URL` to the admin interface so a link appears on the page.
3. Start the dev server with `npm run dev`.

### Theme

This page also consumes the shared design tokens in `../../design/theme.js` via
`src/theme.js`. Use these values when styling new components so colors and
spacing stay consistent with the rest of the project.
