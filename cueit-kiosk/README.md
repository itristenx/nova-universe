# CueIT Kiosk

A SwiftUI iPad kiosk application for submitting help desk tickets. The app fetches branding and configuration from the backend and caches them locally for offline operation.

## Features

- **Secure Activation**: QR code or manual activation code entry
- **Offline Capability**: Cached configuration allows operation without constant connectivity
- **Auto-Registration**: Automatically registers with backend on startup
- **Admin Controls**: Built-in admin login and server configuration
- **Directory Integration**: SCIM API integration for user lookup

## Quick Start

1. Open `CueIT Kiosk.xcodeproj` in Xcode 15 or later
2. Ensure the backend API is running (default: http://127.0.0.1:3000)
3. Run the app on an iPad or simulator
4. Activate the kiosk using the admin interface or activation code

## Configuration

- **KIOSK_TOKEN**: Set in `Info.plist` to match the API's `KIOSK_TOKEN` for secure registration
- **API_BASE_URL**: Backend API URL (default: http://127.0.0.1:3000)
- **SCIM_URL**: Directory endpoint for user lookup (optional)

## Architecture

- **Theme**: Visual styling constants in `Theme.swift` matching design tokens
- **Services**: Core business logic in `KioskService.swift` and `APIConfig.swift`
- **Views**: SwiftUI interface components with activation, configuration, and ticket forms
- **Tests**: Unit tests in `CueIT KioskTests/` covering configuration and service behavior

## Privacy

See [docs/privacy-policy.md](../docs/privacy-policy.md) for data collection and retention details.
