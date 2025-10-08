#!/bin/bash

# Nova Universe - Local PostgreSQL Database Setup Script
# This script configures the local PostgreSQL database and runs Prisma migrations

set -e  # Exit on error

echo "🚀 Nova Universe - Local PostgreSQL Setup"
echo "=========================================="
echo ""

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Database configuration
DB_NAME="nova_universe"
DB_USER=$(whoami)
DB_PASSWORD="nova_password"
DB_HOST="localhost"
DB_PORT="5432"

# Step 1: Check if .env exists
echo "📋 Step 1: Checking environment configuration..."
if [ ! -f .env ]; then
    echo -e "${YELLOW}⚠️  .env file not found. Creating from .env.example...${NC}"
    cp .env.example .env
    echo -e "${GREEN}✅ Created .env file${NC}"
else
    echo -e "${GREEN}✅ .env file exists${NC}"
fi
echo ""

# Step 2: Start PostgreSQL service
echo "🐘 Step 2: Starting PostgreSQL service..."
if brew services list | grep postgresql@14 | grep started > /dev/null; then
    echo -e "${GREEN}✅ PostgreSQL is already running${NC}"
else
    echo "Starting PostgreSQL..."
    brew services start postgresql@14
    sleep 3
    echo -e "${GREEN}✅ PostgreSQL started${NC}"
fi
echo ""

# Step 3: Create database if it doesn't exist
echo "📊 Step 3: Creating database..."
if psql -lqt | cut -d \| -f 1 | grep -qw $DB_NAME; then
    echo -e "${YELLOW}⚠️  Database '$DB_NAME' already exists${NC}"
else
    echo "Creating database '$DB_NAME'..."
    createdb $DB_NAME
    echo -e "${GREEN}✅ Database created${NC}"
fi
echo ""

# Step 4: Enable required PostgreSQL extensions
echo "🔧 Step 4: Enabling PostgreSQL extensions..."
psql -d $DB_NAME -c "CREATE EXTENSION IF NOT EXISTS \"uuid-ossp\";" > /dev/null 2>&1
psql -d $DB_NAME -c "CREATE EXTENSION IF NOT EXISTS \"pg_trgm\";" > /dev/null 2>&1
psql -d $DB_NAME -c "CREATE EXTENSION IF NOT EXISTS \"btree_gin\";" > /dev/null 2>&1
echo -e "${GREEN}✅ Extensions enabled${NC}"
echo ""

# Step 5: Configure DATABASE_URL in .env
echo "🔧 Step 5: Configuring DATABASE_URL..."
DATABASE_URL="postgresql://${DB_USER}@${DB_HOST}:${DB_PORT}/${DB_NAME}"

if grep -q "^DATABASE_URL=" .env; then
    echo -e "${YELLOW}⚠️  DATABASE_URL already exists in .env, updating...${NC}"
    # Use sed to replace the DATABASE_URL line (macOS compatible)
    sed -i '' "s|^DATABASE_URL=.*|DATABASE_URL=\"${DATABASE_URL}\"|" .env
else
    echo "Adding DATABASE_URL to .env..."
    echo "" >> .env
    echo "# Prisma Database Configuration" >> .env
    echo "DATABASE_URL=\"${DATABASE_URL}\"" >> .env
fi
echo -e "${GREEN}✅ DATABASE_URL configured${NC}"
echo ""

# Step 6: Generate Prisma Client
echo "🔨 Step 6: Generating Prisma Client..."
npx prisma generate
echo -e "${GREEN}✅ Prisma Client generated${NC}"
echo ""

# Step 7: Push database schema
echo "📊 Step 7: Pushing database schema..."
echo -e "${BLUE}This will create all tables, indexes, and relationships...${NC}"
npx prisma db push --accept-data-loss
echo -e "${GREEN}✅ Database schema created${NC}"
echo ""

# Step 8: Verify database connection
echo "🔍 Step 8: Verifying database connection..."
if npx prisma db pull > /dev/null 2>&1; then
    echo -e "${GREEN}✅ Database connection verified${NC}"
else
    echo -e "${RED}❌ Database connection failed${NC}"
    exit 1
fi
echo ""

# Step 9: Show database info
echo "📈 Step 9: Database information..."
echo -e "${BLUE}Tables in database:${NC}"
psql -d $DB_NAME -c "\dt" 2>/dev/null || echo "No tables yet (this is normal on first run)"
echo ""

# Step 10: Count tables
TABLE_COUNT=$(psql -d $DB_NAME -t -c "SELECT COUNT(*) FROM information_schema.tables WHERE table_schema = 'public';" | xargs)
echo -e "${GREEN}Total tables created: ${TABLE_COUNT}${NC}"
echo ""

# Summary
echo "=========================================="
echo -e "${GREEN}🎉 Database Setup Complete!${NC}"
echo "=========================================="
echo ""
echo "📊 Database Details:"
echo "   Host: ${DB_HOST}"
echo "   Port: ${DB_PORT}"
echo "   Database: ${DB_NAME}"
echo "   User: ${DB_USER}"
echo "   Tables: ${TABLE_COUNT}"
echo ""
echo "🔗 Connection String:"
echo "   ${DATABASE_URL}"
echo ""
echo "🛠️  Useful Commands:"
echo "   View database: npx prisma studio"
echo "   Run migrations: npx prisma db push"
echo "   Access DB CLI: psql ${DB_NAME}"
echo "   Stop PostgreSQL: brew services stop postgresql@14"
echo "   View logs: brew services info postgresql@14"
echo ""
echo "🧪 Next Steps:"
echo "   1. Start API server: npm run dev"
echo "   2. Run Week 1 tests: ./test-week-1-simple.sh"
echo "   3. Run Week 2 tests: ./test-week-2-apis.sh"
echo "   4. Open Prisma Studio: npx prisma studio"
echo ""
