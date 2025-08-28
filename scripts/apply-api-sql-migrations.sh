#!/usr/bin/env bash
set -euo pipefail

# Apply raw SQL migrations in apps/api/migrations to the nova-postgres container idempotently

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
MIG_DIR="$ROOT_DIR/apps/api/migrations"
PG_CONTAINER="nova-postgres"
PG_DB="${POSTGRES_DB:-nova_universe}"
PG_USER="${POSTGRES_USER:-nova_admin}"

if ! docker ps --format '{{.Names}}' | grep -q "^${PG_CONTAINER}$"; then
  echo "Postgres container '${PG_CONTAINER}' is not running." >&2
  exit 1
fi

apply_file() {
  local file="$1"
  echo "Applying: ${file}"
  # Preprocess: drop inline INDEX clauses (non-Postgres) and fix trailing commas before );
  local processed
  processed=$(mktemp)
  perl -0777 -pe '
    # remove lines that start with INDEX ... (
    s/^\h*INDEX\h+[A-Za-z0-9_]+\h*\([^\n]*\)\h*\n//mg;
    # remove trailing commas before a closing parenthesis in CREATE TABLE blocks
    s/,\s*\)/) /g;
  ' "$file" > "$processed"
  # Guard: skip enhanced monitoring alterations if base table missing
  if [[ "$(basename "$file")" == "003_enhanced_monitoring_schema.sql" ]]; then
    local has_base
    has_base=$(docker exec "$PG_CONTAINER" psql -U "$PG_USER" -d "$PG_DB" -tAc "SELECT to_regclass('public.nova_monitors') IS NOT NULL") || true
    if [[ "$has_base" != "t" ]]; then
      echo "Skipping ${file} (base table public.nova_monitors not found)"
      return 0
    fi
  fi
  if [[ "$(basename "$file")" == "001_init.sql" ]]; then
    # Convert SQLite-style INSERT OR IGNORE to Postgres ON CONFLICT for config table
    perl -0777 -pe "s/INSERT OR IGNORE INTO config \(key, value\) VALUES \(([^;]+)\);/INSERT INTO config (key, value) VALUES (\1) ON CONFLICT (key) DO NOTHING;/g" "$processed" \
      | docker exec -i "$PG_CONTAINER" psql -U "$PG_USER" -d "$PG_DB" -v ON_ERROR_STOP=1
  else
    docker exec -i "$PG_CONTAINER" psql -U "$PG_USER" -d "$PG_DB" -v ON_ERROR_STOP=1 < "$processed"
  fi
  rm -f "$processed"
}

# Core ordered files in root folder (ensure base before dependent)
ORDERED_FILES=(
  "001_init.sql"
  "003_enhanced_monitoring_schema.sql"
  "004_enhanced_app_switcher_schema.sql"
  "008_auth_modernization.sql"
  "009_enhanced_itsm_integration.sql"
  "010_email_communication_tracking.sql"
  "service_catalog_schema.sql"
  "add_enhanced_cmdb_support_groups.sql"
  "012_complete_itsm_schema.sql"
)

for f in "${ORDERED_FILES[@]}"; do
  path="$MIG_DIR/$f"
  if [ -f "$path" ]; then
    apply_file "$path"
  fi
done

# Then apply any versioned postgres subfolder migrations sorted by name
if [ -d "$MIG_DIR/postgresql" ]; then
  find "$MIG_DIR/postgresql" -type f -name "*.sql" | sort | while read -r sql; do
    apply_file "$sql"
  done
fi

echo "All SQL migrations applied."


