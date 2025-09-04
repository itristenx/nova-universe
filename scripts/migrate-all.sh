#!/usr/bin/env bash
set -euo pipefail

# Run Prisma migrate deploy across all schemas used by the API
# Intended to be executed inside the nova-api image/container

SCHEMAS=(
  core
  auth
  cmdb
  integration
  notification
  user360
)

echo "🔧 Running Prisma migrations..."
for s in "${SCHEMAS[@]}"; do
  schema_path="prisma/${s}/schema.prisma"
  if [[ -f "$schema_path" ]]; then
    echo "➡️  Migrating schema: $schema_path"
    npx prisma migrate deploy --schema "$schema_path"
    npx prisma generate --schema "$schema_path" || true
  else
    echo "⚠️  Schema not found (skipping): $schema_path"
  fi
done

echo "✅ Prisma migrations completed"

