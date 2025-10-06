# Nova Universe - Root Directory Guide

Following industry best practices (2024-2025), this document explains the root directory structure of Nova Universe.

## Root Directory Structure

```
nova-universe/
├── .git/                       # Git repository data
├── .github/                    # GitHub Actions and workflows
├── .husky/                     # Git hooks for code quality
├── apps/                       # Application code (API, UI)
├── assets/                     # Static assets (images, branding)
├── data/                       # Data files and fixtures
├── deploy/                     # Deployment configurations ⭐ NEW
├── docs/                       # Documentation
├── examples/                   # Example code and demos ⭐ NEW
├── monitoring/                 # Monitoring configurations
├── nginx/                      # Nginx configurations
├── node_modules/              # npm dependencies (gitignored)
├── packages/                   # Shared packages (monorepo)
├── postman/                    # Postman API collections
├── prisma/                     # Database schema and migrations
├── scripts/                    # Utility scripts (organized) ⭐ UPDATED
├── sdk/                        # SDK and client libraries
├── test/                       # Test files and fixtures
├── test-reports/              # Test coverage and reports
├── tools/                      # Development tools
├── Configuration Files         # See below
├── Symlinks                    # Convenience links
└── README.md                   # Main documentation
```

## Configuration Files (Root Level)

These files **should** remain at root per industry standards:

### Build & Package Management
- `package.json` - Node.js package configuration
- `package-lock.json` - npm dependency lock file
- `pnpm-workspace.yaml` - pnpm workspace configuration
- `pnpm-lock.yaml` - pnpm dependency lock file

### TypeScript Configuration
- `tsconfig.json` - Main TypeScript configuration
- `tsconfig.base.json` - Base TypeScript configuration for monorepo

### Testing Configuration
- `jest.config.js` - Jest test runner configuration
- `vitest.config.js` - Vitest test runner configuration

### Code Quality
- `eslint.config.js` - ESLint linting rules
- `babel.config.js` - Babel transpiler configuration
- `.prettierrc.json` - Prettier code formatting
- `.prettierignore` - Prettier ignore patterns
- `.lintstagedrc.cjs` - Lint-staged configuration

### Editor Configuration
- `.editorconfig` - Editor settings for consistency

### Docker
- `.dockerignore` - Docker build ignore patterns
- `docker-compose.yml` → `deploy/docker/development/docker-compose.yml` (symlink)

### Environment
- `.env` - Active development environment (gitignored)
- `.env.example` → `deploy/env/.env.example` (symlink)
- `.env.monitoring` - Active monitoring config (gitignored)
- `.env.production.secure` - Active production secrets (gitignored)
- `.env.test` - Active test config (gitignored)

### Version Control
- `.gitignore` - Git ignore patterns
- `.gitattributes` - Git file attributes

### Build Tools
- `Makefile` - Make build commands

### Documentation
- `README.md` - Main project documentation
- `LICENSE` - Project license

## Symlinks (Convenience)

For backward compatibility and convenience, the following symlinks exist at root:

| Symlink | Target | Purpose |
|---------|--------|---------|
| `docker-compose.yml` | `deploy/docker/development/docker-compose.yml` | Default Docker Compose |
| `.env.example` | `deploy/env/.env.example` | Environment template |
| `setup.sh` | `scripts/setup/setup.sh` | Quick setup |
| `dev.sh` | `scripts/dev/dev.sh` | Quick dev start |

## What's NOT at Root

Following industry standards, these have been moved to appropriate subdirectories:

### ❌ Demo/Example Files → `examples/`
- Demo HTML files
- Example scripts
- Sample applications

### ❌ Test Scripts → `scripts/test/`
- Unit test utilities
- Integration test helpers
- Verification scripts

### ❌ Setup Scripts → `scripts/setup/`
- Installation scripts
- Environment setup
- Teardown utilities

### ❌ Development Scripts → `scripts/dev/`
- Development tools
- Debug utilities

### ❌ Validation Scripts → `scripts/validation/`
- Security validation
- Implementation validation

### ❌ Maintenance Scripts → `scripts/maintenance/`
- Fix and cleanup scripts
- Migration utilities

### ❌ Docker Compose Files → `deploy/docker/`
- Environment-specific compose files
- Monitoring configurations

### ❌ Environment Templates → `deploy/env/`
- Environment variable templates
- Configuration examples

### ❌ Reports → `docs/reports/`
- Validation reports
- Analysis documents

## Directory Purposes

### Application Code (`apps/`)
Main application source code:
- `apps/api/` - Backend API server
- `apps/unified/` - Modern unified admin UI

### Shared Packages (`packages/`)
Reusable packages in monorepo:
- `packages/database/` - Database utilities
- `packages/integrations/` - Third-party integrations
- `packages/ai/` - AI and ML components

### Deployment (`deploy/`) ⭐ NEW
All deployment-related files organized by environment:
- `deploy/docker/` - Docker Compose files
- `deploy/env/` - Environment templates
- `deploy/README.md` - Deployment guide

### Scripts (`scripts/`) ⭐ ORGANIZED
Utility scripts categorized by purpose:
- `scripts/dev/` - Development tools
- `scripts/setup/` - Setup and deployment
- `scripts/validation/` - Validation scripts
- `scripts/maintenance/` - Maintenance utilities
- `scripts/test/` - Test utilities

### Examples (`examples/`) ⭐ NEW
Demo and example code:
- HTML demonstrations
- JavaScript examples
- Shell script demos

### Documentation (`docs/`)
All project documentation:
- `docs/guides/` - How-to guides
- `docs/api/` - API documentation
- `docs/reports/` - Analysis reports

## Industry Standards Compliance

This structure follows these industry best practices:

✅ **Clean Root Directory**
- Only essential config files at root
- No scattered scripts or demos
- Clear separation of concerns

✅ **Organized Subdirectories**
- Purpose-driven organization
- Easy to navigate
- Scalable structure

✅ **Deployment Separation**
- Centralized deployment configs
- Environment-specific organization
- Security best practices

✅ **Developer Experience**
- Symlinks for common commands
- Clear documentation
- Consistent patterns

✅ **Version Control**
- Proper .gitignore rules
- Template files tracked
- Secrets excluded

## Quick Start Commands

All commands work from root directory:

```bash
# Setup
./setup.sh                          # Initial setup (via symlink)

# Development
./dev.sh                            # Start development (via symlink)
docker-compose up -d                # Start services (via symlink)

# Deployment
docker-compose -f deploy/docker/production/docker-compose.yml up -d

# Testing
npm test                            # Run tests
node scripts/test/test-bcrypt.js   # Run specific test utility

# Maintenance
./scripts/maintenance/fix-lint-issues.js
```

## Migration Notes

If you're looking for files that were previously at root:

1. **Check `scripts/` subdirectories** - Most scripts moved here
2. **Check `examples/`** - Demo and example files moved here
3. **Check `deploy/`** - Docker and env files moved here
4. **Check `docs/reports/`** - Report files moved here

See specific README files in each directory for details.

## Additional Resources

- **Deployment Guide**: [`deploy/README.md`](deploy/README.md)
- **Scripts Guide**: [`scripts/README.md`](scripts/README.md)
- **Examples Guide**: [`examples/README.md`](examples/README.md)
- **Migration Guide**: [`deploy/MIGRATION.md`](deploy/MIGRATION.md)

---

**Last Updated**: October 5, 2025  
**Organization Standard**: Industry Best Practices 2024-2025  
**Status**: ✅ Fully Organized and Documented
