# Quick Start Guide

Get CueIT running in 5 minutes.

## Prerequisites
- [Node.js](https://nodejs.org/) 18+
- npm
- [pnpm](https://pnpm.io/installation) (install with `npm install -g pnpm`)
- SQLite3

## Quick Setup

1. **Clone and Install**
   ```bash
   git clone https://github.com/your-org/CueIT.git
   cd CueIT
   pnpm install
   ```

2. **Configure**
   ```bash
   cp .env.local.example .env.local
   ./scripts/init-env.sh
   ```

3. **Start All Services**
   ```bash
   ./installers/start-all.sh
   ```

4. **Access the Admin Interface**
   Open http://localhost:5173 in your browser

## Default Login
- Email: `admin@example.com`
- Password: `admin` (change this immediately)

## What's Running?
- **API**: http://localhost:3000 - Backend services
- **Admin UI**: http://localhost:5173 - Management interface
- **Database**: `cueit-api/log.sqlite` - Local SQLite database

## Next Steps

### Configure Email (Optional)
Edit `cueit-api/.env`:
```bash
SMTP_HOST=your-smtp-server
SMTP_PORT=587
SMTP_USER=your-email@company.com
SMTP_PASS=your-password
HELPDESK_EMAIL=helpdesk@company.com
```

### Set Up Kiosk (Optional)
1. Open the iPad kiosk project in Xcode
2. Build and run on iPad or simulator
3. Use the admin interface to generate activation codes
4. Scan QR code or enter activation code on kiosk

### Configure Slack (Optional)
1. Create a Slack app and get tokens
2. Edit `cueit-slack/.env` with your tokens
3. Set the slash command URL to your server

## Troubleshooting

**Services won't start?**
- Check that ports 3000 and 5173 are available
- Ensure Node.js 18+ is installed
- Run `pnpm install` from the repository root to install workspace dependencies

**Can't connect to admin interface?**
- Verify the API is running at http://localhost:3000/api/health (see also /api/version for version info)
- Check browser console for errors
- Ensure authentication is disabled for development (`DISABLE_AUTH=true`)

**Database issues?**
- Delete `cueit-api/log.sqlite` and restart to recreate
- Check file permissions in the cueit-api directory

## Production Deployment

See [Security Guide](security.md) for production deployment requirements including:
- HTTPS configuration
- Strong passwords and secrets
- Environment variable security
- Monitoring setup
