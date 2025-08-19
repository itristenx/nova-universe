#!/usr/bin/env bash
set -euo pipefail

# Run Prisma migrations for all schema directories, ensuring required
# environment variables are present. Falls back to DATABASE_URL when
# a schema-specific URL is not provided.

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")"/.. && pwd)"
PRISMA_DIR="$ROOT/prisma"
# shellcheck disable=SC1091
source "$ROOT/scripts/prisma-schemas.sh"

# Use DATABASE_URL as fallback for all datasources
export CORE_DATABASE_URL="${CORE_DATABASE_URL:-$DATABASE_URL}"
export AUTH_DATABASE_URL="${AUTH_DATABASE_URL:-$DATABASE_URL}"
export CMDB_DATABASE_URL="${CMDB_DATABASE_URL:-$DATABASE_URL}"
export INTEGRATION_DATABASE_URL="${INTEGRATION_DATABASE_URL:-$DATABASE_URL}"
export NOTIFICATION_DATABASE_URL="${NOTIFICATION_DATABASE_URL:-$DATABASE_URL}"
export USER360_DATABASE_URL="${USER360_DATABASE_URL:-$DATABASE_URL}"
export AUDIT_DATABASE_URL="${AUDIT_DATABASE_URL:-$DATABASE_URL}"

for schema in "${PRISMA_RELATIONAL_SCHEMAS[@]}"; do
  if [ -f "$PRISMA_DIR/$schema/schema.prisma" ]; then
    echo "Running migrations for $schema schema"
    npx prisma migrate deploy --schema="$PRISMA_DIR/$schema/schema.prisma"
  fi
done

for schema in "${PRISMA_MONGO_SCHEMAS[@]}"; do
  if [ -f "$PRISMA_DIR/$schema/schema.prisma" ]; then
    echo "Pushing schema for $schema"
    npx prisma db push --schema="$PRISMA_DIR/$schema/schema.prisma"
  fi
done
