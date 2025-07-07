# Developer Guide

## Code Style
- Use modern JavaScript with ES modules
- Indent files with two spaces
- Keep components and functions short and clearly named
- Share design tokens from `design/theme.js` when styling frontends

## Getting Started
1. Clone the repository
2. Run `./installers/setup.sh` to install dependencies
3. Copy `.env.local.example` to `.env.local`
4. Run `./scripts/init-env.sh` to create environment files
5. Edit the `.env` files as needed

## Testing
- Each package has its own test suite
- Navigate to a package and run `npm test`
- Run `npm run lint` before committing changes

## Project Structure
- `cueit-api/` - Express backend with SQLite
- `cueit-admin/` - React admin interface  
- `cueit-kiosk/` - iPad SwiftUI app
- `cueit-slack/` - Slack integration
- `cueit-macos-swift/` - macOS launcher
- `docs/` - Documentation
- `installers/` - Build scripts

## Repository Guidelines
- Do not commit `node_modules`, build outputs, or OS files
- Test installer scripts thoroughly
- Update documentation when adding features
