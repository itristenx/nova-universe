#!/usr/bin/env bash
set -euo pipefail

# Run Prisma migrations for all schema directories, ensuring required
# environment variables are present. Falls back to DATABASE_URL when
# a schema-specific URL is not provided.

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")"/.. && pwd)"
PRISMA_DIR="$ROOT/prisma"

# Use DATABASE_URL as fallback for all datasources
export CORE_DATABASE_URL="${CORE_DATABASE_URL:-$DATABASE_URL}"
export AUTH_DATABASE_URL="${AUTH_DATABASE_URL:-$DATABASE_URL}"
export CMDB_DATABASE_URL="${CMDB_DATABASE_URL:-$DATABASE_URL}"
export INTEGRATION_DATABASE_URL="${INTEGRATION_DATABASE_URL:-$DATABASE_URL}"
export NOTIFICATION_DATABASE_URL="${NOTIFICATION_DATABASE_URL:-$DATABASE_URL}"
export USER360_DATABASE_URL="${USER360_DATABASE_URL:-$DATABASE_URL}"
export AUDIT_DATABASE_URL="${AUDIT_DATABASE_URL:-$DATABASE_URL}"

schemas=(core auth cmdb integration notification user360)
for schema in "${schemas[@]}"; do
  if [ -f "$PRISMA_DIR/$schema/schema.prisma" ]; then
    echo "Running migrations for $schema schema"
    npx prisma migrate deploy --schema="$PRISMA_DIR/$schema/schema.prisma"
  fi
done

# Mongo schemas use db push instead of migrate deploy
if [ -f "$PRISMA_DIR/audit/schema.prisma" ]; then
  echo "Pushing schema for audit"
  npx prisma db push --schema="$PRISMA_DIR/audit/schema.prisma"
fi
