#!/usr/bin/env bash
set -euo pipefail

APP_PATH="/Applications/CueIT.app"

if [[ -d "$APP_PATH" ]]; then
  echo "Removing $APP_PATH..."
  rm -rf "$APP_PATH"
  echo "CueIT uninstalled."
else
  echo "CueIT not found at $APP_PATH."
fi

