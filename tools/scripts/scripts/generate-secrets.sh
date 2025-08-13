#!/bin/bash
# Generate secure random secrets for Nova Universe environment

set -e

# Function to generate secure random string
generate_secret() {
    local length=${1:-32}
    openssl rand -base64 $((length * 3 / 4)) | tr -d '\n'
}

# Generate secrets
SESSION_SECRET=$(generate_secret 64)
JWT_SECRET=$(generate_secret 64)
KIOSK_TOKEN=$(generate_secret 32)
ADMIN_PASSWORD=$(generate_secret 16)

echo "Generated secure secrets:"
echo "SESSION_SECRET=$SESSION_SECRET"
echo "JWT_SECRET=$JWT_SECRET"
echo "KIOSK_TOKEN=$KIOSK_TOKEN"
echo "ADMIN_PASSWORD=$ADMIN_PASSWORD"
echo ""
echo "Save these values securely and add them to your .env files!"
echo ""
echo "SECURITY WARNING: These secrets are displayed only once."
echo "Store them in a secure password manager immediately."
