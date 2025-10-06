#!/bin/bash

# ===================================================================
# Nova Universe Production Environment Setup Script
# ===================================================================
# This script helps configure production environment variables
# and validates the configuration before deployment.
# ===================================================================

set -e

echo "====================================================================="
echo "Nova Universe - Production Environment Configuration"
echo "====================================================================="
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Configuration file paths
TEMPLATE_FILE="env.production.template"
PRODUCTION_ENV=".env.production"

# Function to print colored messages
print_success() {
    echo -e "${GREEN}✓ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠ $1${NC}"
}

print_error() {
    echo -e "${RED}✗ $1${NC}"
}

# Function to generate random secret
generate_secret() {
    openssl rand -base64 64 | tr -d '\n'
}

# Function to generate encryption key
generate_encryption_key() {
    openssl rand -base64 32 | tr -d '\n'
}

# Check if running as root (not recommended)
if [ "$EUID" -eq 0 ]; then
    print_warning "Running as root is not recommended for security reasons"
fi

# Check if template exists
if [ ! -f "$TEMPLATE_FILE" ]; then
    print_error "Template file not found: $TEMPLATE_FILE"
    exit 1
fi

# Check if production env already exists
if [ -f "$PRODUCTION_ENV" ]; then
    print_warning "Production environment file already exists: $PRODUCTION_ENV"
    read -p "Do you want to overwrite it? (yes/no): " overwrite
    if [ "$overwrite" != "yes" ]; then
        echo "Aborting."
        exit 0
    fi
fi

echo "Setting up production environment..."
echo ""

# Copy template
cp "$TEMPLATE_FILE" "$PRODUCTION_ENV"
print_success "Created $PRODUCTION_ENV from template"

# Generate secrets
echo ""
echo "Generating security secrets..."

JWT_SECRET=$(generate_secret)
SESSION_SECRET=$(generate_secret)
ENCRYPTION_KEY=$(generate_encryption_key)

# Replace secrets in the file (macOS and Linux compatible)
if [[ "$OSTYPE" == "darwin"* ]]; then
    # macOS
    sed -i '' "s|JWT_SECRET=.*|JWT_SECRET=$JWT_SECRET|" "$PRODUCTION_ENV"
    sed -i '' "s|SESSION_SECRET=.*|SESSION_SECRET=$SESSION_SECRET|" "$PRODUCTION_ENV"
    sed -i '' "s|ENCRYPTION_KEY=.*|ENCRYPTION_KEY=$ENCRYPTION_KEY|" "$PRODUCTION_ENV"
else
    # Linux
    sed -i "s|JWT_SECRET=.*|JWT_SECRET=$JWT_SECRET|" "$PRODUCTION_ENV"
    sed -i "s|SESSION_SECRET=.*|SESSION_SECRET=$SESSION_SECRET|" "$PRODUCTION_ENV"
    sed -i "s|ENCRYPTION_KEY=.*|ENCRYPTION_KEY=$ENCRYPTION_KEY|" "$PRODUCTION_ENV"
fi

print_success "Generated JWT_SECRET"
print_success "Generated SESSION_SECRET"
print_success "Generated ENCRYPTION_KEY"

echo ""
echo "====================================================================="
echo "IMPORTANT: Manual Configuration Required"
echo "====================================================================="
echo ""
echo "Please edit $PRODUCTION_ENV and replace the following placeholders:"
echo ""
echo "Database Configuration:"
echo "  - POSTGRES_PASSWORD"
echo "  - MONGO_PASSWORD"
echo "  - REDIS_PASSWORD"
echo ""
echo "External Services:"
echo "  - SMTP_PASSWORD (SendGrid, Mailgun, etc.)"
echo "  - S3_ACCESS_KEY_ID"
echo "  - S3_SECRET_ACCESS_KEY"
echo "  - OPENAI_API_KEY (if using AI features)"
echo ""
echo "Integrations:"
echo "  - SLACK_WEBHOOK_URL"
echo "  - PAGERDUTY_API_KEY"
echo "  - SENTRY_DSN"
echo ""
echo "OAuth Providers (if enabled):"
echo "  - OAUTH_GOOGLE_CLIENT_ID"
echo "  - OAUTH_GOOGLE_CLIENT_SECRET"
echo "  - OAUTH_MICROSOFT_CLIENT_ID"
echo "  - OAUTH_MICROSOFT_CLIENT_SECRET"
echo ""
echo "====================================================================="
echo ""

# Prompt for basic configuration
read -p "Enter your production domain (e.g., api.yourdomain.com): " DOMAIN
if [ -n "$DOMAIN" ]; then
    if [[ "$OSTYPE" == "darwin"* ]]; then
        sed -i '' "s|API_DOMAIN=.*|API_DOMAIN=$DOMAIN|" "$PRODUCTION_ENV"
    else
        sed -i "s|API_DOMAIN=.*|API_DOMAIN=$DOMAIN|" "$PRODUCTION_ENV"
    fi
    print_success "Set API_DOMAIN to $DOMAIN"
fi

read -p "Enter your organization name: " ORG_NAME
if [ -n "$ORG_NAME" ]; then
    if [[ "$OSTYPE" == "darwin"* ]]; then
        sed -i '' "s|ORGANIZATION_NAME=.*|ORGANIZATION_NAME=$ORG_NAME|" "$PRODUCTION_ENV"
    else
        sed -i "s|ORGANIZATION_NAME=.*|ORGANIZATION_NAME=$ORG_NAME|" "$PRODUCTION_ENV"
    fi
    print_success "Set ORGANIZATION_NAME to $ORG_NAME"
fi

read -p "Enter admin email address: " ADMIN_EMAIL
if [ -n "$ADMIN_EMAIL" ]; then
    if [[ "$OSTYPE" == "darwin"* ]]; then
        sed -i '' "s|ADMIN_EMAIL=.*|ADMIN_EMAIL=$ADMIN_EMAIL|" "$PRODUCTION_ENV"
    else
        sed -i "s|ADMIN_EMAIL=.*|ADMIN_EMAIL=$ADMIN_EMAIL|" "$PRODUCTION_ENV"
    fi
    print_success "Set ADMIN_EMAIL to $ADMIN_EMAIL"
fi

echo ""
echo "====================================================================="
echo "Security Recommendations"
echo "====================================================================="
echo ""
echo "1. NEVER commit .env.production to version control"
echo "2. Store production secrets in a secure vault (AWS Secrets Manager, HashiCorp Vault, etc.)"
echo "3. Enable SSL/TLS certificates for all domains"
echo "4. Configure firewall rules to restrict access"
echo "5. Enable database encryption at rest"
echo "6. Set up automated backups"
echo "7. Configure monitoring and alerting"
echo "8. Review and update CORS_ORIGIN setting"
echo "9. Enable rate limiting and DDoS protection"
echo "10. Regular security audits and dependency updates"
echo ""

echo "====================================================================="
echo "Next Steps"
echo "====================================================================="
echo ""
echo "1. Edit $PRODUCTION_ENV and fill in all required values"
echo "2. Validate configuration: npm run validate:env:production"
echo "3. Test in staging environment first"
echo "4. Deploy to production: npm run deploy"
echo "5. Monitor logs and metrics after deployment"
echo ""

# Create .gitignore entry if it doesn't exist
if ! grep -q ".env.production" .gitignore 2>/dev/null; then
    echo ".env.production" >> .gitignore
    print_success "Added .env.production to .gitignore"
fi

# Set proper file permissions
chmod 600 "$PRODUCTION_ENV"
print_success "Set secure file permissions (600) on $PRODUCTION_ENV"

echo ""
print_success "Production environment setup complete!"
echo ""
echo "File location: $PRODUCTION_ENV"
echo ""
