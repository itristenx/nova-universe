#!/usr/bin/env bash
set -euo pipefail
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd "$SCRIPT_DIR/../.." && pwd)"
cd "$REPO_ROOT"

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
nova_api_dir="apps/api"
nova_core_dir="apps/core/nova-core"
nova_comms_dir="apps/comms/nova-comms"

pushd "$nova_api_dir" >/dev/null
npm ci
popd >/dev/null

pushd "$nova_core_dir" >/dev/null
npm ci
popd >/dev/null

if [ -d "$nova_comms_dir" ]; then
  pushd "$nova_comms_dir" >/dev/null
  npm ci
  popd >/dev/null
fi

# Automatically create .env files if they do not exist
missing_env=false
for dir in "$nova_api_dir" "$nova_core_dir" "$nova_comms_dir"; do
  [ -f "$dir/.env" ] || missing_env=true
done
if [ "$missing_env" = true ]; then
  echo "Initializing .env files..."
  ./tools/scripts/scripts/init-env.sh
fi

echo "Setup complete. Edit the .env files before starting the services."
echo ""
echo "ℹ️  A default admin user will be automatically created when you start the API:"
echo "   Email: admin@example.com"
echo "   Password: admin"
echo ""
echo "You can create/update admin users manually with:"
echo "   cd $nova_api_dir && node create-admin.js [email] [password] [name]"
