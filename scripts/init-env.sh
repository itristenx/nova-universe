#!/bin/bash
set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd "$SCRIPT_DIR/../.." && pwd)"

apps=("$REPO_ROOT/apps/api" "$REPO_ROOT/apps/core/nova-core" "$REPO_ROOT/apps/comms/nova-comms")

for app in "${apps[@]}"; do
  example="$app/.env.example"
  env="$app/.env"
  root_example="$REPO_ROOT/.env.example"

  if [ -f "$example" ]; then
    [ -f "$env" ] || {
      cp "$example" "$env"
      echo "Created $env. Remember to edit the values." >&2
    }
  elif [ -f "$root_example" ]; then
    [ -f "$env" ] || {
      cp "$root_example" "$env"
      echo "Copied root .env.example to $env. Edit the values." >&2
    }
  fi
done
