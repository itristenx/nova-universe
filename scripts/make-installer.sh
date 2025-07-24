#!/usr/bin/env bash
set -euo pipefail
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR/.."

VERSION="${1:-1.0.0}"

# Copy backend and frontends into the packaged resources directory
RES_DIR="./dist/resources"
mkdir -p "$RES_DIR/installers"
cp -R nova-api nova-core nova-comms design "$RES_DIR/"
cp installers/start-all.sh "$RES_DIR/installers/"
# copy .env.example to .env so the launcher does not need to write inside
# the application bundle on first run
for pkg in nova-api nova-core nova-comms; do
  cp "$pkg/.env.example" "$RES_DIR/$pkg/.env"
done
# Include certificates if present
if [[ -f cert.pem && -f key.pem ]]; then
  cp cert.pem key.pem "$RES_DIR/"
fi

echo "Installer resources prepared at $RES_DIR"
