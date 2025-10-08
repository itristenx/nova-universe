# Database Seeding Guide

## Overview

This guide explains how to populate the Nova Universe database with sample data for frontend development and testing.

## Method 1: Via Frontend UI (Recommended for Development)

Since the backend API is operational and the frontend will be integrated, the easiest way to create sample data is through the frontend UI:

1. **Start the backend** (if not already running):
   ```bash
   pnpm --filter @nova-universe/api dev
   ```

2. **Start the frontend**:
   ```bash
   pnpm --filter @nova-universe/unified dev
   ```

3. **Create sample data** through the UI:
   - Register a user account
   - Create knowledge base articles
   - Add service catalog items
   - Configure webhooks
   - Set up alert rules
   - Create change requests
   - Build workflows

## Method 2: Direct Prisma Seeding (Requires pgvector)

If you want to run automated seeding with sample data:

### Prerequisites

1. **Install pgvector extension**:
   ```bash
   # macOS (Homebrew)
   brew install pgvector
   
   # Ubuntu/Debian
   sudo apt-get install postgresql-14-pgvector
   ```

2. **Enable extension in database**:
   ```bash
   psql -d nova_universe -c "CREATE EXTENSION IF NOT EXISTS vector;"
   ```

3. **Push Prisma schema**:
   ```bash
   pnpm prisma db push
   ```

4. **Regenerate Prisma client**:
   ```bash
   pnpm prisma generate
   ```

5. **Run seed script**:
   ```bash
   node scripts/seed-database.js
   ```

### Sample Credentials

After seeding, you can log in with:

**Admin Account:**
- Email: `admin@nova-universe.com`
- Password: `Admin123!`

**Agent Accounts:**
- `john.doe@nova-universe.com` / `Admin123!`
- `jane.smith@nova-universe.com` / `Admin123!`

**User Account:**
- `mike.johnson@nova-universe.com` / `Admin123!`

⚠️ **Change these passwords in production!**

## Method 3: Via API Requests

You can also seed data by making HTTP requests to the backend API:

```bash
# Example: Create a user
curl -X POST http://localhost:3000/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "Test123!",
    "name": "Test User"
  }'
```

## Verification

Check that the API is accessible:

```bash
node scripts/seed-via-api.js
```

This script will verify:
- Backend API is running
- Database connection is working
- Health check endpoint responds

## Sample Data Overview

The seed script creates:

- **4 Users** (Admin, 2 Agents, 1 Regular User)
- **4 Departments** (Engineering, IT Support, Operations, Customer Success)
- **3-5 Knowledge Base Articles** (Password reset, VPN setup, etc.)
- **3 Service Catalog Items** (Email, VPN, File Storage)
- **2 Webhooks** (Ticket notifications, Alert integrations)
- **2 Alerts** (High CPU, Database issues)
- **2 Alert Rules** (CPU threshold, Disk space)
- **2 Change Requests** (Database upgrade, API deployment)
- **2 Workflows** (Change approval, Incident response)

## Troubleshooting

### "Cannot find module '@prisma/client'"

Run: `pnpm prisma generate`

### "pgvector extension not found"

Follow the pgvector installation steps above.

### "API server not running"

Start the backend: `pnpm --filter @nova-universe/api dev`

### "Database connection failed"

1. Check PostgreSQL is running: `pg_isready`
2. Verify database exists: `psql -l | grep nova_universe`
3. Check DATABASE_URL in `.env`

## Next Steps

After seeding, you can:

1. **Test the frontend** with real backend data
2. **Explore the API** using the 37 available endpoints
3. **Create additional test data** through the UI
4. **Run frontend integration tests** with realistic data

See `FRONTEND-INTEGRATION-TODO.md` for the complete integration roadmap.
