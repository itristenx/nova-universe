#!/bin/bash

# Nova Universe Production Readiness Validation Script
# Conducts comprehensive pre-UAT assessment

echo "🔍 NOVA UNIVERSE - PRODUCTION READINESS VALIDATION"
echo "=================================================="
echo ""

# Color codes for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

ERRORS=0
WARNINGS=0

# Function to report errors
error() {
    echo -e "${RED}❌ ERROR: $1${NC}"
    ((ERRORS++))
}

# Function to report warnings
warning() {
    echo -e "${YELLOW}⚠️  WARNING: $1${NC}"
    ((WARNINGS++))
}

# Function to report success
success() {
    echo -e "${GREEN}✅ SUCCESS: $1${NC}"
}

# Function to report info
info() {
    echo -e "${BLUE}ℹ️  INFO: $1${NC}"
}

echo "1. Checking Core AI Fabric Implementation..."
echo "============================================"

# Check AI Fabric stub vs implementation
JS_LINES=$(wc -l < apps/api/lib/ai-fabric.js)

if [ "$JS_LINES" -lt 100 ]; then
    error "AI Fabric JS implementation is only $JS_LINES lines (likely stub)"
fi

if grep -q "Basic implementation.*TODO\|TODO.*Basic implementation\|PLACEHOLDER\|STUB\|NOT IMPLEMENTED" apps/api/lib/ai-fabric.js; then
    error "AI Fabric contains placeholder implementations"
fi

# Check which file is being imported
if grep -r "from './ai-fabric.js'" apps/api/routes/ > /dev/null; then
    warning "Routes are importing stub AI Fabric (.js) instead of full implementation (.ts)"
fi

echo ""
echo "2. Checking TODO/FIXME/Placeholder Items..."
echo "=========================================="

# Count TODO/FIXME items in critical areas
TODO_COUNT=$(grep -r -i "TODO\|FIXME\|placeholder.*not\|stub.*implementation" apps/api/src/ apps/api/lib/ apps/api/routes/ 2>/dev/null | grep -v node_modules | wc -l)

if [ "$TODO_COUNT" -gt 10 ]; then
    error "Found $TODO_COUNT TODO/FIXME items in critical API code"
elif [ "$TODO_COUNT" -gt 5 ]; then
    warning "Found $TODO_COUNT TODO/FIXME items in critical API code"
else
    success "TODO/FIXME count acceptable: $TODO_COUNT items"
fi

echo ""
echo "3. Checking Database Persistence..."
echo "================================="

# Check for database TODO items
if grep -q "TODO: Save to database" apps/api/src/routes/nova-tv-digital-signage.js; then
    error "Nova TV digital signage uploads not persisted to database"
fi

if grep -q "TODO: Implement with Prisma" apps/api/src/routes/nova-tv-digital-signage.js; then
    error "Prisma database operations not implemented"
fi

echo ""
echo "4. Checking Security Implementation..."
echo "===================================="

# Check for hardcoded values (excluding properly protected fallbacks)
if grep -r "changeme" apps/api/ | grep -v node_modules | grep -v ".lock" | grep -v "production.*throw.*Error" | grep -v "NODE_ENV.*production" | grep -v "apps/api/config/production-validation.js" > /dev/null; then
    error "Found 'changeme' hardcoded values in API code"
fi

# Check production validation
if [ -f "apps/api/config/production-validation.js" ]; then
    success "Production validation config exists"
else
    warning "Production validation config missing"
fi

echo ""
echo "5. Checking API Endpoint Implementation..."
echo "========================================"

# Check if documented AI Fabric endpoints are functional
AI_ROUTES_COUNT=$(grep -c "router\." apps/api/routes/ai-fabric.js)
if [ "$AI_ROUTES_COUNT" -lt 8 ]; then
    warning "AI Fabric has fewer than expected API routes ($AI_ROUTES_COUNT found)"
fi

echo ""
echo "6. Checking File Structure Consistency..."
echo "======================================="

# Check for TypeScript vs JavaScript consistency
if [ -f "apps/api/lib/ai-fabric.ts" ] && [ -f "apps/api/lib/ai-fabric.js" ]; then
    warning "Both TypeScript and JavaScript versions of AI Fabric exist"
fi

echo ""
echo "7. Checking Environment Configuration..."
echo "======================================"

# Check database configuration
if grep -q "nova_password" apps/api/config/database.js; then
    success "Database config has fallback password protection"
else
    warning "Database config missing fallback password protection"
fi

echo ""
echo "VALIDATION SUMMARY"
echo "=================="
echo ""

if [ "$ERRORS" -eq 0 ] && [ "$WARNINGS" -eq 0 ]; then
    echo -e "${GREEN}🎉 PRODUCTION READY: No critical issues found${NC}"
    exit 0
elif [ "$ERRORS" -eq 0 ]; then
    echo -e "${YELLOW}⚠️  PRODUCTION READY WITH WARNINGS: $WARNINGS warnings found${NC}"
    echo "Recommendation: Address warnings before UAT"
    exit 1
elif [ "$ERRORS" -lt 5 ]; then
    echo -e "${RED}❌ NOT PRODUCTION READY: $ERRORS critical errors, $WARNINGS warnings${NC}"
    echo "Recommendation: Fix critical errors before UAT"
    exit 2
else
    echo -e "${RED}🚨 CRITICAL PRODUCTION FAILURE: $ERRORS critical errors, $WARNINGS warnings${NC}"
    echo "Recommendation: HALT UAT - System requires major fixes"
    exit 3
fi
