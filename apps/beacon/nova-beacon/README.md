# Nova Beacon

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](../LICENSE)
[![Open Issues](https://img.shields.io/github/issues/itristenx/nova-universe)](https://github.com/itristenx/nova-universe/issues)

---

## About

A SwiftUI iPad kiosk application for submitting help desk tickets. Part of the open source [Nova Universe](../README.md) platform.

---

## Features

- **Secure Activation**: QR code or manual activation code entry
- **Offline Capability**: Cached configuration allows operation without constant connectivity
- **Auto-Registration**: Automatically registers with backend on startup
- **Admin Controls**: Built-in admin login and server configuration
- **Directory Integration**: SCIM API integration for user lookup

## Quick Start

1. Open `Nova Beacon.xcodeproj` in Xcode 15 or later
2. Ensure the Nova Platform API v2 is running (default: https://localhost:3000)
3. Run the app on an iPad or simulator
4. Activate the kiosk using the Nova Core admin interface or activation code

## Configuration

- Do not embed secrets in `Info.plist`. Kiosk session/guest tokens are issued at activation.
- **API_BASE_URL**: Backend API URL (default: https://localhost:3000)
- **SCIM_URL**: Directory endpoint for user lookup (optional)

## Architecture

- **Theme**: Visual styling constants in `Theme.swift` matching design tokens
- **Services**: Core business logic in `KioskService.swift` and `APIConfig.swift` using API v2 endpoints
- **Views**: SwiftUI interface components with activation, configuration, and ticket forms
- **Tests**: Unit tests in `Nova BeaconTests/` covering configuration and service behavior

## Community & Contributing

- [Contributing Guidelines](../.github/CONTRIBUTING.md)
- [Code of Conduct](../.github/CODE_OF_CONDUCT.md)
- [Security Policy](../.github/SECURITY.md)
- [Open an Issue](https://github.com/itristenx/nova-universe/issues)
- [Submit a Pull Request](https://github.com/itristenx/nova-universe/pulls)

---

## License

This project is licensed under the [MIT License](../LICENSE).

---

## Credits & Acknowledgments

- [othneildrew/Best-README-Template](https://github.com/othneildrew/Best-README-Template) for README inspiration
- All contributors and open source dependencies

## Privacy

See [docs/privacy-policy.md](../docs/privacy-policy.md) for data collection and retention details. Privacy retention window and content are driven by tenant config from Core.
