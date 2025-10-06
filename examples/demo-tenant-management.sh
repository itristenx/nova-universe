#!/bin/bash

# Nova Universe Tenant Management Demo
# This script demonstrates the tenant creation tool for Nova SaaS admins

set -e

echo "🏢 Nova Universe Tenant Management Demo"
echo "====================================="
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_step() {
    echo -e "${BLUE}➤ $1${NC}"
}

print_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

print_step "This demo shows how to use the Nova tenant management CLI"
echo ""

print_step "1. Checking CLI availability"
if command -v node >/dev/null 2>&1; then
    print_success "Node.js is available"
else
    print_error "Node.js is required but not installed"
    exit 1
fi

# Check if we're in the right directory
if [ ! -f "apps/api/cli/index.js" ]; then
    print_error "Please run this demo from the Nova Universe root directory"
    exit 1
fi

print_success "Nova CLI is available"
echo ""

print_step "2. Available tenant commands"
echo "The following commands are available:"
echo ""
echo "  nova tenant create         - Create a new tenant"
echo "  nova tenant list           - List all tenants"
echo "  nova tenant create-admin   - Create a tenant admin user"
echo "  nova tenant info           - Show tenant details"
echo ""

print_step "3. Command help examples"
echo ""
echo "Get help for the main tenant command:"
echo "  cd apps/api && node cli/index.js tenant --help"
echo ""
echo "Get help for creating a tenant:"
echo "  cd apps/api && node cli/index.js tenant create --help"
echo ""

print_step "4. Example usage scenarios"
echo ""

echo "${YELLOW}Scenario 1: Creating a new tenant${NC}"
echo "============================================"
echo ""
echo "Interactive mode (asks for input):"
echo "  cd apps/api && node cli/index.js tenant create"
echo ""
echo "Non-interactive mode (all options provided):"
echo "  cd apps/api && node cli/index.js tenant create \\"
echo "    --name \"Acme Corporation\" \\"
echo "    --domain \"acme.com\" \\"
echo "    --subdomain \"acme\" \\"
echo "    --theme-color \"#3b82f6\" \\"
echo "    --logo-url \"https://acme.com/logo.png\" \\"
echo "    --support-email \"support@acme.com\""
echo ""

echo "${YELLOW}Scenario 2: Creating a tenant admin${NC}"
echo "==========================================="
echo ""
echo "Interactive mode:"
echo "  cd apps/api && node cli/index.js tenant create-admin acme.com"
echo ""
echo "Non-interactive mode:"
echo "  cd apps/api && node cli/index.js tenant create-admin acme.com \\"
echo "    --email \"admin@acme.com\" \\"
echo "    --name \"John Smith\" \\"
echo "    --password \"SecurePassword123!\""
echo ""

echo "${YELLOW}Scenario 3: Managing tenants${NC}"
echo "================================="
echo ""
echo "List all tenants:"
echo "  cd apps/api && node cli/index.js tenant list"
echo ""
echo "List only active tenants:"
echo "  cd apps/api && node cli/index.js tenant list --active"
echo ""
echo "Get tenant information:"
echo "  cd apps/api && node cli/index.js tenant info acme.com"
echo ""
echo "Get tenant info in JSON format:"
echo "  cd apps/api && node cli/index.js tenant info acme.com --json"
echo ""

print_step "5. Database requirements"
echo ""
print_warning "The tenant management tool requires:"
echo "  • PostgreSQL database with tenant schema"
echo "  • Proper environment variables set:"
echo "    - POSTGRES_HOST"
echo "    - POSTGRES_DB"
echo "    - POSTGRES_USER"
echo "    - POSTGRES_PASSWORD"
echo ""

print_step "6. Testing the CLI (without database)"
echo ""
echo "You can test the CLI commands and see help output without a database:"
echo ""

if [ "$1" = "--test" ]; then
    print_step "Testing tenant command help..."
    cd apps/api
    echo ""
    echo "${BLUE}Running: node cli/index.js tenant --help${NC}"
    echo "=========================================="
    node cli/index.js tenant --help 2>/dev/null || print_warning "CLI requires dependencies to be installed in apps/api/"
    echo ""
    
    print_step "Testing create command help..."
    echo ""
    echo "${BLUE}Running: node cli/index.js tenant create --help${NC}"
    echo "=================================================="
    node cli/index.js tenant create --help 2>/dev/null || print_warning "CLI requires dependencies to be installed in apps/api/"
    echo ""
    
    cd - > /dev/null
fi

print_step "7. Installation steps"
echo ""
echo "To use the tenant management tool:"
echo ""
echo "1. Install dependencies:"
echo "   cd apps/api && npm install"
echo ""
echo "2. Set up environment variables:"
echo "   export POSTGRES_HOST=localhost"
echo "   export POSTGRES_DB=nova_universe"
echo "   export POSTGRES_USER=nova_admin"
echo "   export POSTGRES_PASSWORD=your_password"
echo ""
echo "3. Run database migrations if needed"
echo ""
echo "4. Start using the tenant commands:"
echo "   cd apps/api && node cli/index.js tenant --help"
echo ""

print_success "Demo complete!"
echo ""
echo "For detailed documentation, see: TENANT_MANAGEMENT_GUIDE.md"
echo ""
echo "To run a quick CLI test (without database):"
echo "  ./demo-tenant-management.sh --test"
echo ""

if [ "$1" = "--test" ]; then
    print_step "Quick validation test"
    echo ""
    if [ -f "test-tenant-cli.js" ]; then
        echo "Running tenant CLI validation..."
        node test-tenant-cli.js
    else
        print_warning "test-tenant-cli.js not found"
    fi
fi