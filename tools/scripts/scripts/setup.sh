#!/usr/bin/env bash
set -euo pipefail
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR/.."

# Ensure Node.js 18+ is installed
if ! command -v node >/dev/null 2>&1 || \
   [ "$(node -v | cut -d'v' -f2 | cut -d'.' -f1)" -lt 18 ]; then
  echo "Installing Node.js 18..."
  curl -fsSL https://deb.nodesource.com/setup_18.x | bash -
  apt-get install -y nodejs
fi

# Optional: check Mailpit
if ! command -v mailpit >/dev/null 2>&1; then
  echo "Mailpit not found – install from https://github.com/axllent/mailpit if needed."
fi

# Install Node dependencies for backend, admin, and comms service
pushd nova-api >/dev/null
npm ci
popd >/dev/null

pushd nova-core >/dev/null
npm ci
popd >/dev/null

if [ -d nova-comms ]; then
  pushd nova-comms >/dev/null
  npm ci
  popd >/dev/null
fi

# Automatically create .env files if they do not exist
missing_env=false
for dir in nova-api nova-core nova-comms; do
  [ -f "$dir/.env" ] || missing_env=true
done
if [ "$missing_env" = true ]; then
  echo "Initializing .env files..."
  ./scripts/init-env.sh
fi

echo "Setup complete. Edit the .env files before starting the services."
echo ""
echo "ℹ️  A default admin user will be automatically created when you start the API:"
echo "   Email: admin@example.com"
echo "   Password: admin"
echo ""
echo "You can create/update admin users manually with:"
echo "   cd nova-api && node create-admin.js [email] [password] [name]"
