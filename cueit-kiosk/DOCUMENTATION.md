# CueIT Kiosk iOS App Documentation

## Overview

The CueIT Kiosk iOS app is a customer-facing interface that allows users to submit IT support tickets through a guided interface. The app must be activated by an administrator before it can be used.

## Architecture

### Services

#### APIConfig.swift
- Manages server URL configuration
- Supports runtime server changes
- Falls back to Info.plist defaults
- Provides reset functionality

#### KioskService.swift
- Central service for kiosk lifecycle management
- Handles activation state tracking
- Manages polling for server connectivity
- Provides activation methods (QR code, manual entry)

#### ConfigService.swift
- Manages kiosk configuration
- Handles PIN verification for admin access
- Loads configuration from server
- Provides graceful error handling

### Views

#### LaunchView.swift
- Initial app entry point
- Determines which view to show based on kiosk state
- Handles navigation between activation and active states

#### ActivationView.swift
- Shown when kiosk needs activation
- Supports QR code scanning and manual code entry
- Provides server configuration access
- Shows connection status and errors

#### AdminLoginView.swift
- PIN-based authentication for administrators
- Shows admin panel after successful authentication
- Supports server configuration changes
- Provides kiosk status overview

#### ServerConfigView.swift
- Allows runtime server URL changes
- Validates URL format
- Provides reset to default functionality

## Configuration

### Info.plist Settings

- `API_BASE_URL`: Default server URL (http://127.0.0.1:3000 for local development)
- `NSAppTransportSecurity`: Configured to allow HTTP connections for development
- `NSCameraUsageDescription`: Required for QR code scanning

### Environment Variables

The app reads configuration from:
1. UserDefaults (runtime changes)
2. Info.plist (defaults)
3. Hardcoded fallbacks

## Development Setup

### Prerequisites

- Xcode 15.0+
- iOS 17.0+ SDK
- CueIT API server running locally

### Local Development

1. Start the API server:
   ```bash
   cd cueit-api
   npm start
   ```

2. The app is preconfigured to connect to `http://127.0.0.1:3000`

3. Build and run in iOS Simulator:
   ```bash
   xcodebuild -project "CueIT Kiosk.xcodeproj" -scheme "CueIT Kiosk" -destination "platform=iOS Simulator,name=iPhone 16" build
   ```

### Network Configuration

The app includes NSAppTransportSecurity exceptions for local development:
- Allows HTTP connections to localhost and 127.0.0.1
- Configurable timeouts for iOS Simulator compatibility

## Features

### Server Configuration
- Change server URL at any time via button in activation view
- Admin panel provides server configuration management
- Reset to default server URL functionality

### Activation
- QR code scanning for easy setup
- Manual activation code entry
- Real-time connection testing
- Graceful error handling with retry options

### Admin Access
- 6-digit PIN authentication
- Comprehensive admin panel with:
  - Server configuration
  - Kiosk status viewing
  - Configuration reset options

### Error Handling
- Network connectivity issues
- Invalid server responses
- Authentication failures
- Graceful degradation with user-friendly messages

## API Endpoints

The app communicates with these API endpoints:

- `GET /api/kiosks/{id}` - Check kiosk activation status
- `PUT /api/kiosks/{id}/active` - Activate kiosk
- `POST /api/register-kiosk` - Register new kiosk
- `POST /api/kiosks/{id}/activate` - Activate with code
- `GET /api/config` - Get configuration (requires auth)

## Security

- Kiosk IDs stored in iOS Keychain
- PIN verification for admin access
- JWT tokens for API authentication
- Secure defaults with ability to override for development

## Testing

### Manual Testing Checklist

1. **First Launch**
   - [ ] App shows activation screen
   - [ ] Server URL is displayed and editable
   - [ ] QR scanner opens and can be cancelled
   - [ ] Manual entry accepts codes and validates

2. **Server Configuration**
   - [ ] Server button opens configuration modal
   - [ ] URL validation works correctly
   - [ ] Reset to default functions properly
   - [ ] Changes are persisted across app restarts

3. **Admin Access**
   - [ ] Admin login screen accepts 6-digit PIN
   - [ ] Keyboard appears automatically
   - [ ] PIN digits display correctly
   - [ ] Admin panel shows after successful auth

4. **Error Handling**
   - [ ] Network errors display helpful messages
   - [ ] Server config option available during errors
   - [ ] App recovers gracefully from failures

### iOS Simulator Notes

- Use `127.0.0.1` instead of `localhost` for API connections
- NSAppTransportSecurity configured for HTTP development
- Network timeouts adjusted for simulator environment

## Troubleshooting

### Common Issues

1. **Cannot connect to local API**
   - Ensure API server is running on correct port
   - Use 127.0.0.1 instead of localhost
   - Check NSAppTransportSecurity settings

2. **Keyboard not appearing in admin login**
   - Tap the PIN digit area to focus the hidden text field
   - Ensure @FocusState is properly configured

3. **App stuck in activation loop**
   - Check server connectivity
   - Verify kiosk registration in API database
   - Use admin panel to reset configuration

### Debugging

Enable detailed logging by checking console output for:
- HTTP status codes
- Network errors
- API response parsing issues
- Keychain operations
