#!/bin/bash

# Nova Unified Monitoring & Alerting Integration Script
# This script consolidates Nova-Sentinel (Uptime Kuma) and Nova-Alert (GoAlert) 
# into a single unified Nova platform

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"
BACKUP_DIR="$PROJECT_ROOT/backups/unified-monitoring-$(date +%Y%m%d_%H%M%S)"
LOG_FILE="$BACKUP_DIR/integration.log"

# Database configuration
DB_HOST="${DB_HOST:-localhost}"
DB_PORT="${DB_PORT:-5432}"
DB_NAME="${DB_NAME:-nova_universe}"
DB_USER="${DB_USER:-nova_user}"

# Service URLs
UPTIME_KUMA_URL="${UPTIME_KUMA_URL:-http://localhost:3001}"
GOALERT_URL="${GOALERT_URL:-http://localhost:8081}"

echo -e "${BLUE}================================${NC}"
echo -e "${BLUE}Nova Unified Monitoring Integration${NC}"
echo -e "${BLUE}================================${NC}"
echo ""

# Function to log messages
log() {
    echo -e "$1" | tee -a "$LOG_FILE"
}

# Function to check if command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Function to check database connection
check_db_connection() {
    log "${BLUE}Checking database connection...${NC}"
    
    if ! command_exists psql; then
        log "${RED}PostgreSQL client (psql) not found. Please install PostgreSQL client tools.${NC}"
        exit 1
    fi
    
    if ! PGPASSWORD="$DB_PASSWORD" psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$DB_NAME" -c "SELECT 1;" >/dev/null 2>&1; then
        log "${RED}Failed to connect to database. Please check your database credentials.${NC}"
        exit 1
    fi
    
    log "${GREEN}Database connection successful${NC}"
}

# Function to create backup directory
create_backup_dir() {
    log "${BLUE}Creating backup directory...${NC}"
    mkdir -p "$BACKUP_DIR"
    log "${GREEN}Backup directory created: $BACKUP_DIR${NC}"
}

# Function to backup existing data
backup_existing_data() {
    log "${BLUE}Backing up existing monitoring and alerting data...${NC}"
    
    # Backup existing monitors table if it exists
    if PGPASSWORD="$DB_PASSWORD" psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$DB_NAME" -c "\dt monitors" >/dev/null 2>&1; then
        log "${YELLOW}Backing up existing monitors table...${NC}"
        PGPASSWORD="$DB_PASSWORD" pg_dump -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$DB_NAME" -t monitors > "$BACKUP_DIR/monitors_backup.sql"
        log "${GREEN}Monitors backup completed${NC}"
    fi
    
    # Backup existing alerts table if it exists
    if PGPASSWORD="$DB_PASSWORD" psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$DB_NAME" -c "\dt nova_alerts" >/dev/null 2>&1; then
        log "${YELLOW}Backing up existing alerts table...${NC}"
        PGPASSWORD="$DB_PASSWORD" pg_dump -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$DB_NAME" -t nova_alerts > "$BACKUP_DIR/alerts_backup.sql"
        log "${GREEN}Alerts backup completed${NC}"
    fi
    
    # Backup existing uptime kuma data if it exists
    if PGPASSWORD="$DB_PASSWORD" psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$DB_NAME" -c "\dt uptime_kuma_monitors" >/dev/null 2>&1; then
        log "${YELLOW}Backing up existing Uptime Kuma data...${NC}"
        PGPASSWORD="$DB_PASSWORD" pg_dump -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$DB_NAME" -t uptime_kuma_monitors > "$BACKUP_DIR/uptime_kuma_backup.sql"
        log "${GREEN}Uptime Kuma backup completed${NC}"
    fi
    
    # Backup existing GoAlert data if it exists
    if PGPASSWORD="$DB_PASSWORD" psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$DB_NAME" -c "\dt goalert_alerts" >/dev/null 2>&1; then
        log "${YELLOW}Backing up existing GoAlert data...${NC}"
        PGPASSWORD="$DB_PASSWORD" pg_dump -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$DB_NAME" -t goalert_alerts > "$BACKUP_DIR/goalert_backup.sql"
        log "${GREEN}GoAlert backup completed${NC}"
    fi
    
    log "${GREEN}All existing data backed up successfully${NC}"
}

# Function to create unified monitoring schema
create_unified_schema() {
    log "${BLUE}Creating unified monitoring schema...${NC}"
    
    # Create the unified monitoring schema SQL
    cat > "$BACKUP_DIR/unified_schema.sql" << 'EOF'
-- Nova Unified Monitoring & Alerting Schema
-- This schema consolidates Nova-Sentinel and Nova-Alert functionality

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "pgcrypto";
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Enhanced monitors table - Core monitoring configuration
CREATE TABLE IF NOT EXISTS monitors (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    kuma_id VARCHAR(255) UNIQUE, -- Uptime Kuma monitor ID
    goalert_service_id VARCHAR(255), -- GoAlert service ID
    name VARCHAR(255) NOT NULL,
    type VARCHAR(50) NOT NULL CHECK (type IN ('http', 'tcp', 'ping', 'dns', 'push', 'ssl')),
    url TEXT, -- For HTTP/TCP monitors
    hostname VARCHAR(255), -- For ping/DNS monitors  
    port INTEGER, -- For TCP monitors
    tenant_id UUID, -- For Orbit tenant scoping
    tags JSONB DEFAULT '[]', -- Array of tags
    interval_seconds INTEGER DEFAULT 60, -- Check frequency
    timeout_seconds INTEGER DEFAULT 30, -- Request timeout
    retry_interval_seconds INTEGER DEFAULT 60, -- Retry frequency on failure
    max_retries INTEGER DEFAULT 3, -- Max retries before marking down
    status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'paused', 'disabled', 'up', 'down', 'degraded', 'maintenance')),
    alert_enabled BOOLEAN DEFAULT true,
    escalation_policy_id VARCHAR(255),
    alert_settings JSONB DEFAULT '{}',
    integration_metadata JSONB DEFAULT '{}',
    created_by UUID, -- Helix user ID
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Enhanced alerts table - Central alert store bridging GoAlert and Nova
CREATE TABLE IF NOT EXISTS nova_alerts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    monitor_id UUID REFERENCES monitors(id) ON DELETE SET NULL,
    goalert_alert_id VARCHAR(255), -- Reference to GoAlert alert
    service_id VARCHAR(255), -- GoAlert service ID
    summary TEXT NOT NULL,
    description TEXT,
    source VARCHAR(50) NOT NULL CHECK (source IN ('monitoring', 'manual', 'api', 'automated')),
    severity VARCHAR(20) NOT NULL CHECK (severity IN ('low', 'medium', 'high', 'critical')),
    status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'acknowledged', 'resolved', 'closed')),
    component VARCHAR(100),
    assigned_to UUID REFERENCES users(id),
    created_by UUID REFERENCES users(id),
    acknowledged_by UUID REFERENCES users(id),
    resolved_by UUID REFERENCES users(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    acknowledged_at TIMESTAMP,
    resolved_at TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    -- Alert correlation and grouping
    parent_alert_id UUID REFERENCES nova_alerts(id),
    correlation_key VARCHAR(255), -- For grouping related alerts
    escalation_level INTEGER DEFAULT 0,
    -- Metadata and context
    metadata JSONB DEFAULT '{}',
    tags VARCHAR(255)[],
    -- SLA tracking
    response_sla_minutes INTEGER,
    resolution_sla_minutes INTEGER,
    sla_breached BOOLEAN DEFAULT false
);

-- Monitor incidents table - Incident tracking
CREATE TABLE IF NOT EXISTS monitor_incidents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    monitor_id UUID NOT NULL REFERENCES monitors(id) ON DELETE CASCADE,
    ticket_id UUID, -- Link to Nova ticketing system
    status VARCHAR(20) DEFAULT 'open' CHECK (status IN ('open', 'acknowledged', 'investigating', 'resolved')),
    severity VARCHAR(20) DEFAULT 'medium' CHECK (severity IN ('low', 'medium', 'high', 'critical')),
    summary TEXT, -- AI-generated summary from Synth
    description TEXT,
    started_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    acknowledged_at TIMESTAMP,
    resolved_at TIMESTAMP,
    auto_resolved BOOLEAN DEFAULT false,
    metadata JSONB DEFAULT '{}', -- Additional incident data
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Monitor heartbeats table - Historical uptime data
CREATE TABLE IF NOT EXISTS monitor_heartbeats (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    monitor_id UUID NOT NULL REFERENCES monitors(id) ON DELETE CASCADE,
    status VARCHAR(20) NOT NULL CHECK (status IN ('up', 'down', 'degraded', 'maintenance')),
    response_time_ms INTEGER, -- Response time in milliseconds
    status_code INTEGER, -- HTTP status code (if applicable)
    error_message TEXT, -- Error details if failed
    checked_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    important BOOLEAN DEFAULT false, -- Status change indicator
    metadata JSONB DEFAULT '{}' -- Additional check data
);

-- Monitor maintenance table - Scheduled maintenance windows
CREATE TABLE IF NOT EXISTS monitor_maintenance (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    monitor_id UUID NOT NULL REFERENCES monitors(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    start_time TIMESTAMP NOT NULL,
    end_time TIMESTAMP NOT NULL,
    status VARCHAR(20) DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'active', 'completed', 'cancelled')),
    created_by UUID, -- Helix user ID
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- On-call schedules table - Store GoAlert schedule information locally
CREATE TABLE IF NOT EXISTS oncall_schedules (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    goalert_schedule_id VARCHAR(255), -- Reference to GoAlert schedule
    name VARCHAR(255) NOT NULL,
    description TEXT,
    timezone VARCHAR(50) DEFAULT 'UTC',
    active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- On-call schedule users table - Users assigned to schedules
CREATE TABLE IF NOT EXISTS oncall_schedule_users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    schedule_id UUID NOT NULL REFERENCES oncall_schedules(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    role VARCHAR(20) DEFAULT 'primary' CHECK (role IN ('primary', 'secondary', 'backup')),
    start_time TIMESTAMP NOT NULL,
    end_time TIMESTAMP NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Notification channels table - Unified notification configuration
CREATE TABLE IF NOT EXISTS notification_channels (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    type VARCHAR(20) NOT NULL CHECK (type IN ('email', 'slack', 'sms', 'webhook', 'pagerduty')),
    config JSONB NOT NULL, -- Channel-specific configuration
    active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Escalation policies table - Unified escalation configuration
CREATE TABLE IF NOT EXISTS escalation_policies (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    steps JSONB NOT NULL, -- Array of escalation steps
    active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Service health status table - Track health of monitoring services
CREATE TABLE IF NOT EXISTS service_health_status (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    service_name VARCHAR(50) NOT NULL,
    service_type VARCHAR(30) NOT NULL CHECK (service_type IN ('monitoring', 'alerting', 'notification')),
    status VARCHAR(20) DEFAULT 'unknown' CHECK (status IN ('healthy', 'degraded', 'unhealthy', 'unknown', 'maintenance')),
    health_score INTEGER DEFAULT 0 CHECK (health_score >= 0 AND health_score <= 100),
    last_check TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    last_healthy TIMESTAMP,
    error_message TEXT,
    metadata JSONB DEFAULT '{}',
    check_interval_seconds INTEGER DEFAULT 60,
    UNIQUE(service_name)
);

-- Integration configurations table - Central configuration store
CREATE TABLE IF NOT EXISTS integration_configurations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    service_name VARCHAR(50) NOT NULL, -- 'goalert', 'uptime_kuma', 'nova_monitoring'
    config_key VARCHAR(255) NOT NULL,
    config_value JSONB NOT NULL,
    tenant_id UUID, -- For multi-tenant support
    is_encrypted BOOLEAN DEFAULT false, -- For sensitive values
    created_by UUID REFERENCES users(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(service_name, config_key, tenant_id)
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_monitors_status ON monitors(status);
CREATE INDEX IF NOT EXISTS idx_monitors_type ON monitors(type);
CREATE INDEX IF NOT EXISTS idx_monitors_tenant ON monitors(tenant_id);
CREATE INDEX IF NOT EXISTS idx_monitors_tags ON monitors USING GIN(tags);

CREATE INDEX IF NOT EXISTS idx_alerts_status ON nova_alerts(status);
CREATE INDEX IF NOT EXISTS idx_alerts_severity ON nova_alerts(severity);
CREATE INDEX IF NOT EXISTS idx_alerts_created_at ON nova_alerts(created_at);
CREATE INDEX IF NOT EXISTS idx_alerts_monitor_id ON nova_alerts(monitor_id);

CREATE INDEX IF NOT EXISTS idx_heartbeats_monitor_id ON monitor_heartbeats(monitor_id);
CREATE INDEX IF NOT EXISTS idx_heartbeats_checked_at ON monitor_heartbeats(checked_at);
CREATE INDEX IF NOT EXISTS idx_heartbeats_status ON monitor_heartbeats(status);

CREATE INDEX IF NOT EXISTS idx_maintenance_monitor_id ON monitor_maintenance(monitor_id);
CREATE INDEX IF NOT EXISTS idx_maintenance_start_time ON monitor_maintenance(start_time);

-- Create triggers for updated_at timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_monitors_updated_at BEFORE UPDATE ON monitors
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_alerts_updated_at BEFORE UPDATE ON nova_alerts
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_maintenance_updated_at BEFORE UPDATE ON monitor_maintenance
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_schedules_updated_at BEFORE UPDATE ON oncall_schedules
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_channels_updated_at BEFORE UPDATE ON notification_channels
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_policies_updated_at BEFORE UPDATE ON escalation_policies
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
EOF

    # Execute the schema creation
    log "${YELLOW}Executing unified schema creation...${NC}"
    PGPASSWORD="$DB_PASSWORD" psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$DB_NAME" -f "$BACKUP_DIR/unified_schema.sql"
    
    log "${GREEN}Unified monitoring schema created successfully${NC}"
}

# Function to migrate existing Uptime Kuma data
migrate_uptime_kuma_data() {
    log "${BLUE}Migrating existing Uptime Kuma data...${NC}"
    
    # Check if Uptime Kuma data exists
    if ! PGPASSWORD="$DB_PASSWORD" psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$DB_NAME" -c "\dt uptime_kuma_monitors" >/dev/null 2>&1; then
        log "${YELLOW}No existing Uptime Kuma data found, skipping migration${NC}"
        return 0
    fi
    
    # Create migration script
    cat > "$BACKUP_DIR/migrate_uptime_kuma.sql" << 'EOF'
-- Migrate Uptime Kuma monitors to unified monitors table
INSERT INTO monitors (
    kuma_id,
    name,
    type,
    url,
    hostname,
    port,
    interval_seconds,
    timeout_seconds,
    tags,
    status,
    created_at,
    updated_at
)
SELECT 
    id::text as kuma_id,
    name,
    CASE 
        WHEN type = 'http' THEN 'http'
        WHEN type = 'tcp' THEN 'tcp'
        WHEN type = 'ping' THEN 'ping'
        WHEN type = 'dns' THEN 'dns'
        ELSE 'http'
    END as type,
    url,
    hostname,
    port,
    interval,
    timeout,
    COALESCE(tags::jsonb, '[]'::jsonb) as tags,
    CASE 
        WHEN active THEN 'active'
        ELSE 'disabled'
    END as status,
    COALESCE(created_at, CURRENT_TIMESTAMP) as created_at,
    COALESCE(updated_at, CURRENT_TIMESTAMP) as updated_at
FROM uptime_kuma_monitors
ON CONFLICT (kuma_id) DO UPDATE SET
    name = EXCLUDED.name,
    type = EXCLUDED.type,
    url = EXCLUDED.url,
    hostname = EXCLUDED.hostname,
    port = EXCLUDED.port,
    interval_seconds = EXCLUDED.interval_seconds,
    timeout_seconds = EXCLUDED.timeout_seconds,
    tags = EXCLUDED.tags,
    status = EXCLUDED.status,
    updated_at = CURRENT_TIMESTAMP;
EOF

    # Execute migration
    log "${YELLOW}Executing Uptime Kuma data migration...${NC}"
    PGPASSWORD="$DB_PASSWORD" psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$DB_NAME" -f "$BACKUP_DIR/migrate_uptime_kuma.sql"
    
    log "${GREEN}Uptime Kuma data migration completed${NC}"
}

# Function to migrate existing GoAlert data
migrate_goalert_data() {
    log "${BLUE}Migrating existing GoAlert data...${NC}"
    
    # Check if GoAlert data exists
    if ! PGPASSWORD="$DB_PASSWORD" psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$DB_NAME" -c "\dt goalert_alerts" >/dev/null 2>&1; then
        log "${YELLOW}No existing GoAlert data found, skipping migration${NC}"
        return 0
    fi
    
    # Create migration script
    cat > "$BACKUP_DIR/migrate_goalert.sql" << 'EOF'
-- Migrate GoAlert alerts to unified alerts table
INSERT INTO nova_alerts (
    goalert_alert_id,
    summary,
    description,
    source,
    severity,
    status,
    component,
    created_at,
    updated_at
)
SELECT 
    id::text as goalert_alert_id,
    COALESCE(summary, 'GoAlert Alert') as summary,
    COALESCE(details, '') as description,
    'monitoring' as source,
    CASE 
        WHEN priority = 'high' THEN 'high'
        WHEN priority = 'medium' THEN 'medium'
        ELSE 'low'
    END as severity,
    CASE 
        WHEN status = 'active' THEN 'active'
        WHEN status = 'acknowledged' THEN 'acknowledged'
        WHEN status = 'resolved' THEN 'resolved'
        ELSE 'closed'
    END as status,
    COALESCE(service_name, '') as component,
    COALESCE(created_at, CURRENT_TIMESTAMP) as created_at,
    COALESCE(updated_at, CURRENT_TIMESTAMP) as updated_at
FROM goalert_alerts
ON CONFLICT (goalert_alert_id) DO UPDATE SET
    summary = EXCLUDED.summary,
    description = EXCLUDED.description,
    severity = EXCLUDED.severity,
    status = EXCLUDED.status,
    component = EXCLUDED.component,
    updated_at = CURRENT_TIMESTAMP;
EOF

    # Execute migration
    log "${YELLOW}Executing GoAlert data migration...${NC}"
    PGPASSWORD="$DB_PASSWORD" psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$DB_NAME" -f "$BACKUP_DIR/migrate_goalert.sql"
    
    log "${GREEN}GoAlert data migration completed${NC}"
}

# Function to create initial configuration
create_initial_config() {
    log "${BLUE}Creating initial configuration...${NC}"
    
    # Create initial service health status
    cat > "$BACKUP_DIR/initial_config.sql" << 'EOF'
-- Insert initial service health status
INSERT INTO service_health_status (service_name, service_type, status, health_score, last_check, last_healthy)
VALUES 
    ('nova_monitoring', 'monitoring', 'healthy', 100, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    ('nova_alerting', 'alerting', 'healthy', 100, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    ('nova_notification', 'notification', 'healthy', 100, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
ON CONFLICT (service_name) DO UPDATE SET
    status = EXCLUDED.status,
    health_score = EXCLUDED.health_score,
    last_check = EXCLUDED.last_check,
    last_healthy = EXCLUDED.last_healthy;

-- Insert default escalation policy
INSERT INTO escalation_policies (name, description, steps, active)
VALUES (
    'Default Escalation Policy',
    'Default escalation policy for all monitors',
    '[
        {
            "level": 1,
            "delay_minutes": 5,
            "users": [],
            "notification_channels": [],
            "actions": ["notify_team"]
        },
        {
            "level": 2,
            "delay_minutes": 15,
            "users": [],
            "notification_channels": [],
            "actions": ["escalate_to_manager"]
        },
        {
            "level": 3,
            "delay_minutes": 30,
            "users": [],
            "notification_channels": [],
            "actions": ["escalate_to_management"]
        }
    ]'::jsonb,
    true
) ON CONFLICT DO NOTHING;
EOF

    # Execute initial configuration
    log "${YELLOW}Creating initial configuration...${NC}"
    PGPASSWORD="$DB_PASSWORD" psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$DB_NAME" -f "$BACKUP_DIR/initial_config.sql"
    
    log "${GREEN}Initial configuration created successfully${NC}"
}

# Function to verify integration
verify_integration() {
    log "${BLUE}Verifying integration...${NC}"
    
    # Check if unified tables exist
    local tables=("monitors" "nova_alerts" "monitor_incidents" "monitor_heartbeats" "monitor_maintenance")
    
    for table in "${tables[@]}"; do
        if PGPASSWORD="$DB_PASSWORD" psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$DB_NAME" -c "\dt $table" >/dev/null 2>&1; then
            log "${GREEN}✓ Table $table exists${NC}"
        else
            log "${RED}✗ Table $table missing${NC}"
            return 1
        fi
    done
    
    # Check data counts
    local monitor_count=$(PGPASSWORD="$DB_PASSWORD" psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$DB_NAME" -t -c "SELECT COUNT(*) FROM monitors;" | xargs)
    local alert_count=$(PGPASSWORD="$DB_PASSWORD" psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$DB_NAME" -t -c "SELECT COUNT(*) FROM nova_alerts;" | xargs)
    
    log "${GREEN}✓ Integration verification completed${NC}"
    log "${BLUE}  - Monitors: $monitor_count${NC}"
    log "${BLUE}  - Alerts: $alert_count${NC}"
    
    return 0
}

# Function to create integration summary
create_summary() {
    log "${BLUE}Creating integration summary...${NC}"
    
    cat > "$BACKUP_DIR/INTEGRATION_SUMMARY.md" << EOF
# Nova Unified Monitoring & Alerting Integration Summary

## Integration Date
$(date)

## What Was Accomplished

### 1. Database Consolidation
- Created unified monitoring schema that consolidates Nova-Sentinel and Nova-Alert
- Migrated existing Uptime Kuma monitors to unified monitors table
- Migrated existing GoAlert alerts to unified alerts table
- Established data relationships and referential integrity

### 2. Schema Features
- **Unified Monitors**: Single table for all monitoring targets
- **Unified Alerts**: Central alert store with correlation and escalation
- **Incident Management**: Track and manage monitoring incidents
- **Maintenance Windows**: Schedule and manage maintenance
- **On-Call Schedules**: Manage on-call rotations
- **Notification Channels**: Unified notification configuration
- **Escalation Policies**: Configurable alert escalation

### 3. Data Migration
- **Uptime Kuma**: $(PGPASSWORD="$DB_PASSWORD" psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$DB_NAME" -t -c "SELECT COUNT(*) FROM monitors WHERE kuma_id IS NOT NULL;" | xargs) monitors migrated
- **GoAlert**: $(PGPASSWORD="$DB_PASSWORD" psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$DB_NAME" -t -c "SELECT COUNT(*) FROM nova_alerts WHERE goalert_alert_id IS NOT NULL;" | xargs) alerts migrated

### 4. API Endpoints
- **/api/v2/monitoring/monitors** - Unified monitor management
- **/api/v2/monitoring/alerts** - Unified alert management
- **/api/v2/monitoring/system-health** - System health overview
- **/api/v2/monitoring/oncall-schedules** - On-call management
- **/api/v2/monitoring/maintenance-windows** - Maintenance management

### 5. Next Steps
1. **Update Applications**: Point Nova-Sentinel and Nova-Alert to unified API
2. **Test Integration**: Verify all functionality works through unified interface
3. **Deprecate Legacy**: Gradually remove old UIs and APIs
4. **Monitor Performance**: Track system performance and optimize as needed

## Backup Location
All original data has been backed up to: $BACKUP_DIR

## Rollback Instructions
If rollback is needed, restore from backup files:
1. Drop unified tables
2. Restore original tables from backup
3. Update API routing to point back to legacy endpoints

## Support
For issues or questions, contact the Nova development team.
EOF

    log "${GREEN}Integration summary created: $BACKUP_DIR/INTEGRATION_SUMMARY.md${NC}"
}

# Main execution
main() {
    log "${BLUE}Starting Nova Unified Monitoring & Alerting Integration...${NC}"
    log "${BLUE}Timestamp: $(date)${NC}"
    log ""
    
    # Check prerequisites
    if [ -z "$DB_PASSWORD" ]; then
        log "${RED}DB_PASSWORD environment variable is required${NC}"
        log "${YELLOW}Please set DB_PASSWORD and run the script again${NC}"
        exit 1
    fi
    
    # Execute integration steps
    check_db_connection
    create_backup_dir
    backup_existing_data
    create_unified_schema
    migrate_uptime_kuma_data
    migrate_goalert_data
    create_initial_config
    verify_integration
    create_summary
    
    log ""
    log "${GREEN}================================${NC}"
    log "${GREEN}Integration completed successfully!${NC}"
    log "${GREEN}================================${NC}"
    log ""
    log "${BLUE}Next steps:${NC}"
    log "${BLUE}1. Update your applications to use the unified API endpoints${NC}"
    log "${BLUE}2. Test all monitoring and alerting functionality${NC}"
    log "${BLUE}3. Gradually deprecate legacy UIs and APIs${NC}"
    log ""
    log "${BLUE}Backup location: $BACKUP_DIR${NC}"
    log "${BLUE}Integration summary: $BACKUP_DIR/INTEGRATION_SUMMARY.md${NC}"
    log ""
}

# Run main function
main "$@"
