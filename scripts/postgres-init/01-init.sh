#!/bin/bash
# PostgreSQL initialization script for Docker
# This script sets up the initial database with proper security

set -e

# Create application user with limited privileges
psql -v ON_ERROR_STOP=1 --username "$POSTGRES_USER" --dbname "$POSTGRES_DB" <<-EOSQL
    -- Create read-only user for monitoring
    CREATE USER nova_readonly WITH PASSWORD 'readonly_pass_2024';
    GRANT CONNECT ON DATABASE $POSTGRES_DB TO nova_readonly;
    GRANT USAGE ON SCHEMA public TO nova_readonly;
    GRANT SELECT ON ALL TABLES IN SCHEMA public TO nova_readonly;
    ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT SELECT ON TABLES TO nova_readonly;

    -- Create backup user
    CREATE USER nova_backup WITH PASSWORD 'backup_pass_2024';
    GRANT CONNECT ON DATABASE $POSTGRES_DB TO nova_backup;
    GRANT USAGE ON SCHEMA public TO nova_backup;
    GRANT SELECT ON ALL TABLES IN SCHEMA public TO nova_backup;
    ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT SELECT ON TABLES TO nova_backup;

    -- Enable required extensions
    CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
    CREATE EXTENSION IF NOT EXISTS "pgcrypto";
    CREATE EXTENSION IF NOT EXISTS "pg_stat_statements";

    -- Set timezone
    SET timezone = 'UTC';

    -- Configure security settings
    ALTER SYSTEM SET log_statement = 'all';
    ALTER SYSTEM SET log_min_duration_statement = 100;
    ALTER SYSTEM SET log_connections = on;
    ALTER SYSTEM SET log_disconnections = on;
    ALTER SYSTEM SET log_line_prefix = '%t [%p]: [%l-1] user=%u,db=%d,app=%a,client=%h ';

EOSQL

echo "PostgreSQL initialization completed successfully"
