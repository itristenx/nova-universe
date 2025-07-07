# CueIT Documentation

CueIT is an internal help desk application for submitting and tracking IT tickets.

## Quick Links
- [🚀 Quick Start Guide](quickstart.md) - Get up and running fast
- [🔧 Development Guide](development.md) - For developers and contributors
- [🔒 Security Guide](security.md) - Security features and deployment
- [⚙️ Environment Setup](environments.md) - Configuration details
- [📦 Installers](installers.md) - Building packages

## Components

### cueit-api
Express.js backend with SQLite database. Handles ticket submission, user management, kiosk activation, and integrations.

**Key Features:**
- REST API for all operations
- SQLite database with automatic migrations
- Comprehensive security middleware
- Rate limiting and input validation
- Integration with HelpScout, ServiceNow, and Slack

### cueit-admin
React admin interface for managing the help desk system.

**Key Features:**
- Ticket and user management
- Kiosk activation and monitoring
- System configuration
- Real-time status monitoring
- Responsive design

### cueit-kiosk
SwiftUI iPad application for end-user ticket submission.

**Key Features:**
- QR code and manual activation
- Offline capability with caching
- Directory integration for user lookup
- Touch-friendly interface

### cueit-slack
Slack integration for ticket submission via slash commands.

### cueit-macos-swift
Native macOS launcher application.

## Architecture

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   cueit-admin   │    │   cueit-kiosk   │    │   cueit-slack   │
│  (React SPA)    │    │  (iPad App)     │    │ (Slack Bot)     │
└─────────┬───────┘    └─────────┬───────┘    └─────────┬───────┘
          │                      │                      │
          └──────────────────────┼──────────────────────┘
                                 │
                    ┌─────────────▼──────────────┐
                    │        cueit-api           │
                    │   (Express + SQLite)       │
                    └────────────────────────────┘
```

## Getting Started

1. **Install Dependencies**
   ```bash
   ./installers/setup.sh
   ```

2. **Configure Environment**
   ```bash
   cp .env.local.example .env.local
   ./scripts/init-env.sh
   ```

3. **Start Services**
   ```bash
   ./installers/start-all.sh
   ```

4. **Access Applications**
   - Admin UI: http://localhost:5173
   - API: http://localhost:3000
   - Kiosk: Build and run in Xcode

## Support

- Check the [troubleshooting section](quickstart.md#troubleshooting) 
- Review [security guidelines](security.md) for production deployment
- See [development guide](development.md) for contributing
