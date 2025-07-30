#!/bin/bash
set -e

apps=("apps/api" "apps/core/nova-core" "apps/comms/nova-comms")

for app in "${apps[@]}"; do
  example="$app/.env.example"
  env="$app/.env"
  if [ -f "$env" ]; then
    continue
  fi

  if [ -f "$example" ]; then
    cp "$example" "$env"
    echo "Created $env. Remember to edit the values." >&2
  elif [ -f ".env.example" ]; then
    cp .env.example "$env"
    echo "Copied root .env.example to $env. Edit the values." >&2
  fi
done
