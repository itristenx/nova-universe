#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR"

PKG_ARG="${1:-}"

if [[ -n "$PKG_ARG" && "$PKG_ARG" == *.pkg ]]; then
  PKG_PATH="$PKG_ARG"
else
  VERSION="${PKG_ARG:-1.0.0}"
  ./make-installer.sh "$VERSION"
  PKG_PATH="../cueit-macos/CueIT-$VERSION.pkg"
fi

./uninstall-macos.sh

if [[ -f "$PKG_PATH" ]]; then
  sudo installer -pkg "$PKG_PATH" -target /
else
  echo "Package $PKG_PATH not found" >&2
  exit 1
fi

