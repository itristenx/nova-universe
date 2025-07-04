# CueIT Kiosk

A basic SwiftUI iPad kiosk application for submitting help desk tickets. The app fetches branding and text strings from the backend via the `/api/config` endpoint. These values are cached locally so the app can operate offline.

When launched the kiosk registers itself with the backend using `/api/register-kiosk`. An administrator must activate the kiosk from the admin UI before it can be used in production.
Set `KIOSK_TOKEN` in `CueIT Kiosk/CueIT Kiosk/Info.plist` to include a shared
secret during registration. This value must match the API's `KIOSK_TOKEN`.

## Building
1. Open `CueIT Kiosk.xcodeproj` in Xcode 15 or later.
2. Ensure the backend is running locally on the port defined in `cueit-api/.env` (`API_PORT`).
3. Run the app on an iPad or simulator.

If the build fails complaining about `TicketFormView` it means the project was previously incomplete. This repository now includes that view and the app should compile.

### Theme

SwiftUI views use color and spacing constants defined in `CueIT Kiosk/CueIT Kiosk/Theme.swift`.
These values mirror the tokens in `../../design/theme.js` so the iPad app
matches the web interfaces.

### Directory Lookup

To automatically populate the ticket form with a user's job title and manager,
the app queries your identity provider's SCIM API. The token for this request is
retrieved at runtime from the backend (or entered in settings) and stored
securely in the keychain. Add a `SCIM_URL` entry to
`CueIT Kiosk/CueIT Kiosk/Info.plist` if the directory endpoint differs from the
default of `\(API_BASE_URL)/scim/v2`.

### Admin Login

Tapping the gear icon on the welcome screen opens the admin login sheet. The
entered password is sent to the backend via the `/api/verify-password` endpoint
and never stored on the device. If the server verifies the password the sheet
is dismissed, otherwise an error message is shown.

## Tests

Unit tests live in `CueIT KioskTests`. Open the project in Xcode and select
**Product → Test** or press `⌘U` to run them. The suite verifies configuration
loading and kiosk startup behavior.

## Privacy

See [docs/privacy-policy.md](../docs/privacy-policy.md) for details about the data collected by the kiosk and how it is retained.
