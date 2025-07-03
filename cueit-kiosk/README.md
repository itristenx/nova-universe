# CueIT Kiosk

A basic SwiftUI iPad kiosk application for submitting help desk tickets. The app fetches branding and text strings from the backend via the `/api/config` endpoint. These values are cached locally so the app can operate offline.

## Building
1. Open `CueIT Kiosk.xcodeproj` in Xcode 15 or later.
2. Ensure the backend is running locally on the port defined in `cueit-backend/.env` (`API_PORT`).
3. Run the app on an iPad or simulator.

If the build fails complaining about `TicketFormView` it means the project was previously incomplete. This repository now includes that view and the app should compile.
