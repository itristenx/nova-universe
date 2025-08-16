# Nova Universe CLI

A modern, feature-rich command-line interface for managing the Nova Universe platform.

## Overview

The Nova CLI provides a comprehensive set of tools for developers and administrators to manage Nova Universe installations, including service management, user administration, configuration management, health monitoring, and more.

## Features

✨ **Modern Design**

- Beautiful ASCII art branding
- Colored output with intuitive icons
- Interactive prompts and wizards
- Progress indicators and spinners

🚀 **Comprehensive Commands**

- **Setup**: Interactive platform initialization
- **Service Management**: Start, stop, restart, and monitor services
- **User Management**: Create, update, delete, and manage users
- **Configuration**: Environment management and validation
- **Backup & Restore**: Database and file system backups
- **Development Tools**: Dev environment, testing, and debugging
- **Health Monitoring**: System diagnostics and monitoring
- **Log Management**: Advanced log viewing and analysis
- **Dashboard**: Web-based monitoring interface

🛠 **Developer Experience**

- Tab completion support
- Contextual help for all commands
- Error handling with helpful messages
- Debug mode for troubleshooting

## Installation

The CLI is included with the Nova Universe API package:

```bash
cd nova-api
npm install
```

## Usage

### Basic Commands

```bash
# Show help
npm run nova -- --help

# Interactive setup wizard
npm run nova -- setup

# Start all services
npm run nova -- service start

# Check system health
npm run nova -- health check

# Create a backup
npm run nova -- backup create --all
```

### Service Management

```bash
# Start services
npm run nova -- service start

# Stop services
npm run nova -- service stop

# Check service status
npm run nova -- service status

# View service logs
npm run nova -- service logs
```

### User Management

```bash
# Create a new user
npm run nova -- user create

# List all users
npm run nova -- user list

# Update user password
npm run nova -- user password <email>

# Delete a user
npm run nova -- user delete <email>
```

### Configuration Management

```bash
# View configuration
npm run nova -- config list

# Get specific value
npm run nova -- config get DATABASE_URL

# Set configuration value
npm run nova -- config set DATABASE_URL "postgresql://..."

# Validate configuration
npm run nova -- config validate
```

### Development Tools

```bash
# Start development environment
npm run nova -- dev start

# Run tests
npm run nova -- dev test

# Lint code
npm run nova -- dev lint

# Build project
npm run nova -- dev build
```

### Health Monitoring

```bash
# Quick health check
npm run nova -- health check

# Detailed system information
npm run nova -- health system

# Continuous monitoring
npm run nova -- health monitor

# Run diagnostics
npm run nova -- health diagnose
```

### Log Management

```bash
# View API logs
npm run nova -- logs view api

# Follow logs in real-time
npm run nova -- logs view api --follow

# Search logs
npm run nova -- logs search "error"

# Export logs
npm run nova -- logs export --format json
```

### Backup & Restore

```bash
# Create full backup
npm run nova -- backup create --all

# Create database backup only
npm run nova -- backup create --database

# List backups
npm run nova -- backup list

# Restore from backup
npm run nova -- backup restore <backup-id>
```

### Web Dashboard

```bash
# Start monitoring dashboard
npm run nova -- dashboard start

# Open dashboard in browser
npm run nova -- dashboard open
```

## Configuration

The CLI stores its configuration in:

- **macOS/Linux**: `~/.config/nova-cli/config.json`
- **Windows**: `%APPDATA%/nova-cli/config.json`

Default configuration:

```json
{
  "apiUrl": "http://localhost:3000",
  "adminUrl": "http://localhost:5173",
  "environment": "development",
  "autoStart": false,
  "theme": "default"
}
```

## Environment Variables

- `NOVA_QUIET`: Suppress informational output
- `DEBUG`: Enable debug output
- `NOVA_CONFIG_PATH`: Custom config file path

## Architecture

The CLI is built with modern Node.js and follows best practices:

- **Commander.js**: Command-line framework
- **Inquirer.js**: Interactive prompts
- **Chalk**: Terminal colors
- **Ora**: Loading spinners
- **Listr2**: Task runners
- **Figlet**: ASCII art
- **ES Modules**: Modern JavaScript

### Command Structure

```
cli/
├── index.js          # Main CLI entry point
├── commands/         # Individual command modules
│   ├── setup.js     # Setup wizard
│   ├── service.js   # Service management
│   ├── user.js      # User management
│   ├── config.js    # Configuration
│   ├── backup.js    # Backup operations
│   ├── dev.js       # Development tools
│   ├── health.js    # Health monitoring
│   ├── logs.js      # Log management
│   └── dashboard.js # Web dashboard
└── utils/
    └── index.js      # Shared utilities
```

## Contributing

1. Add new commands in the `commands/` directory
2. Export the command as a Commander.js Command object
3. Update the main CLI to import your command
4. Add documentation and tests

## Troubleshooting

### Common Issues

**CLI not responding**

```bash
# Check if all dependencies are installed
npm install

# Run with debug output
DEBUG=* npm run nova -- --help
```

**Permission errors**

```bash
# Make CLI executable
chmod +x cli/index.js
```

**Module import errors**

```bash
# Verify ES modules are enabled
# Check package.json has "type": "module"
```

## Support

- **Documentation**: https://github.com/nova-universe/nova-universe
- **Issues**: https://github.com/nova-universe/nova-universe/issues
- **Community**: [Discord/Slack channel]

---

_Built with ❤️ for the Nova Universe platform_
