# Docker & Environment Files Migration Guide

## What Changed?

Following industry best practices (2024-2025), all Docker and environment configuration files have been reorganized into a dedicated `deploy/` directory structure.

### Before (Old Structure)
```
nova-universe/
├── docker-compose.yml
├── docker-compose.prod.yml
├── docker-compose.monitoring.yml
├── docker-compose.override.yml
├── docker-compose.production-test.yml
├── env.template
├── env.production.template
├── env.production-test
├── .env.example
├── .env.production.template
├── .env.monitoring.template
├── .env.ai-fabric
├── .env.test
├── .env.test.integration
├── .env.uat.example
├── .env.prisma-test
└── ... (many more scattered files)
```

### After (New Structure)
```
nova-universe/
├── docker-compose.yml -> deploy/docker/development/docker-compose.yml (symlink)
├── .env.example -> deploy/env/.env.example (symlink)
├── .env (your actual environment - not tracked)
├── .env.monitoring (active config - not tracked)
├── .env.production.secure (active config - not tracked)
├── .env.test (active config - not tracked)
└── deploy/
    ├── README.md (comprehensive deployment guide)
    ├── docker/
    │   ├── development/
    │   │   ├── docker-compose.yml
    │   │   └── docker-compose.override.yml
    │   ├── production/
    │   │   └── docker-compose.yml
    │   ├── testing/
    │   │   └── docker-compose.yml
    │   └── monitoring/
    │       └── docker-compose.yml
    └── env/
        ├── .env.example (development template)
        ├── .env.production.template (production template)
        ├── .env.production-test (testing template)
        ├── .env.monitoring.template (monitoring template)
        ├── .env.test (test environment)
        ├── .env.test.integration (integration tests)
        ├── .env.uat.example (UAT template)
        ├── .env.prisma-test (Prisma testing)
        └── special/
            └── .env.ai-fabric (AI Fabric config)
```

## Benefits of New Structure

1. **Industry Standard Compliance**: Follows Docker and containerization best practices from 2024-2025
2. **Clear Separation**: Development, production, testing, and monitoring configs are clearly separated
3. **Better Organization**: All deployment files in one place
4. **Easier Maintenance**: Simpler to find and update configuration files
5. **Version Control Friendly**: Template files tracked, secrets excluded
6. **Backward Compatible**: Symlinks maintain existing workflows

## Migration Steps

### For Developers

If you were using `docker-compose up`, **nothing changes**:
```bash
docker-compose up -d
```

The symlink at the root ensures backward compatibility.

### For CI/CD Pipelines

Update your pipeline scripts to reference the new locations:

**Before:**
```bash
docker-compose -f docker-compose.prod.yml up -d
```

**After:**
```bash
docker-compose -f deploy/docker/production/docker-compose.yml up -d
```

### For Environment Setup

**Before:**
```bash
cp .env.example .env
```

**After (still works):**
```bash
cp .env.example .env
# OR explicitly
cp deploy/env/.env.example .env
```

## Updated Commands

### Development

```bash
# Start development environment
docker-compose up -d

# Or explicitly
docker-compose -f deploy/docker/development/docker-compose.yml up -d

# With profiles
docker-compose --profile full up -d
```

### Production

```bash
# Start production stack
docker-compose -f deploy/docker/production/docker-compose.yml up -d

# With custom env file
docker-compose -f deploy/docker/production/docker-compose.yml --env-file .env.production up -d
```

### Testing

```bash
# Start production-test environment
docker-compose -f deploy/docker/testing/docker-compose.yml up -d
```

### Monitoring

```bash
# Start monitoring stack
docker-compose -f deploy/docker/monitoring/docker-compose.yml up -d
```

## Environment File Locations

| Purpose | Old Location | New Location |
|---------|-------------|--------------|
| Development template | `.env.example` | `deploy/env/.env.example` (symlinked) |
| Production template | `env.production.template` | `deploy/env/.env.production.template` |
| Testing template | `env.production-test` | `deploy/env/.env.production-test` |
| Monitoring template | `.env.monitoring.template` | `deploy/env/.env.monitoring.template` |
| Test config | `.env.test` | `deploy/env/.env.test` |
| Integration test | `.env.test.integration` | `deploy/env/.env.test.integration` |
| UAT template | `.env.uat.example` | `deploy/env/.env.uat.example` |
| Prisma test | `.env.prisma-test` | `deploy/env/.env.prisma-test` |
| AI Fabric | `.env.ai-fabric` | `deploy/env/special/.env.ai-fabric` |

## Breaking Changes

### ⚠️ Important: Check These

1. **CI/CD Scripts**: Update any hardcoded paths to docker-compose files
2. **Deployment Scripts**: Update paths in `setup.sh`, `teardown.sh`, etc.
3. **Documentation**: Update any docs that reference old file locations
4. **Makefiles**: Update Docker-related targets

### Files Removed from Root

The following files have been removed from the root directory:
- `docker-compose.prod.yml` → `deploy/docker/production/docker-compose.yml`
- `docker-compose.monitoring.yml` → `deploy/docker/monitoring/docker-compose.yml`
- `docker-compose.override.yml` → `deploy/docker/development/docker-compose.override.yml`
- `docker-compose.production-test.yml` → `deploy/docker/testing/docker-compose.yml`
- `env.template` → `deploy/env/.env.example`
- `env.production.template` → `deploy/env/.env.production.template`
- `env.production-test` → `deploy/env/.env.production-test`
- `.env.production.template` → `deploy/env/.env.production.template`
- `.env.monitoring.template` → `deploy/env/.env.monitoring.template`
- `.env.ai-fabric` → `deploy/env/special/.env.ai-fabric`
- `.env.test.integration` → `deploy/env/.env.test.integration`
- `.env.uat.example` → `deploy/env/.env.uat.example`
- `.env.prisma-test` → `deploy/env/.env.prisma-test`

### Files Kept at Root (Active Configs)

These files remain at root because they're actively used:
- `.env` - Your active development environment (not in git)
- `.env.monitoring` - Active monitoring config (not in git)
- `.env.production.secure` - Active production secrets (not in git)
- `.env.test` - Active test config (not in git, also copied to deploy/env/)

## Validation

### Check Docker Compose Files

```bash
# Validate development config
docker-compose -f deploy/docker/development/docker-compose.yml config > /dev/null && echo "✓ Development config valid"

# Validate production config
docker-compose -f deploy/docker/production/docker-compose.yml config > /dev/null && echo "✓ Production config valid"

# Validate monitoring config
docker-compose -f deploy/docker/monitoring/docker-compose.yml config > /dev/null && echo "✓ Monitoring config valid"

# Validate testing config
docker-compose -f deploy/docker/testing/docker-compose.yml config > /dev/null && echo "✓ Testing config valid"
```

### Test Symlinks

```bash
# Check symlinks work
ls -la docker-compose.yml
ls -la .env.example

# Test default compose still works
docker-compose config > /dev/null && echo "✓ Root compose symlink works"
```

## Rollback (If Needed)

If you encounter issues, the old files are still in git history:

```bash
# View old structure
git log --all --full-history --oneline -- docker-compose.prod.yml

# Restore a specific file (example)
git checkout HEAD~1 -- docker-compose.prod.yml
```

## Next Steps

1. ✅ Review the new structure in `deploy/`
2. ✅ Read the comprehensive guide: `deploy/README.md`
3. ✅ Update any custom scripts or CI/CD pipelines
4. ✅ Test your deployment workflow
5. ✅ Update team documentation

## Questions?

- Check `deploy/README.md` for detailed usage guide
- Review Docker best practices: https://docs.docker.com/develop/dev-best-practices/
- Consult the team leads for deployment-specific questions

---

**Migration Date**: October 5, 2025  
**Migration Author**: DevOps Team  
**Standards**: Docker 2024-2025 Best Practices
