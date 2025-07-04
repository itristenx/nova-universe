#!/bin/bash
set -e

apps=(cueit-api cueit-admin cueit-activate cueit-slack)

for app in "${apps[@]}"; do
  example="$app/.env.example"
  env="$app/.env"
  if [ -f "$example" ]; then
    if [ ! -f "$env" ]; then
      cp "$example" "$env"
      echo "Created $env. Remember to edit the values." >&2
    fi
  fi
done
