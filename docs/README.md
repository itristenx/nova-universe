# Nova Universe Documentation

Nova Universe is an internal help desk application for submitting and tracking IT tickets.

## Table of Contents
- [Quick Start Guide](#quick-start-guide)
- [Project Overview](#project-overview)
- [Installation & Setup](#installation--setup)
- [Security](#security)
- [Development](#development)
- [Deployment](#deployment)
- [Troubleshooting](#troubleshooting)

## Quick Links
- [🚀 Quick Start Guide](quickstart.md) - Get up and running fast
- [🔧 Development Guide](development.md) - For developers and contributors
- [🔒 Security Guide](security.md) - Security features and deployment
- [⚙️ Environment Setup](environments.md) - Configuration details
- [📦 Installers](installers.md) - Building packages

## Quick Start Guide

### Prerequisites
- Node.js 18+ and npm
- PostgreSQL
- For iOS kiosk: Xcode 15+ and iOS 16+

### Installation
```bash
# Clone and setup
git clone <repository-url>
cd nova-universe
./installers/setup.sh

# Start all services
./installers/start-all.sh
```

### Default Access
- **Admin UI**: http://localhost:5173
- **API**: http://localhost:3000
- **Default Login**: admin@example.com / admin

## Project Overview

Nova Universe is a comprehensive IT help desk system with multiple components:

### Core Components
- **nova-api** - Backend API server (Node.js/Express/PostgreSQL)
- **nova-admin** - Web admin interface (React/TypeScript/Vite)
- **nova-kiosk** - iOS kiosk application (Swift/SwiftUI)
- **nova-slack** - Slack integration service
- **nova-macos-swift** - macOS launcher application

### Key Features
- Ticket submission and management
- Kiosk activation system with QR codes
- Role-based access control (RBAC)
- Directory integration (SCIM)
- Real-time notifications
- Multi-platform support

## Components

### nova-api
Express.js backend with PostgreSQL database. Handles ticket submission, user management, kiosk activation, and integrations.

**Key Features:**
- REST API for all operations
- PostgreSQL database with automatic migrations
- Comprehensive security middleware
- Rate limiting and input validation
- Integration with HelpScout and Slack (ServiceNow integration removed)

### nova-admin
React admin interface for managing the help desk system.

**Key Features:**
- Ticket and user management
- Kiosk activation and monitoring
- System configuration
- Real-time status monitoring
- Responsive design

### nova-kiosk
SwiftUI iPad application for end-user ticket submission.

**Key Features:**
- QR code and manual activation
- Offline capability with caching
- Directory integration for user lookup
- Touch-friendly interface

### nova-slack
Slack integration for ticket submission via slash commands.

### nova-macos-swift
Native macOS launcher application.

## Architecture

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   nova-admin   │    │   nova-kiosk   │    │   nova-slack   │
│  (React SPA)    │    │  (iPad App)     │    │ (Slack Bot)     │
└─────────┬───────┘    └─────────┬───────┘    └─────────┬───────┘
          │                      │                      │
          └──────────────────────┼──────────────────────┘
                                 │
                    ┌─────────────▼──────────────┐
                    │        nova-api           │
                    │   (Express + PostgreSQL)   │
                    └────────────────────────────┘
```

## Installation & Setup

### Automated Setup
```bash
./installers/setup.sh
```

### Manual Setup
```bash
# Install dependencies for each component
cd nova-api && npm ci
cd ../nova-admin && npm ci
cd ../nova-slack && npm ci

# Initialize environment files
./scripts/init-env.sh

# Start services individually
cd cueit-api && npm start &
cd cueit-admin && npm run dev &
cd cueit-slack && npm start &
```

### Environment Configuration
Edit the `.env` files in each component directory:

#### cueit-api/.env
```
API_PORT=3000
SESSION_SECRET=your-secure-secret
ADMIN_EMAIL=admin@example.com
ADMIN_PASSWORD=your-secure-password
KIOSK_TOKEN=your-kiosk-token
SMTP_HOST=your-smtp-server
HELPDESK_EMAIL=helpdesk@example.com
DATABASE_URL=postgres://user:password@localhost:5432/cueit
```

#### cueit-admin/.env
```
VITE_API_URL=http://localhost:3000
VITE_ADMIN_URL=http://localhost:5173
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
   - CueIT Portal: http://localhost:5173
   - API: http://localhost:3000
   - Kiosk: Build and run in Xcode

## Security

See [SECURITY_FIXES.md](SECURITY_FIXES.md) for detailed security implementation.

### Key Security Features
- Strong password hashing (bcrypt with 12 salt rounds)
- Rate limiting and brute force protection
- Input validation and SQL injection prevention
- Security headers (CSP, XSS protection)
- Session security and HTTPS enforcement
- Secure kiosk activation with time-limited codes

### Production Security Checklist
- [ ] Set strong `SESSION_SECRET`
- [ ] Change default admin password
- [ ] Configure `KIOSK_TOKEN` for secure registration
- [ ] Enable HTTPS with valid certificates
- [ ] Set up proper CORS origins
- [ ] Configure secure SMTP settings
- [ ] Review and test all security headers

## Development

### Code Style Guidelines
- Use modern JavaScript with ES modules
- Indent files with two spaces
- Keep components and functions short and clearly named
- Share design tokens from `design/theme.js`

### Testing
```bash
# Run tests for each component from the repository root
pnpm --filter cueit-api test
pnpm --filter cueit-admin test
pnpm --filter cueit-slack test
```

### Development Scripts
```bash
# Start development environment
./cueit-dev.sh

# Test local setup
./test-local-setup.sh

# Clean iOS build (if needed)
cd cueit-kiosk && ./clean-build.sh
```

## Deployment

### Production Deployment
1. Build all components:
   ```bash
   cd cueit-admin && npm run build
   cd cueit-api && npm run build # if applicable
   ```

2. Configure production environment variables
3. Set up reverse proxy (nginx recommended)
4. Configure SSL certificates
5. Set up database backups
6. Configure log rotation

### Platform-Specific Installers
- **Windows**: `installers/make-windows-installer.ps1`
- **macOS**: `installers/make-installer.sh`
- **Linux**: `installers/make-linux-installer.sh`

## Troubleshooting

### Common Issues

#### API Connection Issues
1. Check if API is running: `curl http://localhost:3000/api/health` (see also `/api/version` for version info)
2. Verify environment variables are set
3. Check database connection and migrations

#### iOS Kiosk Build Issues
1. Clean build: `cd cueit-kiosk && ./clean-build.sh`
2. Check Xcode version compatibility
3. Verify iOS simulator connectivity to localhost

#### Authentication Problems
1. Check session secret is set
2. Verify admin user exists: `cd cueit-api && node cli.js list`
3. Reset admin password: `cd cueit-api && node cli.js update-password`

### Log Locations
- API logs: Check console output or configured log file
- Admin UI: Browser developer console
- iOS Kiosk: Xcode console when debugging

### Getting Help
1. Check existing documentation in `docs/` folder
2. Review component-specific README files
3. Check test files for usage examples
4. Review security documentation for secure deployment

## Support

- Check the [troubleshooting section](quickstart.md#troubleshooting) 
- Review [security guidelines](security.md) for production deployment
- See [development guide](development.md) for contributing

## Component Documentation
- [API Documentation](cueit-api/README.md)
- [Admin UI Documentation](cueit-admin/README.md)
- [iOS Kiosk Documentation](cueit-kiosk/README.md)
- [Slack Integration](cueit-slack/README.md)
- [macOS Launcher](cueit-macos-swift/README.md)
