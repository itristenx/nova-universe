# CueIT

An internal help desk application for submitting and tracking IT tickets.

## Quick Start

```bash
git clone https://github.com/your-org/CueIT.git
cd CueIT
./installers/setup.sh
./scripts/init-env.sh
./installers/start-all.sh
```

Open http://localhost:5173 to access the admin interface.

**Default login:** admin@example.com / admin

## Components

- **cueit-api** – Express backend with SQLite database
- **cueit-admin** – React admin interface  
- **cueit-kiosk** – iPad kiosk app for ticket submission
- **cueit-slack** – Slack integration
- **cueit-macos-swift** – macOS launcher

## Documentation

- [📖 Full Documentation](docs/README.md)
- [🚀 Quick Start Guide](docs/quickstart.md)
- [🔒 Security & Production](docs/security.md)
- [🔧 Development Guide](docs/development.md)

## Requirements

- Node.js 18+
- SQLite3
- Xcode (for iPad kiosk)

## License

MIT License - see [LICENSE](LICENSE) for details.

