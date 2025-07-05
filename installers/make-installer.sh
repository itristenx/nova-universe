#!/usr/bin/env bash
set -euo pipefail
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR/.."

APP_DIR="cueit-macos"
VERSION="${1:-1.0.0}"
arch="${2:-universal}"
case "$arch" in
  arm64|x64|universal) ;;
  *)
    echo "Usage: $0 <version> [arm64|x64|universal]"
    exit 1
    ;;
esac

npm --prefix "$APP_DIR" install
npm --prefix cueit-admin install
npm --prefix cueit-admin run build
# Install production dependencies so the packaged app works
# without running npm install after copying to /Applications
npm --prefix cueit-api ci --production
npm --prefix cueit-activate ci --production
npm --prefix cueit-slack ci --production
npx --prefix "$APP_DIR" electron-packager "$APP_DIR" CueIT \
  --platform=darwin --arch="$arch" --out "$APP_DIR/dist" --overwrite

APP_PATH="$APP_DIR/dist/CueIT-darwin-$arch/CueIT.app"
PKG_ROOT="$APP_DIR/pkgroot"
mkdir -p "$PKG_ROOT/Applications"

# Copy backend and frontends into the packaged resources directory
RES_DIR="$APP_DIR/dist/CueIT-darwin-$arch/resources"
mkdir -p "$RES_DIR/installers"
cp -R cueit-api cueit-admin cueit-activate cueit-slack design "$RES_DIR/"
cp installers/start-all.sh "$RES_DIR/installers/"
# copy .env.example to .env so the launcher does not need to write inside
# the application bundle on first run
for pkg in cueit-api cueit-admin cueit-activate cueit-slack; do
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
