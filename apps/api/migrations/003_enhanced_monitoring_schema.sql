-- Nova Sentinel Enhanced Database Schema
-- Adding all missing tables and columns for complete Uptime Kuma feature parity

-- Extend monitor types and add new columns
ALTER TABLE nova_monitors 
ADD COLUMN IF NOT EXISTS keyword TEXT,
ADD COLUMN IF NOT EXISTS keyword_inverted BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS json_path TEXT,
ADD COLUMN IF NOT EXISTS expected_value TEXT,
ADD COLUMN IF NOT EXISTS docker_container TEXT,
ADD COLUMN IF NOT EXISTS docker_host TEXT DEFAULT 'unix:///var/run/docker.sock',
ADD COLUMN IF NOT EXISTS steam_id TEXT,
ADD COLUMN IF NOT EXISTS ssl_days_remaining INTEGER DEFAULT 30,
ADD COLUMN IF NOT EXISTS auth_method TEXT DEFAULT 'none',
ADD COLUMN IF NOT EXISTS auth_username TEXT,
ADD COLUMN IF NOT EXISTS auth_password TEXT,
ADD COLUMN IF NOT EXISTS auth_token TEXT,
ADD COLUMN IF NOT EXISTS auth_domain TEXT,
ADD COLUMN IF NOT EXISTS proxy_id TEXT,
ADD COLUMN IF NOT EXISTS certificate_info JSONB,
ADD COLUMN IF NOT EXISTS push_token TEXT, -- For push monitoring
ADD COLUMN IF NOT EXISTS upside_down BOOLEAN DEFAULT FALSE, -- Invert status
ADD COLUMN IF NOT EXISTS description TEXT,
ADD COLUMN IF NOT EXISTS group_name TEXT,
ADD COLUMN IF NOT EXISTS weight INTEGER DEFAULT 1000; -- For sorting

-- Update monitor type enum to include all new types
ALTER TABLE nova_monitors 
ALTER COLUMN type TYPE TEXT;

-- Add comment for supported monitor types
COMMENT ON COLUMN nova_monitors.type IS 'Supported types: http, tcp, ping, dns, ssl, keyword, json-query, docker, steam, grpc, mqtt, radius, push';

-- Add minimum interval constraint (20 seconds like Uptime Kuma)
ALTER TABLE nova_monitors 
ADD CONSTRAINT min_interval_check CHECK (interval_seconds >= 20);

-- Tags table
CREATE TABLE IF NOT EXISTS nova_tags (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    name TEXT NOT NULL,
    color TEXT NOT NULL DEFAULT '#007AFF',
    description TEXT,
    tenant_id TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(name, tenant_id)
);

-- Monitor tags relationship
CREATE TABLE IF NOT EXISTS nova_monitor_tags (
    monitor_id TEXT NOT NULL REFERENCES nova_monitors(id) ON DELETE CASCADE,
    tag_id TEXT NOT NULL REFERENCES nova_tags(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    PRIMARY KEY (monitor_id, tag_id)
);

-- Maintenance windows
CREATE TABLE IF NOT EXISTS nova_maintenance_windows (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    title TEXT NOT NULL,
    description TEXT,
    start_time TIMESTAMP WITH TIME ZONE NOT NULL,
    end_time TIMESTAMP WITH TIME ZONE NOT NULL,
    timezone TEXT DEFAULT 'UTC',
    recurring BOOLEAN DEFAULT FALSE,
    recurring_pattern JSONB, -- {type: 'daily|weekly|monthly', interval: 1, days_of_week: [1,2,3], day_of_month: 15}
    status TEXT DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'active', 'completed', 'cancelled')),
    notification_sent BOOLEAN DEFAULT FALSE,
    tenant_id TEXT,
    created_by TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Maintenance window affected monitors
CREATE TABLE IF NOT EXISTS nova_maintenance_monitors (
    maintenance_id TEXT NOT NULL REFERENCES nova_maintenance_windows(id) ON DELETE CASCADE,
    monitor_id TEXT NOT NULL REFERENCES nova_monitors(id) ON DELETE CASCADE,
    PRIMARY KEY (maintenance_id, monitor_id)
);

-- Maintenance window affected tags
CREATE TABLE IF NOT EXISTS nova_maintenance_tags (
    maintenance_id TEXT NOT NULL REFERENCES nova_maintenance_windows(id) ON DELETE CASCADE,
    tag_id TEXT NOT NULL REFERENCES nova_tags(id) ON DELETE CASCADE,
    PRIMARY KEY (maintenance_id, tag_id)
);

-- Proxy configurations
CREATE TABLE IF NOT EXISTS nova_proxy_configs (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    name TEXT NOT NULL,
    protocol TEXT NOT NULL CHECK (protocol IN ('http', 'https', 'socks4', 'socks5')),
    hostname TEXT NOT NULL,
    port INTEGER NOT NULL CHECK (port BETWEEN 1 AND 65535),
    username TEXT,
    password TEXT,
    active BOOLEAN DEFAULT TRUE,
    tenant_id TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enhanced notification channels with 90+ provider support
ALTER TABLE nova_notification_channels 
ADD COLUMN IF NOT EXISTS provider_config JSONB DEFAULT '{}',
ADD COLUMN IF NOT EXISTS test_success BOOLEAN,
ADD COLUMN IF NOT EXISTS last_test_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS failure_count INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS disabled_until TIMESTAMP WITH TIME ZONE;

-- Update notification channel type to support all providers
ALTER TABLE nova_notification_channels 
ALTER COLUMN type TYPE TEXT;

COMMENT ON COLUMN nova_notification_channels.type IS 'Supported: telegram, slack, discord, teams, email, webhook, pushover, gotify, pagerduty, opsgenie, pushbullet, line, mattermost, rocket_chat, feishu, dingtalk, bark, ntfy, splunk, homeassistant, matrix, signal, and 80+ more';

-- Status pages
CREATE TABLE IF NOT EXISTS nova_status_pages (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    slug TEXT NOT NULL UNIQUE,
    title TEXT NOT NULL,
    description TEXT,
    theme TEXT DEFAULT 'light' CHECK (theme IN ('light', 'dark', 'auto')),
    custom_css TEXT,
    custom_js TEXT,
    logo_url TEXT,
    favicon_url TEXT,
    background_image_url TEXT,
    background_color TEXT,
    text_color TEXT,
    header_color TEXT,
    footer_text TEXT,
    domain_name TEXT, -- Custom domain mapping
    password_protected BOOLEAN DEFAULT FALSE,
    password_hash TEXT, -- bcrypt hash
    published BOOLEAN DEFAULT TRUE,
    show_powered_by BOOLEAN DEFAULT TRUE,
    show_tags BOOLEAN DEFAULT TRUE,
    monitor_list_sort TEXT DEFAULT 'alphabetical' CHECK (monitor_list_sort IN ('alphabetical', 'recent', 'status')),
    incident_history_days INTEGER DEFAULT 90,
    refresh_interval INTEGER DEFAULT 60, -- seconds
    search_engine_visible BOOLEAN DEFAULT TRUE,
    google_analytics_id TEXT,
    language TEXT DEFAULT 'en',
    timezone TEXT DEFAULT 'UTC',
    maintenance_mode BOOLEAN DEFAULT FALSE,
    tenant_id TEXT,
    created_by TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Status page monitors
CREATE TABLE IF NOT EXISTS nova_status_page_monitors (
    status_page_id TEXT NOT NULL REFERENCES nova_status_pages(id) ON DELETE CASCADE,
    monitor_id TEXT NOT NULL REFERENCES nova_monitors(id) ON DELETE CASCADE,
    display_name TEXT, -- Override monitor name
    order_index INTEGER DEFAULT 0,
    show_uptime BOOLEAN DEFAULT TRUE,
    show_response_time BOOLEAN DEFAULT TRUE,
    send_notifications BOOLEAN DEFAULT TRUE,
    PRIMARY KEY (status_page_id, monitor_id)
);

-- Status page incidents
CREATE TABLE IF NOT EXISTS nova_status_page_incidents (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    status_page_id TEXT NOT NULL REFERENCES nova_status_pages(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    severity TEXT DEFAULT 'minor' CHECK (severity IN ('maintenance', 'minor', 'major', 'critical')),
    status TEXT DEFAULT 'investigating' CHECK (status IN ('investigating', 'identified', 'monitoring', 'resolved')),
    affected_monitors TEXT[], -- Array of monitor IDs
    created_by TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    resolved_at TIMESTAMP WITH TIME ZONE
);

-- Status page subscriptions
CREATE TABLE IF NOT EXISTS nova_status_page_subscriptions (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    status_page_id TEXT NOT NULL REFERENCES nova_status_pages(id) ON DELETE CASCADE,
    email TEXT NOT NULL,
    verified BOOLEAN DEFAULT FALSE,
    verification_token TEXT,
    notification_types TEXT[] DEFAULT ARRAY['incident_created', 'incident_updated', 'incident_resolved'],
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(status_page_id, email)
);

-- Status page badges configuration
CREATE TABLE IF NOT EXISTS nova_status_page_badges (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    status_page_id TEXT NOT NULL REFERENCES nova_status_pages(id) ON DELETE CASCADE,
    monitor_id TEXT REFERENCES nova_monitors(id) ON DELETE CASCADE,
    type TEXT DEFAULT 'shield' CHECK (type IN ('shield', 'flat', 'plastic', 'flat-square', 'for-the-badge')),
    style TEXT DEFAULT 'status' CHECK (style IN ('uptime', 'status', 'response-time')),
    label TEXT,
    color_up TEXT DEFAULT '#4c1',
    color_down TEXT DEFAULT '#e05d44',
    color_pending TEXT DEFAULT '#dfb317',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Certificate monitoring information
CREATE TABLE IF NOT EXISTS nova_certificate_info (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    monitor_id TEXT NOT NULL REFERENCES nova_monitors(id) ON DELETE CASCADE,
    hostname TEXT NOT NULL,
    port INTEGER NOT NULL DEFAULT 443,
    issuer TEXT,
    subject TEXT,
    serial_number TEXT,
    valid_from TIMESTAMP WITH TIME ZONE,
    valid_to TIMESTAMP WITH TIME ZONE,
    days_remaining INTEGER,
    fingerprint TEXT,
    fingerprint256 TEXT,
    signature_algorithm TEXT,
    is_self_signed BOOLEAN DEFAULT FALSE,
    is_expired BOOLEAN DEFAULT FALSE,
    is_valid BOOLEAN DEFAULT TRUE,
    chain_length INTEGER DEFAULT 1,
    last_checked TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(monitor_id)
);

-- API keys for external integrations
CREATE TABLE IF NOT EXISTS nova_api_keys (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    name TEXT NOT NULL,
    key_hash TEXT NOT NULL UNIQUE, -- SHA-256 hash of the actual key
    key_prefix TEXT NOT NULL, -- First 8 characters for identification
    permissions JSONB DEFAULT '{"read": true, "write": false, "admin": false}',
    tenant_id TEXT,
    expires_at TIMESTAMP WITH TIME ZONE,
    last_used_at TIMESTAMP WITH TIME ZONE,
    created_by TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    is_active BOOLEAN DEFAULT TRUE
);

-- Docker container monitoring cache
CREATE TABLE IF NOT EXISTS nova_docker_containers (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    monitor_id TEXT NOT NULL REFERENCES nova_monitors(id) ON DELETE CASCADE,
    container_id TEXT NOT NULL,
    container_name TEXT NOT NULL,
    image TEXT,
    status TEXT,
    started_at TIMESTAMP WITH TIME ZONE,
    ports JSONB,
    environment JSONB,
    last_checked TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(monitor_id)
);

-- 2FA secrets for users
CREATE TABLE IF NOT EXISTS nova_user_2fa (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    user_id TEXT NOT NULL, -- Reference to your user table
    secret TEXT NOT NULL, -- TOTP secret
    backup_codes TEXT[], -- Array of backup codes
    enabled BOOLEAN DEFAULT FALSE,
    verified_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id)
);

-- Ping chart data (optimized for time-series)
CREATE TABLE IF NOT EXISTS nova_ping_data (
    id BIGSERIAL PRIMARY KEY,
    monitor_id TEXT NOT NULL REFERENCES nova_monitors(id) ON DELETE CASCADE,
    timestamp TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    response_time INTEGER, -- milliseconds
    status TEXT NOT NULL CHECK (status IN ('up', 'down', 'maintenance')),
    status_code INTEGER,
    error_message TEXT,
    -- Partition by day for better performance
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
) PARTITION BY RANGE (created_at);

-- Create initial partitions for ping data (last 7 days)
CREATE TABLE IF NOT EXISTS nova_ping_data_recent PARTITION OF nova_ping_data
    FOR VALUES FROM (NOW() - INTERVAL '7 days') TO (NOW() + INTERVAL '1 day');

-- Enhanced heartbeat table for push monitoring
CREATE TABLE IF NOT EXISTS nova_heartbeats (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    monitor_id TEXT NOT NULL REFERENCES nova_monitors(id) ON DELETE CASCADE,
    received_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    source_ip INET,
    user_agent TEXT,
    payload JSONB,
    status TEXT DEFAULT 'ok',
    message TEXT
);

-- Uptime Kuma import tracking
CREATE TABLE IF NOT EXISTS nova_kuma_import_log (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    kuma_instance_url TEXT NOT NULL,
    import_type TEXT NOT NULL, -- 'monitors', 'notifications', 'status_pages'
    total_items INTEGER DEFAULT 0,
    imported_items INTEGER DEFAULT 0,
    failed_items INTEGER DEFAULT 0,
    errors JSONB,
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'running', 'completed', 'failed')),
    started_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    completed_at TIMESTAMP WITH TIME ZONE,
    created_by TEXT
);

-- Performance indexes
CREATE INDEX IF NOT EXISTS idx_monitors_tenant_type ON nova_monitors(tenant_id, type);
CREATE INDEX IF NOT EXISTS idx_monitors_status ON nova_monitors(status) WHERE status = 'active';
CREATE INDEX IF NOT EXISTS idx_monitor_results_monitor_timestamp ON nova_monitor_results(monitor_id, timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_incidents_status ON nova_incidents(status) WHERE status != 'resolved';
CREATE INDEX IF NOT EXISTS idx_maintenance_windows_active ON nova_maintenance_windows(start_time, end_time) WHERE status = 'active';
CREATE INDEX IF NOT EXISTS idx_status_pages_slug ON nova_status_pages(slug) WHERE published = true;
CREATE INDEX IF NOT EXISTS idx_ping_data_monitor_time ON nova_ping_data(monitor_id, timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_certificates_expiry ON nova_certificate_info(valid_to) WHERE is_valid = true;
CREATE INDEX IF NOT EXISTS idx_heartbeats_monitor_time ON nova_heartbeats(monitor_id, received_at DESC);

-- Performance optimized views
CREATE OR REPLACE VIEW nova_monitor_summary AS
SELECT 
    m.id,
    m.name,
    m.type,
    m.status,
    m.tenant_id,
    m.tags,
    m.group_name,
    -- Latest result
    lr.success as is_up,
    lr.response_time as last_response_time,
    lr.timestamp as last_check,
    lr.message as last_message,
    -- Uptime calculation (24h)
    COALESCE(
        (SELECT 
            ROUND(
                (COUNT(*) FILTER (WHERE success = true)::decimal / COUNT(*)) * 100, 
                2
            )
        FROM nova_monitor_results r 
        WHERE r.monitor_id = m.id 
        AND r.timestamp >= NOW() - INTERVAL '24 hours'
        ), 
        0
    ) as uptime_24h,
    -- Average response time (24h)
    COALESCE(
        (SELECT ROUND(AVG(response_time)::numeric, 0)
        FROM nova_monitor_results r 
        WHERE r.monitor_id = m.id 
        AND r.timestamp >= NOW() - INTERVAL '24 hours'
        AND success = true
        ), 
        0
    ) as avg_response_time_24h,
    -- Certificate info for SSL monitors
    CASE WHEN m.type = 'ssl' THEN
        (SELECT json_build_object(
            'days_remaining', days_remaining,
            'valid_to', valid_to,
            'is_expired', is_expired
        ) FROM nova_certificate_info ci WHERE ci.monitor_id = m.id)
    END as certificate_info,
    -- Maintenance status
    EXISTS(
        SELECT 1 FROM nova_maintenance_windows mw
        JOIN nova_maintenance_monitors mm ON mw.id = mm.maintenance_id
        WHERE mm.monitor_id = m.id
        AND mw.status = 'active'
        AND NOW() BETWEEN mw.start_time AND mw.end_time
    ) as in_maintenance,
    m.created_at,
    m.updated_at
FROM nova_monitors m
LEFT JOIN LATERAL (
    SELECT success, response_time, timestamp, message
    FROM nova_monitor_results r 
    WHERE r.monitor_id = m.id 
    ORDER BY timestamp DESC 
    LIMIT 1
) lr ON true;

-- Function to clean old ping data
CREATE OR REPLACE FUNCTION cleanup_old_ping_data(retention_days INTEGER DEFAULT 90)
RETURNS INTEGER AS $$
DECLARE
    deleted_count INTEGER;
BEGIN
    DELETE FROM nova_ping_data 
    WHERE created_at < NOW() - (retention_days || ' days')::INTERVAL;
    
    GET DIAGNOSTICS deleted_count = ROW_COUNT;
    RETURN deleted_count;
END;
$$ LANGUAGE plpgsql;

-- Function to calculate monitor uptime for any period
CREATE OR REPLACE FUNCTION calculate_monitor_uptime(
    monitor_id_param TEXT, 
    hours_back INTEGER DEFAULT 24
) RETURNS DECIMAL AS $$
DECLARE
    uptime_percent DECIMAL;
BEGIN
    SELECT 
        ROUND(
            (COUNT(*) FILTER (WHERE success = true)::decimal / NULLIF(COUNT(*), 0)) * 100, 
            3
        ) INTO uptime_percent
    FROM nova_monitor_results 
    WHERE monitor_id = monitor_id_param 
    AND timestamp >= NOW() - (hours_back || ' hours')::INTERVAL;
    
    RETURN COALESCE(uptime_percent, 0);
END;
$$ LANGUAGE plpgsql;

-- Trigger to update monitor updated_at on result insert
CREATE OR REPLACE FUNCTION update_monitor_timestamp()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE nova_monitors 
    SET updated_at = NOW() 
    WHERE id = NEW.monitor_id;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER monitor_result_update_trigger
    AFTER INSERT ON nova_monitor_results
    FOR EACH ROW
    EXECUTE FUNCTION update_monitor_timestamp();

-- Insert default tags
INSERT INTO nova_tags (name, color, description) VALUES
('production', '#dc3545', 'Production services'),
('staging', '#ffc107', 'Staging environment'),
('development', '#28a745', 'Development environment'),
('api', '#007bff', 'API endpoints'),
('database', '#6f42c1', 'Database services'),
('web', '#17a2b8', 'Web applications'),
('critical', '#dc3545', 'Critical infrastructure'),
('external', '#6c757d', 'External dependencies')
ON CONFLICT (name, tenant_id) DO NOTHING;

-- Add helpful comments
COMMENT ON TABLE nova_monitors IS 'Monitor configurations with support for 13+ monitor types including HTTP, TCP, Docker, Steam, etc.';
COMMENT ON TABLE nova_tags IS 'Organizational tags for grouping monitors';
COMMENT ON TABLE nova_maintenance_windows IS 'Scheduled maintenance windows with recurring support';
COMMENT ON TABLE nova_status_pages IS 'Public status pages with custom branding and domain mapping';
COMMENT ON TABLE nova_certificate_info IS 'SSL certificate monitoring and expiry tracking';
COMMENT ON TABLE nova_ping_data IS 'Time-series ping/response data for charts (partitioned by date)';
COMMENT ON TABLE nova_heartbeats IS 'Push monitoring heartbeat data';

-- Grant permissions (adjust as needed for your user setup)
-- GRANT ALL ON ALL TABLES IN SCHEMA public TO nova_api;
-- GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO nova_api;
