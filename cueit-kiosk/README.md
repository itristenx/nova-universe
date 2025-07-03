# CueIT Kiosk

A basic SwiftUI iPad kiosk application for submitting help desk tickets. The app fetches branding and text strings from the backend via the `/api/config` endpoint. These values are cached locally so the app can operate offline.

When launched the kiosk registers itself with the backend using `/api/register-kiosk`. An administrator must activate the kiosk from the admin UI before it can be used in production.

## Building
1. Open `CueIT Kiosk.xcodeproj` in Xcode 15 or later.
2. Ensure the backend is running locally on the port defined in `cueit-api/.env` (`API_PORT`).
3. Run the app on an iPad or simulator.

If the build fails complaining about `TicketFormView` it means the project was previously incomplete. This repository now includes that view and the app should compile.

### Theme

SwiftUI views use color and spacing constants defined in `CueIT Kiosk/CueIT Kiosk/Theme.swift`.
These values mirror the tokens in `../../design/theme.js` so the iPad app
matches the web interfaces.
