# Quick Action Plan - Resolve Port Conflict

**Issue**: Port 3000 is occupied by Next.js server, but backend API needs it  
**Impact**: Frontend cannot connect to backend API  
**Priority**: 🔴 **CRITICAL**  
**Time to Fix**: 5 minutes

---

## Current Situation

```bash
# Port 3000 is occupied by Next.js
$ lsof -i :3000
COMMAND   PID       USER   FD   TYPE   DEVICE SIZE/OFF NODE NAME
node    27103 tneibarger   17u  IPv6   ...      0t0  TCP *:hbci (LISTEN)

# Process 27103 is Next.js
$ ps aux | grep 27103
tneibarger  27103  ...  next-server (v15.5.4)
```

---

## Solution Options

### Option 1: Move Backend to Port 3001 (RECOMMENDED - 2 minutes)

**Steps**:

1. **Update frontend environment** (`apps/unified/.env.local`):
   ```bash
   # Change from:
   VITE_API_URL=http://localhost:3000
   
   # To:
   VITE_API_URL=http://localhost:3001
   VITE_API_BASE_URL=http://localhost:3001
   ```

2. **Start backend on port 3001**:
   ```bash
   cd /Users/tneibarger/nova-universe
   API_PORT=3001 pnpm --filter @nova-universe/api dev
   ```

3. **Verify backend is running**:
   ```bash
   curl http://localhost:3001/api/health
   # Should return: {"status":"connected","userCount":1,"message":"Database connection successful"}
   ```

4. **Restart frontend** (to pick up new env var):
   ```bash
   # Stop current frontend (Ctrl+C)
   pnpm --filter @nova-universe/unified dev
   ```

**Pros**:
- ✅ Quick and simple
- ✅ No need to stop Next.js
- ✅ Both servers can run simultaneously

**Cons**:
- ⚠️ Need to remember port 3001 for backend

---

### Option 2: Stop Next.js, Use Port 3000 for Backend (3 minutes)

**Steps**:

1. **Find and stop Next.js process**:
   ```bash
   kill 27103
   # Or if you know which terminal, just Ctrl+C
   ```

2. **Start backend on port 3000**:
   ```bash
   cd /Users/tneibarger/nova-universe
   pnpm --filter @nova-universe/api dev
   # Should start on port 3000 by default
   ```

3. **Verify backend is running**:
   ```bash
   curl http://localhost:3000/api/health
   # Should return: {"status":"connected","userCount":1,"message":"Database connection successful"}
   ```

4. **No frontend changes needed** - Already configured for port 3000

**Pros**:
- ✅ Matches existing frontend configuration
- ✅ Cleaner setup (one server per port)

**Cons**:
- ⚠️ Need to stop Next.js (might be running something else)
- ⚠️ Need to identify what's running Next.js

---

## Recommended Approach: Option 1 (Move to 3001)

**Commands to Run**:

```bash
# 1. Update environment file
cd /Users/tneibarger/nova-universe
sed -i '' 's/VITE_API_URL=http:\/\/localhost:3000/VITE_API_URL=http:\/\/localhost:3001/' apps/unified/.env.local
sed -i '' 's/VITE_API_BASE_URL=http:\/\/localhost:3000/VITE_API_BASE_URL=http:\/\/localhost:3001/' apps/unified/.env.local

# 2. Start backend on port 3001
API_PORT=3001 pnpm --filter @nova-universe/api dev &

# 3. Wait 5 seconds for backend to start
sleep 5

# 4. Test backend
curl http://localhost:3001/api/health

# 5. Restart frontend (in another terminal)
# Stop current frontend with Ctrl+C, then:
pnpm --filter @nova-universe/unified dev
```

---

## Verification Checklist

After implementing the fix:

- [ ] Backend responds on port 3001: `curl http://localhost:3001/api/health`
- [ ] Frontend env updated: `VITE_API_URL=http://localhost:3001`
- [ ] Frontend restarted to pick up new env
- [ ] Test frontend pages load data:
  - [ ] Knowledge Base shows articles
  - [ ] Service Catalog shows services
  - [ ] Change Management shows changes
  - [ ] No console errors about failed API calls

---

## Testing Backend Connection

**Quick Test**:
```bash
# Test health endpoint
curl http://localhost:3001/api/health

# Test knowledge base endpoint (requires data)
curl http://localhost:3001/api/knowledge/popular

# Test alerts endpoint (requires data)
curl http://localhost:3001/api/alerts/active
```

**Expected Responses**:
- Health: `{"status":"connected",...}`
- Others: JSON arrays (might be empty if no data seeded)

---

## If Backend Won't Start

**Check Database**:
```bash
# Ensure PostgreSQL is running
psql -U postgres -d nova_universe -c "SELECT COUNT(*) FROM \"User\";"
# Should return count (might be 0 if no data)
```

**Check Dependencies**:
```bash
cd apps/api
pnpm install
```

**Check Logs**:
```bash
# Look for errors in backend startup
API_PORT=3001 pnpm --filter @nova-universe/api dev 2>&1 | tee backend.log
```

---

## Alternative: Use Docker Compose

If you have docker-compose.yml:

```bash
# Check if docker-compose exists
ls docker-compose.yml

# If it exists, use it:
docker-compose up -d
# Backend should start on configured port
```

---

## Next Steps After Fix

1. ✅ Verify backend connectivity
2. ✅ Test frontend loads data correctly
3. ✅ Test login functionality
4. ✅ Test CRUD operations on each page
5. ⏳ Complete RBAC implementation (optional)
6. ⏳ Add more E2E tests (optional)

---

**Status**: Ready to implement  
**Estimated Time**: 2-5 minutes  
**Recommended**: Option 1 (Port 3001)
