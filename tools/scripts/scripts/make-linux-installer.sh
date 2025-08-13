#!/usr/bin/env bash
set -euo pipefail
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR/.."

VERSION="${1:-1.0.0}"

npm --prefix nova-core install
npm --prefix nova-core run build

RES_DIR="./dist/resources"
mkdir -p "$RES_DIR/installers"
cp -R nova-api nova-core nova-comms design "$RES_DIR/"
cp scripts/start-all.sh "$RES_DIR/installers/"
for pkg in nova-api nova-core nova-comms; do
  cp "$pkg/.env.example" "$RES_DIR/$pkg/.env"
done
if [[ -f cert.pem && -f key.pem ]]; then
  cp cert.pem key.pem "$RES_DIR/"
fi

echo "Linux installer resources prepared at $RES_DIR"
