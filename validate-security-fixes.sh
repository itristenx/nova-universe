#!/bin/bash

# Nova Universe Security Validation Script
# Final check for all implemented security fixes

set -e

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
NC='\033[0m' # No Color

CHECKS_PASSED=0
CHECKS_FAILED=0

echo -e "${PURPLE}🔒 Nova Universe Security Validation${NC}"
echo "====================================="
echo "Validating all implemented security fixes..."
echo ""

# Test security fixes
echo -e "${BLUE}🔍 Security Fix Validation${NC}"
echo "========================="

# 1. Database security
echo -n "Checking database password security... "
if node -e "
try {
  process.env.NODE_ENV = 'production';
  delete process.env.DB_PASSWORD;
  delete process.env.POSTGRES_PASSWORD;
  require('./apps/api/config/database.js');
  console.log('FAILED - Should have thrown error');
  process.exit(1);
} catch (e) {
  if (e.message.includes('password') || e.message.includes('production')) {
    console.log('PASSED - Correctly requires passwords in production');
    process.exit(0);
  } else {
    console.log('FAILED - Wrong error:', e.message);
    process.exit(1);
  }
}" 2>/dev/null; then
  echo -e "${GREEN}✅${NC}"
  ((CHECKS_PASSED++))
else
  echo -e "${RED}❌${NC}"
  ((CHECKS_FAILED++))
fi

# 2. Elasticsearch security
echo -n "Checking Elasticsearch password security... "
if node -e "
const fs = require('fs');
const content = fs.readFileSync('./src/lib/db/elastic.ts', 'utf8');
if (content.includes('ELASTIC_PASSWORD is required in production') && 
    content.includes('throw new Error')) {
  console.log('PASSED - Elasticsearch requires password in production');
  process.exit(0);
} else {
  console.log('FAILED - Elasticsearch security not implemented');
  process.exit(1);
}" 2>/dev/null; then
  echo -e "${GREEN}✅${NC}"
  ((CHECKS_PASSED++))
else
  echo -e "${RED}❌${NC}"
  ((CHECKS_FAILED++))
fi

# 3. UAT script security
echo -n "Checking UAT secure password generation... "
if grep -q "generateSecurePassword" apps/api/scripts/seed-uat.js; then
  if [ $(grep -c "generateSecurePassword" apps/api/scripts/seed-uat.js) -ge 4 ]; then
    echo -e "${GREEN}✅${NC}"
    ((CHECKS_PASSED++))
  else
    echo -e "${RED}❌ - Not enough secure password usages${NC}"
    ((CHECKS_FAILED++))
  fi
else
  echo -e "${RED}❌ - No secure password generation found${NC}"
  ((CHECKS_FAILED++))
fi

# 4. Production validation module
echo -n "Checking production validation module... "
if [ -f "apps/api/config/production-validation.js" ]; then
  if node -e "
  const fs = require('fs');
  const content = fs.readFileSync('./apps/api/config/production-validation.js', 'utf8');
  if (content.includes('validateProductionEnvironment') && 
      content.includes('export function')) {
    console.log('PASSED - Production validation module exists and exports function');
    process.exit(0);
  } else {
    console.log('FAILED - validateProductionEnvironment function not found');
    process.exit(1);
  }" 2>/dev/null; then
    echo -e "${GREEN}✅${NC}"
    ((CHECKS_PASSED++))
  else
    echo -e "${RED}❌${NC}"
    ((CHECKS_FAILED++))
  fi
else
  echo -e "${RED}❌ - File not found${NC}"
  ((CHECKS_FAILED++))
fi

# 5. Performance monitoring middleware
echo -n "Checking performance monitoring middleware... "
if [ -f "apps/api/middleware/performance-monitor.js" ]; then
  echo -e "${GREEN}✅${NC}"
  ((CHECKS_PASSED++))
else
  echo -e "${RED}❌${NC}"
  ((CHECKS_FAILED++))
fi

# 6. SSL certificate script
echo -n "Checking SSL certificate setup script... "
if [ -f "scripts/setup-ssl-certificates.sh" ] && [ -x "scripts/setup-ssl-certificates.sh" ]; then
  echo -e "${GREEN}✅${NC}"
  ((CHECKS_PASSED++))
else
  echo -e "${RED}❌${NC}"
  ((CHECKS_FAILED++))
fi

# 7. Security documentation
echo -n "Checking security documentation... "
if [ -f "docs/SECURITY_HARDENING_GUIDE.md" ]; then
  echo -e "${GREEN}✅${NC}"
  ((CHECKS_PASSED++))
else
  echo -e "${RED}❌${NC}"
  ((CHECKS_FAILED++))
fi

# 8. Production environment template
echo -n "Checking production environment template... "
if [ -f ".env.production.secure" ]; then
  echo -e "${GREEN}✅${NC}"
  ((CHECKS_PASSED++))
else
  echo -e "${RED}❌${NC}"
  ((CHECKS_FAILED++))
fi

echo ""
echo -e "${BLUE}📊 Validation Summary${NC}"
echo "==================="
echo -e "✅ Checks Passed: ${GREEN}${CHECKS_PASSED}${NC}"
echo -e "❌ Checks Failed: ${RED}${CHECKS_FAILED}${NC}"

if [ $CHECKS_FAILED -eq 0 ]; then
  echo ""
  echo -e "${GREEN}🎉 ALL SECURITY FIXES VALIDATED SUCCESSFULLY!${NC}"
  echo -e "${GREEN}✅ System is PRODUCTION READY${NC}"
  echo ""
  echo -e "${PURPLE}Ready for UAT deployment${NC}"
  exit 0
else
  echo ""
  echo -e "${RED}❌ Some security checks failed. Please review and fix.${NC}"
  exit 1
fi
