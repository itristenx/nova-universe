# Backend Startup Issues - Troubleshooting Guide

## 🚨 Current Status

**Backend**: ❌ Not Running
**Frontend**: ✅ Ready to Test RBAC
**Blocker**: Multiple backend initialization errors

---

## 🔍 Issues Identified

### 1. Port Conflicts (Critical)

**Port 3000**: Occupied by Next.js (PID 27103)
```bash
$ lsof -ti:3000
27103

$ ps -p 27103 -o command=
next-server (v15.5.4)
```

**Port 3001**: Also in use when attempted
```
Error: listen EADDRINUSE: address already in use :::3001
```

**Solution Options**:

**Option A: Kill Next.js, Use Port 3000** (Fastest)
```bash
# Kill Next.js
kill 27103

# Start backend on port 3000
cd /Users/tneibarger/nova-universe/apps/api
pnpm dev
```

**Option B: Move Backend to Port 3002** (Safer)
```bash
# Start backend on different port
cd /Users/tneibarger/nova-universe/apps/api
NODE_ENV=development \
SESSION_SECRET=dev \
JWT_SECRET=dev \
API_PORT=3002 \
CORS_ORIGINS=http://localhost:5173,http://localhost:3002 \
KIOSK_TOKEN=dev_kiosk \
SCIM_TOKEN=dev_scim \
POSTGRES_PASSWORD=nova_password \
POSTGRES_USER=nova_admin \
POSTGRES_DB=nova_universe \
POSTGRES_HOST=localhost \
node index.js

# Update frontend .env.local
# VITE_API_URL=http://localhost:3002
# VITE_API_BASE_URL=http://localhost:3002
# VITE_WS_URL=ws://localhost:3002
```

**Option C: Check What's on 3001**
```bash
# See what's using port 3001
lsof -ti:3001 | xargs ps -p

# Kill if not needed
lsof -ti:3001 | xargs kill
```

---

### 2. Prisma Client Missing (Critical)

**Error**:
```
Error [ERR_MODULE_NOT_FOUND]: Cannot find module 
'/Users/tneibarger/nova-universe/prisma/generated/core/index.js'
```

**Multiple Missing Clients**:
- `/prisma/generated/core/index.js`
- `/prisma/generated/user360/index.js`

**Solution**:
```bash
cd /Users/tneibarger/nova-universe

# Generate all Prisma clients
pnpm prisma:generate

# If that fails, try manually
pnpm prisma generate --schema=prisma/schema.prisma
pnpm prisma generate --schema=prisma/user360/schema.prisma
pnpm prisma generate --schema=prisma/core/schema.prisma
```

**Expected Output**:
```
✔ Generated Prisma Client to ./node_modules/@prisma/client
✔ Generated User360 Client to ./prisma/generated/user360
✔ Generated Core Client to ./prisma/generated/core
```

---

### 3. Database Function Errors (High Priority)

**Errors**:
```
TypeError: Cannot read properties of undefined (reading 'deleteMany')
TypeError: db.ensureReady is not a function
TypeError: db.run is not a function
```

**Likely Causes**:
1. Prisma clients not generated (see #2 above)
2. Database not initialized
3. Schema migrations not run

**Solution**:
```bash
cd /Users/tneibarger/nova-universe

# Check if PostgreSQL is running
psql -U nova_admin -d nova_universe -c "SELECT 1;"

# If database doesn't exist, create it
createdb -U nova_admin nova_universe

# Run migrations
pnpm prisma migrate deploy

# Or reset database (WARNING: deletes all data)
pnpm prisma migrate reset --force
pnpm prisma db push
```

---

### 4. ElasticSearch Initialization (Medium Priority)

**Error**:
```
TypeError: elasticManager.initialize is not a function
```

**Solution**:
This is non-critical for basic API functionality. Can be disabled:

```bash
# Add to environment or .env
ENABLE_ELASTICSEARCH=false
```

Or check if ElasticSearch is running:
```bash
# Check ElasticSearch status
curl http://localhost:9200

# Start if not running (macOS with Homebrew)
brew services start elasticsearch
```

---

### 5. Slack Integration Error (Low Priority)

**Error**:
```
Error: An API error occurred: invalid_auth
```

**Solution**:
This is non-critical for RBAC testing. Slack integration can be disabled or fixed later:

```bash
# Disable Slack integration
ENABLE_SLACK=false

# Or provide valid token
SLACK_BOT_TOKEN=your-valid-token
SLACK_SIGNING_SECRET=your-signing-secret
```

---

## 🛠️ Recommended Fix Sequence

### Step 1: Fix Port Conflict (2 min)
```bash
# Option 1: Kill Next.js
kill 27103

# Option 2: Use port 3002
# (Update frontend .env.local to match)
```

### Step 2: Generate Prisma Clients (3 min)
```bash
cd /Users/tneibarger/nova-universe
pnpm prisma:generate
```

### Step 3: Verify Database (2 min)
```bash
# Check PostgreSQL connection
psql -U nova_admin -d nova_universe -c "SELECT COUNT(*) FROM \"User\";"

# If errors, run migrations
pnpm prisma migrate deploy
```

### Step 4: Disable Non-Critical Services (1 min)
Create `/Users/tneibarger/nova-universe/apps/api/.env`:
```bash
# Disable optional services
ENABLE_ELASTICSEARCH=false
ENABLE_SLACK=false
ENABLE_AI_COMPONENTS=false
```

### Step 5: Start Backend (1 min)
```bash
cd /Users/tneibarger/nova-universe/apps/api

# Use pnpm dev (port 3000 - if available)
pnpm dev

# Or manual start (port 3002)
NODE_ENV=development \
API_PORT=3002 \
SESSION_SECRET=dev \
JWT_SECRET=dev \
CORS_ORIGINS=http://localhost:5173,http://localhost:3002 \
node index.js
```

### Step 6: Verify API Running (1 min)
```bash
# Check API health
curl http://localhost:3000/api/v1/health
# or
curl http://localhost:3002/api/v1/health

# Expected response:
# {"status":"ok","timestamp":"2025-10-09T..."}
```

### Step 7: Start Frontend (1 min)
```bash
cd /Users/tneibarger/nova-universe
pnpm --filter @nova-universe/unified dev

# Frontend should start on http://localhost:5173
```

### Step 8: Test RBAC (15 min)
Follow the testing guide in `RBAC-IMPLEMENTATION-COMPLETE.md`

---

## 🧪 Quick Health Check

After starting backend, verify these endpoints:

```bash
# Health check
curl http://localhost:3000/api/v1/health

# Auth endpoint
curl http://localhost:3000/api/v1/auth/status

# Test login
curl -X POST http://localhost:3000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@nova-universe.com","password":"Admin123!"}'

# Expected: JWT token in response
```

---

## 📋 Diagnostic Commands

### Check All Ports
```bash
# See what's using ports 3000-3010
lsof -ti:3000,3001,3002,3003,3004,3005 | xargs ps -fp
```

### Check PostgreSQL
```bash
# Is PostgreSQL running?
pg_isready -U nova_admin -d nova_universe

# List databases
psql -U nova_admin -l

# Connect and check tables
psql -U nova_admin -d nova_universe
\dt
\q
```

### Check Prisma Status
```bash
cd /Users/tneibarger/nova-universe

# Check generated clients exist
ls -la prisma/generated/core/
ls -la prisma/generated/user360/

# Check schema status
pnpm prisma migrate status
```

### Check Node Processes
```bash
# All node processes
ps aux | grep node

# Kill all node processes (CAUTION)
killall node
```

---

## ✅ Success Criteria

Backend is ready when:
- [ ] `curl http://localhost:XXXX/api/v1/health` returns `{"status":"ok"}`
- [ ] No "ERR_MODULE_NOT_FOUND" errors in logs
- [ ] No "EADDRINUSE" port errors
- [ ] No "Cannot read properties of undefined" errors
- [ ] Login endpoint returns JWT token
- [ ] No Prisma client errors in logs

Frontend is ready when:
- [x] Vite dev server starts on port 5173
- [x] All TypeScript compiles (already verified ✅)
- [x] RBAC pages load without errors
- [ ] API calls connect to backend successfully

---

## 🎯 Quick Fix Script

Create this file: `/Users/tneibarger/nova-universe/fix-backend.sh`

```bash
#!/bin/bash

echo "🔧 Fixing Nova Universe Backend..."

# Step 1: Kill conflicting processes
echo "Step 1: Checking ports..."
PORT_3000=$(lsof -ti:3000)
if [ ! -z "$PORT_3000" ]; then
  echo "Killing process on port 3000: $PORT_3000"
  kill $PORT_3000
fi

# Step 2: Generate Prisma clients
echo "Step 2: Generating Prisma clients..."
cd /Users/tneibarger/nova-universe
pnpm prisma:generate

# Step 3: Check database
echo "Step 3: Checking database..."
psql -U nova_admin -d nova_universe -c "SELECT 1;" > /dev/null 2>&1
if [ $? -ne 0 ]; then
  echo "⚠️  Database not accessible. Run:"
  echo "   createdb -U nova_admin nova_universe"
  echo "   pnpm prisma migrate deploy"
  exit 1
fi

# Step 4: Start backend
echo "Step 4: Starting backend API..."
cd /Users/tneibarger/nova-universe/apps/api
pnpm dev &
API_PID=$!
echo "Backend started with PID: $API_PID"

# Step 5: Wait and check
echo "Waiting 5 seconds for API to start..."
sleep 5

# Step 6: Verify
echo "Step 6: Verifying API..."
curl -s http://localhost:3000/api/v1/health | grep "ok" > /dev/null
if [ $? -eq 0 ]; then
  echo "✅ Backend API is healthy!"
  echo "   URL: http://localhost:3000"
  echo "   Docs: http://localhost:3000/api-docs"
else
  echo "❌ Backend API health check failed"
  echo "   Check logs above for errors"
fi

echo ""
echo "📝 Next steps:"
echo "1. Start frontend: pnpm --filter @nova-universe/unified dev"
echo "2. Open http://localhost:5173"
echo "3. Test RBAC with different roles"
```

Make it executable:
```bash
chmod +x /Users/tneibarger/nova-universe/fix-backend.sh
```

Run it:
```bash
/Users/tneibarger/nova-universe/fix-backend.sh
```

---

## 📞 When to Ask for Help

If after following this guide you still see:
1. **Prisma errors** → Check schema files exist, run `pnpm prisma validate`
2. **Database errors** → Verify PostgreSQL is running, credentials are correct
3. **Port errors** → Use different port (3002, 3003, etc.)
4. **Unknown errors** → Share full error logs from backend startup

---

## 🎉 Once Backend is Fixed

Follow the testing guide in `RBAC-IMPLEMENTATION-COMPLETE.md`:
1. Test as Admin - verify all features work
2. Test as Approver - verify limited access
3. Test as Workflow Admin - verify workflow access only
4. Test as Regular User - verify read-only access
5. Verify ReadOnlyBadge appears correctly
6. Verify tooltips are helpful
7. Verify no console errors

**Estimated Testing Time**: 15-20 minutes

---

**Current Status**: ⚠️ Backend blocked by port conflicts and Prisma client issues

**Next Action**: Follow "Recommended Fix Sequence" above

**Time to Fix**: ~10 minutes (if no database issues)
