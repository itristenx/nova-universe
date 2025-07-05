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
npx --prefix "$APP_DIR" electron-packager "$APP_DIR" CueIT \
  --platform=darwin --arch="$arch" --out "$APP_DIR/dist" --overwrite

APP_PATH="$APP_DIR/dist/CueIT-darwin-$arch/CueIT.app"

RES_DIR="$APP_DIR/dist/CueIT-darwin-$arch/resources"
mkdir -p "$RES_DIR/installers"
cp -R cueit-api cueit-admin cueit-activate cueit-slack design "$RES_DIR/"
cp installers/start-all.sh "$RES_DIR/installers/"
# copy .env.example to .env so the launcher does not need to write inside
# the application bundle on first run
for pkg in cueit-api cueit-admin cueit-activate cueit-slack; do
  cp "$pkg/.env.example" "$RES_DIR/$pkg/.env"
done
if [[ -f cert.pem && -f key.pem ]]; then
  cp cert.pem key.pem "$RES_DIR/"
fi

pkgbuild --root "$APP_PATH" --install-location /Applications \
  --identifier com.cueit.launcher --version "$VERSION" "$APP_DIR/CueIT.pkg"
productbuild --package "$APP_DIR/CueIT.pkg" "$APP_DIR/CueIT-$VERSION.pkg"
rm "$APP_DIR/CueIT.pkg"

echo "Installer created at $APP_DIR/CueIT-$VERSION.pkg"
