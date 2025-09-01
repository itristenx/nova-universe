# Nova Universe - GitHub Copilot Instructions

**Always follow these instructions first** and only search for additional information if these instructions are incomplete or found to be in error.

## Working Effectively

### Essential Setup Commands (Execute in Order)
```bash
# 1. Install Node.js 18+ (if not available)
curl -fsSL https://deb.nodesource.com/setup_18.x | bash -
apt-get install -y nodejs

# 2. Install pnpm (if not available) 
npm install -g pnpm

# 3. Install dependencies - NEVER CANCEL: takes ~30 seconds
pnpm install --no-frozen-lockfile

# 4. Generate Prisma clients - NEVER CANCEL: takes ~15 seconds  
pnpm run prisma:generate:all

# 5. Set up environment files
cp .env.example .env
./scripts/init-env.sh
```

**CRITICAL TIMING NOTES:**
- **Dependencies**: 24 seconds, set timeout to 60+ seconds
- **Prisma generation**: 8.4 seconds, set timeout to 30+ seconds  
- **Test environment setup**: 3-5 minutes, set timeout to 10+ minutes
- **Docker-based operations**: 2-10 minutes, set timeout to 15+ minutes
- **Linting**: 45 seconds, set timeout to 120+ seconds

### Quick Validation (Post-Setup)
```bash
# Verify basic functionality works
pnpm run test                    # Unit tests: <1 second
cd apps/api && npm run build     # API check: instant (no build needed)

# Check CLI tool availability (requires .env files)
cd apps/api && node cli.js --help
```

## Application Architecture

**Core Services:**
- **nova-api** - Express REST API backend (Node.js, no build step)
- **nova-core** - React/Vite admin interface (TypeScript, requires build)
- **nova-beacon** - iPad kiosk app (Swift/iOS, no npm build)
- **nova-comms** - Slack integration service (Node.js)
- **nova-sentinel** - Uptime monitoring (Node.js)
- **orbit** - Next.js PWA application
- **pulse** - Vite dashboard application

**Package Structure:**
- Monorepo using pnpm workspaces
- Shared packages in `packages/` (ui, theme, design-tokens)
- Prisma schemas in `prisma/` with multiple databases

## Development Commands

### Starting Services
```bash
# Option 1: Full setup with monitoring (NEVER CANCEL: 5-10 minutes)
./setup.sh

# Option 2: API only (faster for development)
cd apps/api
node index.js  # Starts on port 3000

# Option 3: Core UI development  
cd apps/core/nova-core
npm run dev    # Starts on port 5173
```

### Testing
```bash
# Quick smoke tests (30 seconds)
pnpm run test:smoke

# Full test suite (NEVER CANCEL: 2-5 minutes depending on environment)
pnpm run test:ci

# Create test environment (NEVER CANCEL: 3-5 minutes)
./setup-test-env.sh integration

# Test environment options:
./setup-test-env.sh test         # Basic test env
./setup-test-env.sh integration  # Integration testing
./setup-test-env.sh e2e          # End-to-end testing
```

### CLI Management
```bash
cd apps/api

# Service management
node cli.js start    # Start all services
node cli.js stop     # Stop all services  
node cli.js status   # Show service URLs
node cli.js health   # System health check

# User management
node cli.js passwd newpassword123  # Change admin password
node cli.js users    # List admin users

# System operations  
node cli.js reset    # Reset to clean state
```

### Build Operations
```bash
# API - No build required
cd apps/api && npm run build  # Instant (just prints message)

# Core UI - Currently has dependency issues
cd apps/core/nova-core && npm run build  # FAILS: missing framer-motion

# Orbit (Next.js) - Works but has TypeScript errors  
cd apps/orbit && npm run build  # ~20 seconds when working

# Prisma clients regeneration
pnpm run prisma:generate:all  # 8.4 seconds

# Linting (has many issues currently)
pnpm run lint  # 45 seconds, expect errors
```

## Manual Validation Scenarios

### After Fresh Clone Setup
1. **Verify dependencies installed**: `ls node_modules/ | wc -l` should show 1000+ packages
2. **Check Prisma generation**: `ls prisma/generated/` should show multiple client folders
3. **Test unit tests**: `pnpm run test` should complete in <1 second with passing tests
4. **Verify CLI access**: `cd apps/api && node cli.js --help` (may fail if .env missing)

### API Functionality Testing
```bash
# 1. Start API (requires environment setup)
cd apps/api && node index.js

# 2. Test health endpoint (once running)
curl http://localhost:3000/health

# 3. Test API documentation (once running)
curl http://localhost:3000/docs
```

### Admin Interface Testing
```bash
# 1. Start development server
cd apps/core/nova-core && npm run dev

# 2. Access interface at http://localhost:5173
# 3. Default login: admin@example.com / admin
# 4. Test basic navigation and functionality
```

### Full System Integration
```bash
# 1. Use comprehensive setup (NEVER CANCEL: 5-10 minutes)
./setup.sh

# 2. Verify service URLs:
# - Core Admin UI: http://localhost:3001  
# - API Documentation: http://localhost:3000/docs
# - Sentinel Monitor: http://localhost:3002
# - GoAlert Dashboard: http://localhost:8081

# 3. Test login with default credentials:
# - Email: admin@example.com
# - Password: admin
```

## Known Issues & Troubleshooting

### Build Failures
**Core UI build fails** with missing dependencies:
- `framer-motion` not in package.json but imported in components
- `@nova-universe/ui` workspace package has build issues
- Solution: Use API development or fix dependencies first

**TailwindCSS v4 configuration issues**:
- Multiple apps fail with PostCSS plugin errors
- Affects: nova-pulse, possibly others
- Solution: Configure `@tailwindcss/postcss` plugin

### Environment Issues
**CLI fails with missing environment variables**:
- Requires: SESSION_SECRET, JWT_SECRET, KIOSK_TOKEN, SCIM_TOKEN, DB config
- Solution: Copy and customize .env files before running CLI

**Database connection failures**:
- PostgreSQL required for full functionality
- Solution: Use Docker setup or configure local PostgreSQL 15+

### Test Environment Issues
**Test setup takes long time**:
- Docker container pulls and database setup
- Normal: 3-5 minutes for integration environment
- Solution: Be patient, use longer timeouts

### Linting Issues
**Current linting state**:
- Repository has 9,880+ linting errors currently
- Linting process takes 45 seconds to complete
- Common issues: unused variables, ES module problems, TypeScript errors
- Solution: Fix linting incrementally as you make changes, don't expect clean lint initially

## Quick Reference

### Essential File Locations
- **Main setup**: `./setup.sh`
- **Test environments**: `./setup-test-env.sh`  
- **API CLI**: `apps/api/cli.js`
- **Environment examples**: `.env.example`
- **Docker configs**: `docker-compose.yml`, `docker-compose.monitoring.yml`

### Service URLs (After Full Setup)
- Core Admin: `http://localhost:3001`
- API Docs: `http://localhost:3000/docs`
- API Health: `http://localhost:3000/health`
- Sentinel: `http://localhost:3002`
- GoAlert: `http://localhost:8081`

### Important Timing Expectations
- **Never cancel operations** that take <10 minutes
- **Package installation**: 24 seconds (normal)
- **Prisma generation**: 8.4 seconds (normal)
- **Test environment setup**: 3-5 minutes (normal)
- **Full system setup**: 5-10 minutes (normal)
- **Unit tests**: <1 second (very fast)
- **Integration tests**: 30 seconds - 2 minutes
- **Linting**: 45 seconds (many current issues)

### Default Credentials
- **Email**: `admin@example.com`  
- **Password**: `admin`
- **CHANGE IMMEDIATELY** after first login

## Validation Checklist

**Before making changes:**
- [ ] Run `pnpm install` (30s timeout)
- [ ] Run `pnpm run prisma:generate:all` (30s timeout)
- [ ] Run `pnpm run test` to verify unit tests pass
- [ ] Verify you can access `cd apps/api && node cli.js --help`

**After making changes:**
- [ ] Run `pnpm run test` to verify no regressions
- [ ] Run `pnpm run test:smoke` if API changes (30s timeout)
- [ ] Test affected service manually (start and verify endpoints)
- [ ] Run `pnpm run lint` if available in modified workspace (45s timeout, expect errors)

**For production readiness:**
- [ ] Run `./validate-production-readiness.sh`
- [ ] Test complete setup from fresh clone with `./setup.sh` (10min timeout)
- [ ] Verify all service URLs accessible after setup
- [ ] Test admin login with default credentials
- [ ] Change default admin password

---

**Remember**: This is a complex enterprise platform. Take time for operations to complete. Most "hanging" operations are actually working - Docker pulls, database setup, and Prisma generation can take several minutes.