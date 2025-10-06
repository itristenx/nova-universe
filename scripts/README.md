# Nova Universe Scripts Directory

This directory contains all utility scripts organized by purpose, following industry best practices.

## Directory Structure

```
scripts/
├── dev/                    # Development scripts
│   ├── dev.sh             # Start development environment
│   └── debug-auth.js      # Debug authentication issues
├── setup/                  # Setup and deployment scripts
│   ├── setup.sh           # Initial project setup
│   ├── setup-test-env.sh  # Set up test environment
│   └── teardown.sh        # Tear down services
├── validation/            # Validation and security scripts
│   ├── validate-security.sh
│   └── validate-tensorflow-implementation.sh
├── maintenance/           # Maintenance and cleanup scripts
│   ├── fix-catch-blocks.sh
│   └── fix-lint-issues.js
└── test/                  # Test utility scripts
    ├── test-bcrypt.js
    ├── test-email-templates.js
    ├── test-service-requests-production-ready.js
    ├── test-workflow-api.js
    └── verify-database-factory.js
```

## Quick Reference

### Development

```bash
# Start development environment (symlinked at root)
./dev.sh
# OR
./scripts/dev/dev.sh

# Debug authentication
node scripts/dev/debug-auth.js
```

### Setup & Deployment

```bash
# Initial setup (symlinked at root)
./setup.sh
# OR
./scripts/setup/setup.sh

# Set up test environment
./scripts/setup/setup-test-env.sh

# Tear down services
./scripts/setup/teardown.sh
```

### Validation

```bash
# Validate security configuration
./scripts/validation/validate-security.sh

# Validate TensorFlow implementation
./scripts/validation/validate-tensorflow-implementation.sh
```

### Maintenance

```bash
# Fix catch blocks
./scripts/maintenance/fix-catch-blocks.sh

# Fix linting issues
node scripts/maintenance/fix-lint-issues.js
```

### Testing

```bash
# Test bcrypt functionality
node scripts/test/test-bcrypt.js

# Test email templates
node scripts/test/test-email-templates.js

# Test service requests (production-ready)
node scripts/test/test-service-requests-production-ready.js

# Test workflow API
node scripts/test/test-workflow-api.js

# Verify database factory
node scripts/test/verify-database-factory.js
```

## Root Symlinks

For convenience, frequently used scripts have symlinks at the project root:

- `setup.sh` → `scripts/setup/setup.sh`
- `dev.sh` → `scripts/dev/dev.sh`

This maintains backward compatibility while keeping the repository organized.

## Adding New Scripts

When adding new scripts, place them in the appropriate subdirectory:

1. **Development tools** → `scripts/dev/`
2. **Setup/deployment** → `scripts/setup/`
3. **Validation/security** → `scripts/validation/`
4. **Maintenance/cleanup** → `scripts/maintenance/`
5. **Testing utilities** → `scripts/test/`

Make scripts executable:
```bash
chmod +x scripts/category/your-script.sh
```

## Best Practices

1. **Use descriptive names** - Script purpose should be clear from filename
2. **Include shebang** - Start with `#!/usr/bin/env bash` or `#!/usr/bin/env node`
3. **Add documentation** - Include usage comments at the top of each script
4. **Error handling** - Always check exit codes and handle errors
5. **Idempotency** - Scripts should be safe to run multiple times
6. **Logging** - Include clear output messages for debugging

## Migration from Root

Previously scattered scripts have been organized into this structure:

| Old Location (Root) | New Location |
|---------------------|--------------|
| `dev.sh` | `scripts/dev/dev.sh` (+ symlink) |
| `debug-auth.js` | `scripts/dev/debug-auth.js` |
| `setup.sh` | `scripts/setup/setup.sh` (+ symlink) |
| `setup-test-env.sh` | `scripts/setup/setup-test-env.sh` |
| `teardown.sh` | `scripts/setup/teardown.sh` |
| `validate-security.sh` | `scripts/validation/validate-security.sh` |
| `validate-tensorflow-implementation.sh` | `scripts/validation/validate-tensorflow-implementation.sh` |
| `fix-catch-blocks.sh` | `scripts/maintenance/fix-catch-blocks.sh` |
| `fix-lint-issues.js` | `scripts/maintenance/fix-lint-issues.js` |
| `test-*.js` | `scripts/test/test-*.js` |
| `verify-database-factory.js` | `scripts/test/verify-database-factory.js` |

---

**Last Updated**: October 5, 2025  
**Organization Standard**: Industry Best Practices 2024-2025
