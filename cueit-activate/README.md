# CueIT Activate

A minimal React page for activating kiosks.

## Setup
1. Run `npm install` in this folder.
2. Copy `.env.example` to `.env` and set `VITE_API_URL`. Optionally set `VITE_ADMIN_URL` to the admin interface so a link appears on the page.
3. Start the dev server with `npm run dev`.

### UI feedback

When activating a kiosk, the page now displays a yellow "Loading..." message
while the request is pending. On success the confirmation text turns green and on failure it appears in red.

### Theme

This page also consumes the shared design tokens in `../../design/theme.js` via
`src/theme.js`. Use these values when styling new components so colors and
spacing stay consistent with the rest of the project.
