# Developer Guide

## Code Style

- Use modern JavaScript with ES modules
- Indent files with two spaces
- Keep components and functions short and clearly named
- Share design tokens from `design/theme.js` when styling frontends

## Getting Started

1. Clone the repository
2. Run `./scripts/setup.sh` to install dependencies
3. Copy `.env.local.example` to `.env.local`
4. Run `./scripts/init-env.sh` to create environment files
5. Edit the `.env` files as needed

## Testing

- Run `./setup.sh` to install Node.js, SQLite and all project dependencies if needed
- Each package has its own test suite
- Navigate to a package and run `pnpm test` or run `pnpm --filter <workspace> test` from the repository root
- Run `pnpm run lint` before committing changes
- Installer and upgrade scripts live in `installers/` and must include basic tests

## Linting

- Run the linter before committing changes: `npm run lint` inside each package that defines the script
- This also applies to any JavaScript tests added for installer-related packages

## Project Structure

- `nova-api/` - Express backend with SQLite
- `nova-admin/` - React admin interface
- `nova-kiosk/` - iPad SwiftUI app
- `nova-slack/` - Slack integration
- `nova-macos-swift/` - macOS launcher
- `docs/` - Documentation
- `installers/` - Build scripts

## Repository Guidelines

- Do not commit `node_modules`, build outputs, or OS files
- Do not commit operating system files (such as `.DS_Store`)
- Test installer scripts thoroughly
- Update documentation when adding features
