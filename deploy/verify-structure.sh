#!/bin/bash
# Deployment Structure Verification Script
# Validates the consolidated Docker and environment files structure

set -e

echo "======================================================================"
echo "  Nova Universe - Deployment Structure Verification"
echo "======================================================================"
echo ""

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

success_count=0
error_count=0

check_file() {
    if [ -f "$1" ]; then
        echo -e "${GREEN}✓${NC} $1 exists"
        ((success_count++))
        return 0
    else
        echo -e "${RED}✗${NC} $1 NOT FOUND"
        ((error_count++))
        return 1
    fi
}

check_symlink() {
    if [ -L "$1" ]; then
        echo -e "${GREEN}✓${NC} $1 is a symlink"
        ((success_count++))
        return 0
    else
        echo -e "${RED}✗${NC} $1 is NOT a symlink"
        ((error_count++))
        return 1
    fi
}

check_dir() {
    if [ -d "$1" ]; then
        echo -e "${GREEN}✓${NC} $1 directory exists"
        ((success_count++))
        return 0
    else
        echo -e "${RED}✗${NC} $1 directory NOT FOUND"
        ((error_count++))
        return 1
    fi
}

validate_compose() {
    if docker-compose -f "$1" config > /dev/null 2>&1; then
        echo -e "${GREEN}✓${NC} $1 is valid"
        ((success_count++))
        return 0
    else
        echo -e "${RED}✗${NC} $1 has validation errors"
        ((error_count++))
        return 1
    fi
}

echo "Checking directory structure..."
echo "----------------------------------------------------------------------"
check_dir "deploy"
check_dir "deploy/docker"
check_dir "deploy/docker/development"
check_dir "deploy/docker/production"
check_dir "deploy/docker/testing"
check_dir "deploy/docker/monitoring"
check_dir "deploy/env"
check_dir "deploy/env/special"
echo ""

echo "Checking Docker Compose files..."
echo "----------------------------------------------------------------------"
check_file "deploy/docker/development/docker-compose.yml"
check_file "deploy/docker/development/docker-compose.override.yml"
check_file "deploy/docker/production/docker-compose.yml"
check_file "deploy/docker/testing/docker-compose.yml"
check_file "deploy/docker/monitoring/docker-compose.yml"
echo ""

echo "Checking environment template files..."
echo "----------------------------------------------------------------------"
check_file "deploy/env/.env.example"
check_file "deploy/env/.env.production.template"
check_file "deploy/env/.env.production-test"
check_file "deploy/env/.env.monitoring.template"
check_file "deploy/env/.env.test"
check_file "deploy/env/.env.test.integration"
check_file "deploy/env/.env.uat.example"
check_file "deploy/env/.env.prisma-test"
check_file "deploy/env/special/.env.ai-fabric"
echo ""

echo "Checking documentation..."
echo "----------------------------------------------------------------------"
check_file "deploy/README.md"
check_file "deploy/MIGRATION.md"
check_file "deploy/CONSOLIDATION_SUMMARY.md"
echo ""

echo "Checking root symlinks..."
echo "----------------------------------------------------------------------"
check_symlink "docker-compose.yml"
check_symlink ".env.example"
echo ""

echo "Validating Docker Compose configurations..."
echo "----------------------------------------------------------------------"
if command -v docker-compose &> /dev/null; then
    validate_compose "deploy/docker/development/docker-compose.yml"
    validate_compose "deploy/docker/production/docker-compose.yml"
    validate_compose "deploy/docker/monitoring/docker-compose.yml"
    validate_compose "deploy/docker/testing/docker-compose.yml"
else
    echo -e "${YELLOW}⚠${NC} docker-compose not found, skipping validation"
fi
echo ""

echo "Checking for old duplicate files (should not exist)..."
echo "----------------------------------------------------------------------"
old_files=(
    "docker-compose.prod.yml"
    "docker-compose.monitoring.yml"
    "docker-compose.override.yml"
    "docker-compose.production-test.yml"
    "env.template"
    "env.production.template"
    "env.production-test"
    ".env.production.template"
    ".env.monitoring.template"
    ".env.ai-fabric"
    ".env.test.integration"
    ".env.uat.example"
    ".env.prisma-test"
)

all_deleted=true
for file in "${old_files[@]}"; do
    if [ -f "$file" ] && [ ! -L "$file" ]; then
        echo -e "${RED}✗${NC} Old file still exists: $file"
        all_deleted=false
        ((error_count++))
    fi
done

if [ "$all_deleted" = true ]; then
    echo -e "${GREEN}✓${NC} All old duplicate files have been removed"
    ((success_count++))
fi
echo ""

echo "======================================================================"
echo "  Verification Summary"
echo "======================================================================"
echo ""
echo -e "Successful checks: ${GREEN}${success_count}${NC}"
echo -e "Failed checks: ${RED}${error_count}${NC}"
echo ""

if [ $error_count -eq 0 ]; then
    echo -e "${GREEN}✓ ALL CHECKS PASSED!${NC}"
    echo ""
    echo "The deployment structure has been successfully consolidated"
    echo "following industry best practices (2024-2025)."
    echo ""
    echo "Next steps:"
    echo "  1. Read deploy/README.md for usage instructions"
    echo "  2. Read deploy/MIGRATION.md for migration guide"
    echo "  3. Update CI/CD pipelines if needed"
    echo "  4. Test your deployment workflow"
    echo ""
    exit 0
else
    echo -e "${RED}✗ SOME CHECKS FAILED${NC}"
    echo ""
    echo "Please review the errors above and fix them."
    echo ""
    exit 1
fi
