#!/bin/bash
set -e

# Create .env files next to any .env.example found in immediate subdirectories
for app in */ ; do
  # remove trailing slash
  app=${app%/}
  example="$app/.env.example"
  env="$app/.env"
  if [ -f "$example" ]; then
    if [ ! -f "$env" ]; then
      cp "$example" "$env"
      echo "Created $env. Remember to edit the values." >&2
    fi
  fi
done
