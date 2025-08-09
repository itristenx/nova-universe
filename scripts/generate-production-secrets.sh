#!/bin/bash

# Nova Universe Production Secrets Generator
# This script generates cryptographically secure secrets for production deployment

set -euo pipefail

echo "🔐 Nova Universe Production Secrets Generator"
echo "============================================="
echo ""

# Check if openssl is available
if ! command -v openssl &> /dev/null; then
    echo "❌ Error: openssl is required but not installed."
    echo "   Please install openssl and try again."
    exit 1
fi

# Create output file
OUTPUT_FILE="production-secrets.env"
BACKUP_FILE="production-secrets-backup-$(date +%Y%m%d-%H%M%S).env"

# Backup existing file if it exists
if [ -f "$OUTPUT_FILE" ]; then
    echo "📁 Backing up existing secrets to $BACKUP_FILE"
    cp "$OUTPUT_FILE" "$BACKUP_FILE"
fi

echo "🔑 Generating secure production secrets..."
echo ""

# Generate secrets
SESSION_SECRET=$(openssl rand -base64 48 | tr -d "=+/" | cut -c1-32)
JWT_SECRET=$(openssl rand -base64 48 | tr -d "=+/" | cut -c1-32)
ASSET_ENCRYPTION_KEY=$(openssl rand -hex 32)
KIOSK_TOKEN=$(openssl rand -base64 32 | tr -d "=+/")
SCIM_TOKEN=$(openssl rand -base64 32 | tr -d "=+/")

# Database passwords
DB_PASSWORD=$(openssl rand -base64 24 | tr -d "=+/")
MONGO_PASSWORD=$(openssl rand -base64 24 | tr -d "=+/")
REDIS_PASSWORD=$(openssl rand -base64 24 | tr -d "=+/")
ELASTIC_PASSWORD=$(openssl rand -base64 24 | tr -d "=+/")

# Create the secrets file
cat > "$OUTPUT_FILE" << EOF
# Nova Universe Production Secrets
# Generated on: $(date)
# SECURITY WARNING: Keep this file secure and never commit to version control

# ===========================================
# CRITICAL AUTHENTICATION SECRETS
# ===========================================

SESSION_SECRET=$SESSION_SECRET
JWT_SECRET=$JWT_SECRET
ASSET_ENCRYPTION_KEY=$ASSET_ENCRYPTION_KEY

# API Authentication Tokens
KIOSK_TOKEN=$KIOSK_TOKEN
SCIM_TOKEN=$SCIM_TOKEN

# ===========================================
# DATABASE PASSWORDS
# ===========================================

# PostgreSQL
POSTGRES_PASSWORD=$DB_PASSWORD

# MongoDB
MONGO_PASSWORD=$MONGO_PASSWORD

# Redis
REDIS_PASSWORD=$REDIS_PASSWORD

# Elasticsearch
ELASTIC_PASSWORD=$ELASTIC_PASSWORD

# ===========================================
# USAGE INSTRUCTIONS
# ===========================================

# 1. Copy these values to your production .env file
# 2. Update database connection strings with these passwords
# 3. Configure your database servers with these credentials
# 4. Delete this file after copying the secrets
# 5. Never commit these secrets to version control

EOF

echo "✅ Production secrets generated successfully!"
echo ""
echo "📝 Secrets have been written to: $OUTPUT_FILE"
echo ""
echo "⚠️  IMPORTANT SECURITY NOTES:"
echo "   • These secrets are cryptographically secure and unique"
echo "   • Copy them to your production environment immediately"
echo "   • Delete this file after copying the secrets"
echo "   • Never commit these secrets to version control"
echo "   • Store them securely in your deployment system"
echo ""
echo "🔒 Secret lengths generated:"
echo "   • SESSION_SECRET: ${#SESSION_SECRET} characters"
echo "   • JWT_SECRET: ${#JWT_SECRET} characters"
echo "   • ASSET_ENCRYPTION_KEY: ${#ASSET_ENCRYPTION_KEY} characters"
echo "   • Database passwords: 24+ characters each"
echo ""

# Set secure permissions
chmod 600 "$OUTPUT_FILE"
echo "🛡️  File permissions set to 600 (owner read/write only)"
echo ""
echo "🚀 Ready for production deployment!"
