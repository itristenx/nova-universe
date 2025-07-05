#!/usr/bin/env bash
set -euo pipefail
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR/.."

APP_DIR="cueit-macos-swift"
VERSION="${1:-1.0.0}"

# Build the SwiftUI app
xcodebuild -project "$APP_DIR/CueITLauncher.xcodeproj" -scheme CueITLauncher -configuration Release -derivedDataPath "$APP_DIR/build" > /dev/null

npm --prefix cueit-admin install
npm --prefix cueit-admin run build
npm --prefix cueit-api ci --production
npm --prefix cueit-activate ci --production
npm --prefix cueit-slack ci --production

APP_PATH="$APP_DIR/build/Build/Products/Release/CueITLauncher.app"
PKG_ROOT="$APP_DIR/pkgroot"
mkdir -p "$PKG_ROOT/Applications"

RES_DIR="$APP_PATH/Contents/Resources"
mkdir -p "$RES_DIR/installers"
cp -R cueit-api cueit-admin cueit-activate cueit-slack design "$RES_DIR/"
cp installers/start-all.sh "$RES_DIR/installers/start-services.sh"
for pkg in cueit-api cueit-admin cueit-activate cueit-slack; do
  cp "$pkg/.env.example" "$RES_DIR/$pkg/.env"
done
if [[ -f cert.pem && -f key.pem ]]; then
  cp cert.pem key.pem "$RES_DIR/"
fi

cp -R "$APP_PATH" "$PKG_ROOT/Applications/"
pkgbuild --root "$PKG_ROOT" --install-location / \
  --identifier com.cueit.launcher --version "$VERSION" "$APP_DIR/CueIT.pkg"
productbuild --package "$APP_DIR/CueIT.pkg" "$APP_DIR/CueIT-$VERSION.pkg"
rm -rf "$PKG_ROOT" "$APP_DIR/CueIT.pkg"

echo "Installer created at $APP_DIR/CueIT-$VERSION.pkg"
