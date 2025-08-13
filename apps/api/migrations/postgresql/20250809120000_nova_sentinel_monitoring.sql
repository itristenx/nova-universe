-- Migration: Nova Sentinel Monitoring System
-- Created: 2025-08-09T12:00:00.000Z
-- Description: Creates monitoring tables for Nova Sentinel (Uptime Kuma integration)

-- monitors table - Core monitoring configuration
CREATE TABLE IF NOT EXISTS monitors (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    kuma_id VARCHAR(255) UNIQUE, -- Uptime Kuma monitor ID
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
    status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'paused', 'disabled')),
    created_by UUID, -- Helix user ID
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    -- HTTP specific settings
    http_method VARCHAR(10) DEFAULT 'GET',
    http_headers JSONB DEFAULT '{}',
    http_body TEXT,
    accepted_status_codes JSONB DEFAULT '[200, 201, 202, 203, 204]',
    follow_redirects BOOLEAN DEFAULT true,
    ignore_ssl BOOLEAN DEFAULT false,
    -- Advanced settings
    notification_settings JSONB DEFAULT '{}',
    maintenance_windows JSONB DEFAULT '[]'
);

-- monitor_incidents table - Incident tracking
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

-- monitor_subscriptions table - User notifications
CREATE TABLE IF NOT EXISTS monitor_subscriptions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    monitor_id UUID NOT NULL REFERENCES monitors(id) ON DELETE CASCADE,
    user_id UUID NOT NULL, -- Helix user ID
    notification_type VARCHAR(20) DEFAULT 'email' CHECK (notification_type IN ('email', 'slack', 'sms', 'push')),
    notification_config JSONB DEFAULT '{}', -- Channel-specific config
    active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(monitor_id, user_id, notification_type)
);

-- monitor_heartbeats table - Historical uptime data
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

-- monitor_maintenance table - Scheduled maintenance windows
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

-- monitor_groups table - Logical grouping for Orbit displays
CREATE TABLE IF NOT EXISTS monitor_groups (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    tenant_id UUID, -- For Orbit tenant scoping
    color VARCHAR(7) DEFAULT '#3B82F6', -- Hex color for UI
    sort_order INTEGER DEFAULT 0,
    public_visible BOOLEAN DEFAULT false, -- Show on public status pages
    created_by UUID, -- Helix user ID
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- monitor_group_members table - Many-to-many relationship
CREATE TABLE IF NOT EXISTS monitor_group_members (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    group_id UUID NOT NULL REFERENCES monitor_groups(id) ON DELETE CASCADE,
    monitor_id UUID NOT NULL REFERENCES monitors(id) ON DELETE CASCADE,
    sort_order INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(group_id, monitor_id)
);

-- status_page_configs table - Orbit status page configurations
CREATE TABLE IF NOT EXISTS status_page_configs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID UNIQUE, -- One config per tenant
    title VARCHAR(255) DEFAULT 'Service Status',
    description TEXT,
    logo_url TEXT,
    primary_color VARCHAR(7) DEFAULT '#3B82F6',
    theme VARCHAR(10) DEFAULT 'light' CHECK (theme IN ('light', 'dark', 'auto')),
    show_uptime_stats BOOLEAN DEFAULT true,
    show_incident_history BOOLEAN DEFAULT true,
    banner_enabled BOOLEAN DEFAULT true,
    banner_message TEXT,
    banner_severity VARCHAR(20) DEFAULT 'info' CHECK (banner_severity IN ('info', 'warning', 'error', 'success')),
    custom_css TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_monitors_tenant_id ON monitors(tenant_id);
CREATE INDEX IF NOT EXISTS idx_monitors_kuma_id ON monitors(kuma_id);
CREATE INDEX IF NOT EXISTS idx_monitors_status ON monitors(status);
CREATE INDEX IF NOT EXISTS idx_monitors_type ON monitors(type);
CREATE INDEX IF NOT EXISTS idx_monitors_created_by ON monitors(created_by);

CREATE INDEX IF NOT EXISTS idx_monitor_incidents_monitor_id ON monitor_incidents(monitor_id);
CREATE INDEX IF NOT EXISTS idx_monitor_incidents_status ON monitor_incidents(status);
CREATE INDEX IF NOT EXISTS idx_monitor_incidents_severity ON monitor_incidents(severity);
CREATE INDEX IF NOT EXISTS idx_monitor_incidents_started_at ON monitor_incidents(started_at);

CREATE INDEX IF NOT EXISTS idx_monitor_subscriptions_monitor_id ON monitor_subscriptions(monitor_id);
CREATE INDEX IF NOT EXISTS idx_monitor_subscriptions_user_id ON monitor_subscriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_monitor_subscriptions_active ON monitor_subscriptions(active);

CREATE INDEX IF NOT EXISTS idx_monitor_heartbeats_monitor_id ON monitor_heartbeats(monitor_id);
CREATE INDEX IF NOT EXISTS idx_monitor_heartbeats_checked_at ON monitor_heartbeats(checked_at);
CREATE INDEX IF NOT EXISTS idx_monitor_heartbeats_status ON monitor_heartbeats(status);
CREATE INDEX IF NOT EXISTS idx_monitor_heartbeats_important ON monitor_heartbeats(important);

CREATE INDEX IF NOT EXISTS idx_monitor_maintenance_monitor_id ON monitor_maintenance(monitor_id);
CREATE INDEX IF NOT EXISTS idx_monitor_maintenance_status ON monitor_maintenance(status);
CREATE INDEX IF NOT EXISTS idx_monitor_maintenance_start_time ON monitor_maintenance(start_time);

CREATE INDEX IF NOT EXISTS idx_monitor_groups_tenant_id ON monitor_groups(tenant_id);
CREATE INDEX IF NOT EXISTS idx_monitor_groups_public_visible ON monitor_groups(public_visible);

CREATE INDEX IF NOT EXISTS idx_status_page_configs_tenant_id ON status_page_configs(tenant_id);

-- Create trigger function for updated_at timestamps
CREATE OR REPLACE FUNCTION update_monitoring_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at columns
CREATE TRIGGER update_monitors_updated_at 
    BEFORE UPDATE ON monitors 
    FOR EACH ROW EXECUTE FUNCTION update_monitoring_updated_at_column();

CREATE TRIGGER update_monitor_incidents_updated_at 
    BEFORE UPDATE ON monitor_incidents 
    FOR EACH ROW EXECUTE FUNCTION update_monitoring_updated_at_column();

CREATE TRIGGER update_monitor_subscriptions_updated_at 
    BEFORE UPDATE ON monitor_subscriptions 
    FOR EACH ROW EXECUTE FUNCTION update_monitoring_updated_at_column();

CREATE TRIGGER update_monitor_maintenance_updated_at 
    BEFORE UPDATE ON monitor_maintenance 
    FOR EACH ROW EXECUTE FUNCTION update_monitoring_updated_at_column();

CREATE TRIGGER update_monitor_groups_updated_at 
    BEFORE UPDATE ON monitor_groups 
    FOR EACH ROW EXECUTE FUNCTION update_monitoring_updated_at_column();

CREATE TRIGGER update_status_page_configs_updated_at 
    BEFORE UPDATE ON status_page_configs 
    FOR EACH ROW EXECUTE FUNCTION update_monitoring_updated_at_column();

-- Insert default configuration
INSERT INTO config (key, value, category, description, is_public) VALUES 
('monitoring.enabled', 'true', 'monitoring', 'Enable Nova Sentinel monitoring system', false),
('monitoring.kuma.host', 'localhost', 'monitoring', 'Uptime Kuma host for API integration', false),
('monitoring.kuma.port', '3001', 'monitoring', 'Uptime Kuma port for API integration', false),
('monitoring.kuma.api_key', '', 'monitoring', 'Uptime Kuma API key for authentication', false),
('monitoring.webhook_secret', '', 'monitoring', 'Webhook secret for Kuma -> Nova events', false),
('monitoring.default_check_interval', '60', 'monitoring', 'Default monitoring check interval (seconds)', false),
('monitoring.retention_days', '90', 'monitoring', 'Days to retain heartbeat data', false),
('monitoring.incident_auto_resolve', 'true', 'monitoring', 'Auto-resolve incidents when service recovers', false),
('monitoring.notification_cooldown', '300', 'monitoring', 'Minimum seconds between notifications for same incident', false)
ON CONFLICT (key) DO NOTHING;

-- Rollback instructions:
-- DROP TABLE IF EXISTS monitor_group_members CASCADE;
-- DROP TABLE IF EXISTS status_page_configs CASCADE;
-- DROP TABLE IF EXISTS monitor_groups CASCADE;
-- DROP TABLE IF EXISTS monitor_maintenance CASCADE;
-- DROP TABLE IF EXISTS monitor_heartbeats CASCADE;
-- DROP TABLE IF EXISTS monitor_subscriptions CASCADE;
-- DROP TABLE IF EXISTS monitor_incidents CASCADE;
-- DROP TABLE IF EXISTS monitors CASCADE;
-- DROP FUNCTION IF EXISTS update_monitoring_updated_at_column();
-- DELETE FROM config WHERE category = 'monitoring';
