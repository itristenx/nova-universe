#!/usr/bin/env bash
set -euo pipefail

# Ensure Node.js 18+ is installed
if ! command -v node >/dev/null 2>&1 || \
   [ "$(node -v | cut -d'v' -f2 | cut -d'.' -f1)" -lt 18 ]; then
  echo "Installing Node.js 18..."
  curl -fsSL https://deb.nodesource.com/setup_18.x | bash -
  apt-get install -y nodejs
fi

# Install sqlite3 if missing
if ! command -v sqlite3 >/dev/null 2>&1; then
  echo "Installing sqlite3..."
  apt-get update && apt-get install -y sqlite3
fi

# Optional: check Mailpit
if ! command -v mailpit >/dev/null 2>&1; then
  echo "Mailpit not found – install from https://github.com/axllent/mailpit if needed."
fi

# Install Node dependencies for backend, admin, activate page and Slack service
pushd cueit-backend >/dev/null
npm ci
popd >/dev/null

pushd cueit-admin >/dev/null
npm ci
popd >/dev/null

if [ -d cueit-activate ]; then
  pushd cueit-activate >/dev/null
  npm ci
  popd >/dev/null
fi

if [ -d cueit-slack ]; then
  pushd cueit-slack >/dev/null
  npm ci
  popd >/dev/null
fi

echo "Setup complete."
