#!/bin/bash

# Environment Files Validation Script
# Checks that environment files are properly configured and gitignored

echo "======================================================================"
echo "  Environment Files Validation"
echo "======================================================================"
echo ""

ERRORS=0
WARNINGS=0

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check if .gitignore exists
echo "Checking .gitignore configuration..."
echo "----------------------------------------------------------------------"

if [ ! -f .gitignore ]; then
    echo -e "${RED}✗ .gitignore file not found!${NC}"
    ((ERRORS++))
else
    echo -e "${GREEN}✓ .gitignore file exists${NC}"
fi

# Check active .env files are ignored
echo ""
echo "Checking active environment files are gitignored..."
echo "----------------------------------------------------------------------"

ACTIVE_FILES=(".env" ".env.production" ".env.monitoring" ".env.test" ".env.staging" ".env.local")

for file in "${ACTIVE_FILES[@]}"; do
    if [ -f "$file" ]; then
        if git check-ignore "$file" > /dev/null 2>&1; then
            echo -e "${GREEN}✓ $file is properly gitignored${NC}"
        else
            echo -e "${RED}✗ $file exists but is NOT gitignored!${NC}"
            ((ERRORS++))
        fi
    fi
done

# Check secure files are ignored
echo ""
echo "Checking secure files patterns..."
echo "----------------------------------------------------------------------"

if git check-ignore "test.secure" > /dev/null 2>&1; then
    echo -e "${GREEN}✓ *.secure files are gitignored${NC}"
else
    echo -e "${YELLOW}⚠ *.secure pattern may not be working${NC}"
    ((WARNINGS++))
fi

if git check-ignore "test.secret" > /dev/null 2>&1; then
    echo -e "${GREEN}✓ *.secret files are gitignored${NC}"
else
    echo -e "${YELLOW}⚠ *.secret pattern may not be working${NC}"
    ((WARNINGS++))
fi

# Check templates exist in deploy/env/
echo ""
echo "Checking template files in deploy/env/..."
echo "----------------------------------------------------------------------"

TEMPLATES=(
    "deploy/env/.env.example"
    "deploy/env/.env.production.template"
    "deploy/env/.env.monitoring.template"
)

for template in "${TEMPLATES[@]}"; do
    if [ -f "$template" ]; then
        echo -e "${GREEN}✓ $template exists${NC}"
    else
        echo -e "${RED}✗ $template not found!${NC}"
        ((ERRORS++))
    fi
done

# Check symlink
echo ""
echo "Checking convenience symlink..."
echo "----------------------------------------------------------------------"

if [ -L .env.example ]; then
    TARGET=$(readlink .env.example)
    if [ "$TARGET" = "deploy/env/.env.example" ]; then
        echo -e "${GREEN}✓ .env.example symlink is correct${NC}"
    else
        echo -e "${YELLOW}⚠ .env.example points to: $TARGET (expected: deploy/env/.env.example)${NC}"
        ((WARNINGS++))
    fi
else
    echo -e "${RED}✗ .env.example symlink not found!${NC}"
    ((ERRORS++))
fi

# Check no .env files are tracked in git
echo ""
echo "Checking git doesn't track active .env files..."
echo "----------------------------------------------------------------------"

TRACKED_ENV=$(git ls-files | grep -E "^\.env$|^\.env\.production$|^\.env\.monitoring$|^\.env\.test$" | grep -v "template\|example")

if [ -z "$TRACKED_ENV" ]; then
    echo -e "${GREEN}✓ No active .env files are tracked in git${NC}"
else
    echo -e "${RED}✗ Found active .env files tracked in git:${NC}"
    echo "$TRACKED_ENV"
    ((ERRORS++))
fi

# Check templates ARE tracked
echo ""
echo "Checking git tracks template files..."
echo "----------------------------------------------------------------------"

TRACKED_TEMPLATES=$(git ls-files deploy/env/ | wc -l | tr -d ' ')

if [ "$TRACKED_TEMPLATES" -gt 0 ]; then
    echo -e "${GREEN}✓ Found $TRACKED_TEMPLATES template files tracked in deploy/env/${NC}"
else
    echo -e "${RED}✗ No template files found in git!${NC}"
    ((ERRORS++))
fi

# Security check: look for potential secrets in templates
echo ""
echo "Checking templates for potential secrets..."
echo "----------------------------------------------------------------------"

SUSPICIOUS_PATTERNS=(
    "sk-[a-zA-Z0-9]{32,}"  # OpenAI keys
    "[0-9]{4}-[0-9]{4}-[0-9]{4}-[0-9]{4}"  # Credit cards
    "AKIA[0-9A-Z]{16}"  # AWS keys
)

FOUND_SUSPICIOUS=false

# Check template files for suspicious patterns
for template in deploy/env/*.template deploy/env/*.example deploy/env/.env.*; do
    [ -f "$template" ] || continue
    
    for pattern in "${SUSPICIOUS_PATTERNS[@]}"; do
        if grep -qE "$pattern" "$template" 2>/dev/null; then
            echo -e "${YELLOW}⚠ Suspicious pattern found in $template${NC}"
            ((WARNINGS++))
            FOUND_SUSPICIOUS=true
        fi
    done
done

if [ "$FOUND_SUSPICIOUS" = false ]; then
    echo -e "${GREEN}✓ No obvious secrets found in templates${NC}"
fi

# Summary
echo ""
echo "======================================================================"
echo "  Validation Summary"
echo "======================================================================"
echo ""

if [ $ERRORS -eq 0 ] && [ $WARNINGS -eq 0 ]; then
    echo -e "${GREEN}✓ ALL CHECKS PASSED!${NC}"
    echo ""
    echo "Your environment file configuration is secure and properly set up."
    exit 0
elif [ $ERRORS -eq 0 ]; then
    echo -e "${YELLOW}✓ Passed with $WARNINGS warning(s)${NC}"
    echo ""
    echo "Environment files are mostly configured correctly."
    echo "Review warnings above and fix if needed."
    exit 0
else
    echo -e "${RED}✗ FAILED with $ERRORS error(s) and $WARNINGS warning(s)${NC}"
    echo ""
    echo "Critical issues found! Please fix errors above."
    exit 1
fi
