#!/usr/bin/env bash
set -euo pipefail
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR/.."

APP_DIR="cueit-macos-swift"
VERSION="${1:-1.0.0}"

echo "Building SwiftUI app..."
xcodebuild -project "$APP_DIR/CueIT.xcodeproj" -scheme CueITApp -configuration Release -derivedDataPath "$APP_DIR/build" >/dev/null

APP_PATH="$APP_DIR/build/Build/Products/Release/CueIT.app"
PKG_ROOT="$APP_DIR/pkgroot"
mkdir -p "$PKG_ROOT/Applications"

# Copy backend and frontends into the packaged resources directory
RES_DIR="$APP_PATH/Contents/Resources"
mkdir -p "$RES_DIR/installers"
cp -R cueit-api cueit-admin cueit-slack design "$RES_DIR/"
cp installers/start-all.sh "$RES_DIR/installers/"
# copy .env.example to .env so the launcher does not need to write inside
# the application bundle on first run
for pkg in cueit-api cueit-admin cueit-slack; do
  cp "$pkg/.env.example" "$RES_DIR/$pkg/.env"
done
# Include certificates if present
if [[ -f cert.pem && -f key.pem ]]; then
  cp cert.pem key.pem "$RES_DIR/"
fi

# Create a temporary packaging root so pkgbuild installs to /Applications
cp -R "$APP_PATH" "$PKG_ROOT/Applications/"
pkgbuild --root "$PKG_ROOT" --install-location / \
  --identifier com.cueit.launcher --version "$VERSION" "$APP_DIR/CueIT.pkg"
productbuild --package "$APP_DIR/CueIT.pkg" "$APP_DIR/CueIT-$VERSION.pkg"
rm -rf "$PKG_ROOT" "$APP_DIR/CueIT.pkg"

echo "Installer created at $APP_DIR/CueIT-$VERSION.pkg"
