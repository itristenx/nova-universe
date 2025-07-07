#!/usr/bin/env bash
set -euo pipefail
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR/.."

APP_DIR="cueit-macos"
VERSION="${1:-1.0.0}"

npm --prefix "$APP_DIR" install
npm --prefix cueit-admin install
npm --prefix cueit-admin run build
npx --prefix "$APP_DIR" electron-packager "$APP_DIR" CueIT \
  --platform=linux --out "$APP_DIR/dist" --overwrite

APP_PATH="$APP_DIR/dist/CueIT-linux-x64"
if [[ -f cert.pem && -f key.pem ]]; then
  cp cert.pem key.pem "$APP_PATH"/
fi

if ! command -v electron-installer-appimage >/dev/null 2>&1; then
  echo "Installing electron-installer-appimage..."
  npm install -g electron-installer-appimage
fi

CONFIG=$(mktemp)
cat <<JSON > "$CONFIG"
{
  "productName": "CueIT",
  "genericName": "CueIT",
  "productVersion": "$VERSION"
}
JSON

electron-installer-appimage --src "$APP_PATH" --dest "$APP_DIR" --arch x64 --config "$CONFIG"
rm "$CONFIG"

mv "$APP_DIR/CueIT-x86_64.AppImage" "$APP_DIR/CueIT-$VERSION-x86_64.AppImage"

echo "Installer created at $APP_DIR/CueIT-$VERSION-x86_64.AppImage"
