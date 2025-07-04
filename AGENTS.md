# Contributor Guidelines

## Code Style
- Use modern JavaScript with ES modules.
- Indent files with two spaces.
- Keep components and functions short and clearly named.
- Share design tokens from `design/theme.js` when styling frontends.

## Testing
- Run `./setup.sh` to install Node.js, SQLite and all project dependencies if needed.
- Each package contains its own test suite. Navigate to the package, run `npm install` (or `npm ci`) and then execute `npm test`.

## Linting
- Run the linter before committing changes: `npm run lint` inside each package that defines the script.

## Repository Hygiene
- Do not commit `node_modules`, build outputs or operating system files (such as `.DS_Store`).
