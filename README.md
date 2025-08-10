<p align="center"><img src="assets/branding/Nova_Universe_Dark.png" alt="Nova Universe logo" width="200"/></p>

# Nova Universe

**Modern help desk that just works.**

[![Build Status](https://img.shields.io/github/actions/workflow/status/itristenx/nova-universe/ci.yml?branch=main)](https://github.com/itristenx/nova-universe/actions)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

---

## What is Nova Universe?

Nova Universe is an enterprise help desk platform designed for teams who want powerful features without complexity. Submit tickets, track progress, and resolve issues faster.

**Key Features:**
- 🎯 **Simple Setup** - Running in minutes, not hours
- 📱 **iPad Kiosk** - Self-service ticket submission 
- 🔍 **Smart Search** - AI-powered ticket discovery
- 📊 **Real-time Monitoring** - Built-in uptime tracking
- 🚨 **Smart Alerts** - Intelligent incident management
- 💬 **Team Integration** - Slack, Teams, webhooks
- 🔒 **Enterprise Security** - SAML SSO, RBAC, audit logs

---

## Quick Start

**One command to get started:**

```bash
git clone https://github.com/itristenx/nova-universe.git
cd nova-universe
./setup.sh
```

That's it. Open http://localhost:3001 and start using Nova Universe.

**Default login:**
- Email: `admin@example.com`
- Password: `admin`

---

## What's Included

**Core Platform:**
- **Nova Core** - Admin interface and dashboard
- **Nova API** - REST API and GraphQL backend  
- **Nova Beacon** - iPad kiosk for ticket submission
- **Nova Comms** - Slack integration and webhooks

**Monitoring & Alerting:**
- **Nova Sentinel** - Uptime monitoring (Uptime Kuma)
- **GoAlert** - Incident response and escalation
- **AI Fabric** - Machine learning and automation

**Everything works together seamlessly.**

---

## Architecture

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Nova Core     │    │   Nova Beacon   │    │   Nova Comms    │
│  (Admin UI)     │    │   (iPad Kiosk)  │    │ (Integrations)  │
└─────────┬───────┘    └─────────┬───────┘    └─────────┬───────┘
          │                      │                      │
          └──────────────────────┼──────────────────────┘
                                 │
                    ┌─────────────┴───────────┐
                    │      Nova API          │
                    │   (Core Backend)       │
                    └─────────────┬───────────┘
                                 │
               ┌─────────────────┼─────────────────┐
               │                 │                 │
    ┌──────────┴────────┐ ┌──────┴──────┐ ┌───────┴──────┐
    │  Nova Sentinel    │ │  GoAlert    │ │  AI Fabric   │
    │  (Monitoring)     │ │ (Alerting)  │ │    (AI)      │
    └───────────────────┘ └─────────────┘ └──────────────┘
```

---

## Management

**CLI Commands:**
```bash
# Service management
cd apps/api && node cli.js start    # Start all services
cd apps/api && node cli.js stop     # Stop all services  
cd apps/api && node cli.js health   # Check system health

# User management  
cd apps/api && node cli.js passwd newpassword123  # Change admin password
cd apps/api && node cli.js users    # List admin users

# System operations
cd apps/api && node cli.js reset    # Reset to clean state
cd apps/api && node cli.js status   # Show service URLs
```

**Deployment:**
```bash
# Production deployment
./scripts/deploy-production.sh

# Complete teardown
./teardown.sh
```

---

## Requirements

- **Node.js** 18+
- **Docker** (recommended)
- **PostgreSQL** 15+ (or use Docker)

**Optional for full features:**
- **Redis** (caching)
- **Elasticsearch** (advanced search)
- **S3** (file storage)

---

## Configuration

Nova Universe configures itself during setup. For advanced configuration:

1. **Setup Wizard** - Visit http://localhost:3001/setup after installation
2. **Admin Panel** - Configure services in the admin interface
3. **Environment Files** - Manual configuration in `.env` files

**Key integrations:**
- Slack/Teams notifications
- SAML/OIDC authentication  
- Monitoring and alerting
- AI-powered features

---

## Production Deployment

**Quick production setup:**
```bash
# Generate production configuration
bash scripts/generate-production-secrets.sh

# Deploy with monitoring and SSL
bash scripts/deploy-production.sh
```

**What you get:**
- SSL/TLS encryption
- Production database  
- Monitoring dashboard
- Automated backups
- Health checks
- Log aggregation

---

## Support

- **Documentation** - [docs/quickstart.md](docs/quickstart.md)
- **API Reference** - http://localhost:3000/docs (after setup)
- **Issues** - [GitHub Issues](https://github.com/itristenx/nova-universe/issues)

---

## License

MIT License - see [LICENSE](LICENSE) file.

**Nova Universe** - Help desk that scales with your team.

### Quick Start

```bash
git clone https://github.com/itristenx/nova-universe.git
cd nova-universe
./scripts/setup.sh
./scripts/start-all.sh
```

Open http://localhost:5173 to access the admin interface.

**Default login:** admin@example.com / admin

---

## Documentation
- [📖 Full Documentation](docs/README.md)
- [🚀 Quick Start Guide](docs/quickstart.md)
- [🔒 Security & Production](docs/security.md)
- [🔧 Development Guide](docs/development.md)

---

## Community & Contributing
- [Contributing Guidelines](.github/CONTRIBUTING.md)
- [Code of Conduct](.github/CODE_OF_CONDUCT.md)
- [Security Policy](.github/SECURITY.md)
- [Discussions](https://github.com/itristenx/nova-universe/discussions)
- [Open an Issue](https://github.com/itristenx/nova-universe/issues)
- [Submit a Pull Request](https://github.com/itristenx/nova-universe/pulls)

We welcome all contributions! Please read the contributing guidelines and code of conduct before submitting issues or pull requests.

---

## License

This project is licensed under the [MIT License](LICENSE).

---

## Credits & Acknowledgments
- [Contributor Covenant](https://www.contributor-covenant.org/) for the Code of Conduct
- [Choose an Open Source License](https://choosealicense.com/)
- [othneildrew/Best-README-Template](https://github.com/othneildrew/Best-README-Template) for README inspiration
- All contributors and open source dependencies

---

## Contact

For questions, suggestions, or support, please use [GitHub Discussions](https://github.com/itristenx/nova-universe/discussions) or open an issue.

---

## Requirements
- [Node.js](https://nodejs.org/) 18 or higher
- npm
- [Mailpit](https://github.com/axllent/mailpit) (SMTP testing server)
- PostgreSQL 15 or higher


## Setup

Run `./scripts/setup.sh` to install Node.js.
Copy `.env.local.example` to `.env.local` and adjust any values for your machine.
`setup.sh` creates missing `.env` files automatically. You can rerun `./scripts/init-env.sh` to regenerate them.
You can also follow the manual instructions below.
See [Local vs Production Setup](docs/environments.md) for details on configuring the environment variables used by each service.

### Platform API
1. Navigate to `nova-api`.
2. Dependencies should already be installed from the repository root with `pnpm install`.
3. Edit the `.env` file with your SMTP configuration and `HELPDESK_EMAIL`.
   To send tickets directly to HelpScout instead, provide
   `HELPSCOUT_API_KEY` and `HELPSCOUT_MAILBOX_ID` (optionally set
   `HELPSCOUT_SMTP_FALLBACK=true` to also send email).
   **Note:** ServiceNow integration has been fully deprecated and removed.
   You can customize `API_PORT`, `LOGO_URL`, `FAVICON_URL` and `ORGANIZATION_NAME`.
4. Start the server with `node index.js` (uses `API_PORT`, default `3000`).

The API also exposes a GraphQL endpoint at `/api/v2/graphql` for internal tools.
Authenticate with an admin JWT token before making requests. You can explore it with Apollo Sandbox or `curl`:

```graphql
query {
  tickets {
    id
    title
    priority
  }
}
```

### Core Admin UI
1. Navigate to `nova-core`.
2. Dependencies should already be installed from the repository root with `pnpm install`.
3. Edit the `.env` file and set `VITE_API_URL`. You can also set `VITE_LOGO_URL`.
4. Start the development server with `npm run dev` and open `http://localhost:5173`.

The admin interface includes comprehensive kiosk management functionality, including:
- Kiosk activation via QR codes or manual entry
- System configuration management for ticket categories
- Server management and restart capabilities
- User management with role-based access control
- Integrated security features with rate limiting and input validation

The backend stores ticket logs in a local PostgreSQL database.
Configuration values are stored in the same database and can be edited from the admin UI.

### Comms (Slack Service)
1. Create a Slack app following [Slack's app setup guide](https://api.slack.com/apps) and add a `/new-ticket` slash command (see [Slash commands documentation](https://api.slack.com/interactivity/slash-commands)). Set its request URL to this service.
2. Navigate to `nova-comms` (dependencies were installed from the repository root with `pnpm install`).
3. Edit the `.env` file and set:
   - `SLACK_SIGNING_SECRET`
   - `SLACK_BOT_TOKEN`
   - `API_URL`
   - optional `SLACK_PORT` (defaults to `3001`)
4. Start the service with `node index.js`. It listens on `SLACK_PORT`.
5. For local testing expose the port with `ngrok` and use the HTTPS URL in your Slack command:

```bash
npx ngrok http $SLACK_PORT
```

### HTTPS Setup

1. Generate a self-signed certificate:

   ```bash
   openssl req -x509 -newkey rsa:2048 -nodes -keyout key.pem -out cert.pem -days 365
   ```

2. Set `TLS_CERT_PATH` and `TLS_KEY_PATH` in `nova-api/.env` to the certificate paths.
3. Update the URLs in all `.env` files to use `https://localhost` as shown in the examples.
4. Place `cert.pem` and `key.pem` in the project root before running the installer scripts so the files are bundled.

### Running All Services

Scripts are provided to launch the API, admin UI, and Slack
service together using `concurrently`. When running the script you will be
prompted to choose which apps to start (press **Enter** for all). For each
selected app the script verifies that a `.env` file exists and installs
dependencies if the `node_modules` directory is missing. Each service is
started with `npm start` so its environment file loads correctly.

```powershell
./scripts/start-all.ps1
```

### Windows Installer

Install [Inno Setup](https://jrsoftware.org/isinfo.php) along with Node.js and npm.
Run the following command to generate `Nova-<version>.exe`:

```powershell
./tools/scripts/scripts/make-windows-installer.ps1 -Version 1.0.0
```

Run the generated `.exe` to install Nova Universe.

### Linux Installer

Install `electron-installer-appimage` globally with:

```bash
npm install -g electron-installer-appimage
```

Then build the AppImage:

```bash
./tools/scripts/scripts/make-linux-installer.sh 1.0.0
```

Mark the output file executable and run it to start the application.

All installer and upgrade scripts live in `tools/scripts/scripts/` and should include basic tests to verify they work.

## Running Tests

Nova Universe includes automated test suites for the backend API and the admin UI.

### nova-api

Run from the repository root:
1. `pnpm --filter nova-universe-api test`

The API tests are written with Mocha and exercise the main Express endpoints.

### nova-core

Run from the repository root:
1. `pnpm --filter nova-core-admin test`

This suite uses Jest and React Testing Library to validate the UI.

See the [contributor guide](docs/development.md) for additional details.
When adding JavaScript tests for installer scripts be sure to run `npm run lint` in the package you updated.

## Testing the API

To manually submit a ticket you can use `curl`:

```bash
curl -X POST http://localhost:3000/submit-ticket \
  -H "Content-Type: application/json" \
  -d '{
    "name": "[CUSTOMER NAME]",
    "email": "example@example.com",
    "title": "IT Tester Account",
    "system": "[NAME OF SYSTEM]",
    "urgency": "[Urgent, High, Medium, Low]",
    "description": "This is an example of a description"
}'
```

For a complete description of all endpoints see
[nova-api/README.md](nova-api/README.md#api-endpoints).

## HelpScout Integration (Import Only)

When `HELPSCOUT_API_KEY` and `HELPSCOUT_MAILBOX_ID` are defined in
`nova-api/.env`, the API creates a new HelpScout conversation for each ticket
submitted to `POST /submit-ticket`. Set `HELPSCOUT_SMTP_FALLBACK=true` if you
want the server to also send the ticket email using your SMTP configuration.

## ServiceNow Integration (Deprecated)

ServiceNow support has been **removed** from the platform and no
ServiceNow-specific configuration or endpoints remain.

## Kiosk Activation

When the Nova Beacon application launches it sends a `POST` request to
`/api/register-kiosk` with a unique identifier. The backend stores the kiosk in
the `kiosks` table with `active` set to `0` (inactive). A kiosk cannot submit
tickets until it is activated.

An administrator can toggle the `active` flag from the **Kiosks** tab in the
admin UI or directly from the Beacon kiosk. The admin interface calls
`PUT /api/kiosks/:id/active` to update the flag. When a kiosk is inactive the
app displays an activation screen showing the API URL and kiosk ID. Tapping the
**Activate** button sends the request to enable the kiosk.

To remotely disable a kiosk open the **Kiosks** tab in the admin UI and toggle
the active switch to the off position. You can also send a `PUT` request to
`/api/kiosks/{id}/active` with `{ "active": false }` to deactivate a kiosk via
the API. The kiosk will stop displaying the ticket form once its next activation
check detects the change.

## Components

- **nova-api** – Nova Platform API (Express backend with PostgreSQL database)
- **nova-core** – Nova Core (React admin interface)
- **nova-beacon** – Nova Beacon (iPad kiosk app for ticket submission)
- **nova-comms** – Nova Comms (Slack integration)

## Requirements

- Node.js 18+
- PostgreSQL 15+

## Environment Variables

Each app relies on a few environment variables:

### Platform API

- `HELPDESK_EMAIL` – destination address for ticket emails.
- `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS` – SMTP credentials used by
  Nodemailer.
- `HELPSCOUT_API_KEY`, `HELPSCOUT_MAILBOX_ID` – enable HelpScout integration
  for ticket submissions.
- `HELPSCOUT_SMTP_FALLBACK` – set to `true` to also send email via SMTP.
- `SESSION_SECRET`, `SAML_ENTRY_POINT`, `SAML_ISSUER`, `SAML_CERT`,
  `SAML_CALLBACK_URL`, `ADMIN_URL` – required for SAML login.
 - Optional: `API_PORT` (default `3000`), `LOGO_URL`, `FAVICON_URL`, `ORGANIZATION_NAME`.
- Optional: set `TLS_CERT_PATH` and `TLS_KEY_PATH` to enable HTTPS.
- `ADMIN_PASSWORD` – seeds the initial admin password for kiosk login and the
  password management endpoints.
- `JWT_SECRET` – secret used to sign JSON Web Tokens.
- `JWT_EXPIRES_IN` – token expiration (e.g., `1h`).
- `SCIM_TOKEN` – bearer token required for SCIM provisioning endpoints.
- `KIOSK_TOKEN` – secure token required for kiosk registration.
- `DISABLE_AUTH` – set to `true` to bypass SAML authentication and
  access the admin UI before SSO is configured.

### Core Admin UI

- `VITE_API_URL` – base URL of the backend API.
- `VITE_LOGO_URL` – default logo shown before configuration is loaded.
- `VITE_FAVICON_URL` – default favicon for the page.

### Pulse Performance Dashboard

- `VITE_API_URL` – base URL of the backend API.

### Comms (Slack Service)

- `SLACK_SIGNING_SECRET` – Slack app signing secret.
- `SLACK_BOT_TOKEN` – bot token with permissions to open modals and post
  messages.
  - `API_URL` – base URL of the backend API for ticket submission.
  - Optional: `SLACK_PORT` (default `3001`).

## Theme-Based Logo Configuration

Nova Universe applications automatically load appropriate logos based on the current theme:

### Logo Assets Location
- **Core Admin UI**: `apps/core/nova-core/public/`
- **Pulse Dashboard**: `apps/pulse/public/`

### Required Logo Files
- `logo.png` – Logo for light theme
- `logo-dark.png` – Logo for dark theme (automatically used when dark mode is enabled)

### Logo Loading Behavior
- Applications automatically detect the current theme setting
- Light theme displays `logo.png`
- Dark theme displays `logo-dark.png` 
- Fallback: If `logo-dark.png` is missing, `logo.png` is used for all themes
- Error fallback: If both logos fail to load, a default icon is displayed

### Customizing Logos
1. Replace the logo files in each app's `public/` directory
2. Keep the same filenames: `logo.png` and `logo-dark.png`
3. Recommended dimensions: 200x60px for optimal display
4. Ensure both light and dark variants are provided for the best user experience

The logo will be automatically updated in the application header and sidebar without requiring any configuration changes.

## Development

Before committing any changes, navigate into each package you modified and run:

```bash
npm run lint
npm test
```

For details on the workflow see [docs/development.md](docs/development.md).

## Security & Production Readiness

Nova Universe includes comprehensive security features:

- **Input Validation** – All API endpoints validate and sanitize user input
- **Rate Limiting** – Brute force protection on authentication endpoints
- **Security Headers** – CSP, XSS protection, and HTTPS enforcement
- **Password Security** – Strong password hashing with bcrypt (12 salt rounds)
- **Session Security** – Secure session management with httpOnly cookies
- **Kiosk Security** – Secure activation codes and registration tokens

See [docs/security.md](docs/security.md) for detailed security documentation.

## Future Improvements

Additional features planned for future releases:

- **Enhanced Authentication** – Multi-factor authentication support
- **Advanced Logging** – Detailed audit logs and monitoring
- **API Rate Limiting** – Per-user rate limiting for API endpoints
- **Database Encryption** – At-rest encryption for sensitive data

## License

See [LICENSE](LICENSE) file for details.
