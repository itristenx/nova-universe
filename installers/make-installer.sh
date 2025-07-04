#!/usr/bin/env bash
set -euo pipefail
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR/.."

APP_DIR="cueit-macos"
VERSION="${1:-1.0.0}"

arch=$(uname -m)
if [[ "$arch" == "x86_64" ]]; then
  arch="x64"
fi

npm --prefix "$APP_DIR" install
npx --prefix "$APP_DIR" electron-packager "$APP_DIR" CueIT \
  --platform=darwin --arch="$arch" --out "$APP_DIR/dist" --overwrite

APP_PATH="$APP_DIR/dist/CueIT-darwin-$arch/CueIT.app"

mkdir -p "$APP_DIR/dist/CueIT-darwin-$arch/resources"
cp -R cueit-api cueit-admin cueit-activate cueit-slack installers/start-all.sh "$APP_DIR/dist/CueIT-darwin-$arch/resources/"
if [[ -f cert.pem && -f key.pem ]]; then
  cp cert.pem key.pem "$APP_DIR/dist/CueIT-darwin-$arch/resources/"
fi

pkgbuild --root "$APP_PATH" --identifier com.cueit.launcher \
  --version "$VERSION" "$APP_DIR/CueIT.pkg"
productbuild --package "$APP_DIR/CueIT.pkg" "$APP_DIR/CueIT-$VERSION.pkg"

echo "Installer created at $APP_DIR/CueIT-$VERSION.pkg"
