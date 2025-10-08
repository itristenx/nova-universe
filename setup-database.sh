#!/bin/bash

# Nova Universe - Database Setup Script
# This script configures the database and runs Prisma migrations

set -e  # Exit on error

echo "🚀 Nova Universe - Database Setup"
echo "=================================="
echo ""

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

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

# Step 2: Start PostgreSQL with Docker
echo "🐘 Step 2: Starting PostgreSQL database..."
if docker ps | grep -q nova-postgres; then
    echo -e "${YELLOW}⚠️  PostgreSQL container already running${NC}"
else
    echo "Starting PostgreSQL container..."
    docker-compose up -d postgres
    
    # Wait for PostgreSQL to be ready
    echo "Waiting for PostgreSQL to be ready..."
    for i in {1..30}; do
        if docker exec nova-postgres pg_isready -U nova_admin -d nova_universe > /dev/null 2>&1; then
            echo -e "${GREEN}✅ PostgreSQL is ready!${NC}"
            break
        fi
        echo -n "."
        sleep 1
        if [ $i -eq 30 ]; then
            echo -e "${RED}❌ PostgreSQL failed to start within 30 seconds${NC}"
            exit 1
        fi
    done
fi
echo ""

# Step 3: Configure DATABASE_URL in .env
echo "🔧 Step 3: Configuring DATABASE_URL..."
if grep -q "^DATABASE_URL=" .env; then
    echo -e "${YELLOW}⚠️  DATABASE_URL already exists in .env${NC}"
else
    echo "Adding DATABASE_URL to .env..."
    echo "" >> .env
    echo "# Prisma Database Configuration" >> .env
    echo "DATABASE_URL=\"postgresql://nova_admin:nova_password@localhost:5432/nova_universe\"" >> .env
    echo -e "${GREEN}✅ DATABASE_URL configured${NC}"
fi
echo ""

# Step 4: Start Redis (optional but recommended)
echo "🔴 Step 4: Starting Redis cache..."
if docker ps | grep -q nova-redis; then
    echo -e "${YELLOW}⚠️  Redis container already running${NC}"
else
    echo "Starting Redis container..."
    docker-compose up -d redis
    sleep 2
    echo -e "${GREEN}✅ Redis started${NC}"
fi
echo ""

# Step 5: Generate Prisma Client
echo "🔨 Step 5: Generating Prisma Client..."
npx prisma generate
echo -e "${GREEN}✅ Prisma Client generated${NC}"
echo ""

# Step 6: Push database schema
echo "📊 Step 6: Pushing database schema..."
npx prisma db push --accept-data-loss
echo -e "${GREEN}✅ Database schema created${NC}"
echo ""

# Step 7: Verify database connection
echo "🔍 Step 7: Verifying database connection..."
if npx prisma db pull > /dev/null 2>&1; then
    echo -e "${GREEN}✅ Database connection verified${NC}"
else
    echo -e "${RED}❌ Database connection failed${NC}"
    exit 1
fi
echo ""

# Step 8: Show database info
echo "📈 Step 8: Database information..."
docker exec nova-postgres psql -U nova_admin -d nova_universe -c "\dt" 2>/dev/null || echo "Fetching table list..."
echo ""

# Summary
echo "=================================="
echo -e "${GREEN}🎉 Database Setup Complete!${NC}"
echo "=================================="
echo ""
echo "📊 Database Details:"
echo "   Host: localhost"
echo "   Port: 5432"
echo "   Database: nova_universe"
echo "   User: nova_admin"
echo "   Password: nova_password"
echo ""
echo "🔗 Connection String:"
echo "   DATABASE_URL=postgresql://nova_admin:nova_password@localhost:5432/nova_universe"
echo ""
echo "🛠️  Useful Commands:"
echo "   View database: npx prisma studio"
echo "   Run migrations: npx prisma db push"
echo "   Stop database: docker-compose down"
echo "   View logs: docker logs nova-postgres"
echo ""
echo "🧪 Next Steps:"
echo "   1. Start API server: npm run dev"
echo "   2. Run Week 1 tests: ./test-week-1-simple.sh"
echo "   3. Run Week 2 tests: ./test-week-2-apis.sh"
echo ""
