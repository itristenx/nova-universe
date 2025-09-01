-- Uptime Kuma Schema Integration with Nova Universe Database
-- Migration: 20250101000001_uptime_kuma_schema_integration.sql
-- Description: Creates Uptime Kuma schema within Nova's PostgreSQL database

-- Create Uptime Kuma schema namespace
CREATE SCHEMA IF NOT EXISTS uptime_kuma;

-- Set search path to include Uptime Kuma schema
SET search_path TO uptime_kuma, public;

-- Uptime Kuma Core Tables (based on Uptime Kuma v1.23+ structure)
-- These tables replicate Uptime Kuma's internal SQLite structure in PostgreSQL

-- Monitor definitions (what to monitor)
CREATE TABLE IF NOT EXISTS uptime_kuma.monitors (
    id SERIAL PRIMARY KEY,
    name VARCHAR(150) NOT NULL,
    url TEXT,
    type VARCHAR(20) NOT NULL DEFAULT 'http' CHECK (type IN ('http', 'port', 'ping', 'keyword', 'dns', 'push', 'steam', 'gamedig', 'docker', 'mongodb', 'mqtt', 'mysql', 'postgres', 'redis', 'sqlserver')),
    interval INTEGER NOT NULL DEFAULT 60, -- seconds
    retryInterval INTEGER DEFAULT 60,
    resendInterval INTEGER DEFAULT 0,
    maxRetries INTEGER DEFAULT 0,
    upsideDown BOOLEAN DEFAULT FALSE,
    -- HTTP/HTTPS specific
    method VARCHAR(10) DEFAULT 'GET',
    body TEXT,
    headers TEXT, -- JSON string
    basic_auth_user VARCHAR(255),
    basic_auth_pass VARCHAR(255),
    -- Timing
    timeout INTEGER DEFAULT 48,
    -- Keywords
    keyword TEXT,
    invertKeyword BOOLEAN DEFAULT FALSE,
    -- DNS
    dns_resolve_type VARCHAR(5) DEFAULT 'A',
    dns_resolve_server VARCHAR(255) DEFAULT '1.1.1.1',
    -- Port monitor
    hostname VARCHAR(255),
    port INTEGER,
    -- Push monitor
    pushToken VARCHAR(20),
    -- Game monitoring
    game VARCHAR(255),
    -- Docker
    docker_container VARCHAR(255),
    docker_host INTEGER,
    -- Database connections
    database_connection_string TEXT,
    database_query TEXT,
    -- MQTT
    mqtt_topic VARCHAR(255),
    mqtt_success_message VARCHAR(255),
    -- Notifications
    accepted_statuscodes TEXT DEFAULT '[\"200-299\"]', -- JSON array
    -- Status and metadata
    active BOOLEAN DEFAULT TRUE,
    ignoreTls BOOLEAN DEFAULT FALSE,
    description TEXT,
    tags TEXT, -- JSON array of tag IDs
    -- Nova Integration
    nova_monitor_id UUID REFERENCES public.monitors(id) ON DELETE SET NULL,
    nova_user_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
    sync_status VARCHAR(20) DEFAULT 'pending' CHECK (sync_status IN ('pending', 'synced', 'failed')),
    integration_metadata JSONB DEFAULT '{}',
    -- Timestamps
    created_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Monitor status/heartbeat data
CREATE TABLE IF NOT EXISTS uptime_kuma.heartbeats (
    id SERIAL PRIMARY KEY,
    monitor_id INTEGER NOT NULL REFERENCES uptime_kuma.monitors(id) ON DELETE CASCADE,
    status BOOLEAN NOT NULL, -- 1 = up, 0 = down
    time TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    msg TEXT,
    duration INTEGER, -- response time in ms
    ping INTEGER, -- ping time in ms
    important BOOLEAN DEFAULT FALSE,
    -- Additional data
    down_count INTEGER DEFAULT 0
);

-- Incidents (when monitors go down)
CREATE TABLE IF NOT EXISTS uptime_kuma.incidents (
    id SERIAL PRIMARY KEY,
    monitor_id INTEGER NOT NULL REFERENCES uptime_kuma.monitors(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    content TEXT,
    style VARCHAR(30) NOT NULL DEFAULT 'danger' CHECK (style IN ('info', 'warning', 'danger', 'primary')),
    created_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    last_updated_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    pin BOOLEAN DEFAULT FALSE,
    active BOOLEAN DEFAULT TRUE,
    -- Nova Integration
    nova_incident_id UUID REFERENCES public.monitor_incidents(id) ON DELETE SET NULL
);

-- Maintenance windows
CREATE TABLE IF NOT EXISTS uptime_kuma.maintenances (
    id SERIAL PRIMARY KEY,
    title VARCHAR(150) NOT NULL,
    description TEXT,
    strategy VARCHAR(50) NOT NULL DEFAULT 'single' CHECK (strategy IN ('single', 'recurring-interval', 'recurring-weekday', 'recurring-day-of-month', 'cron')),
    active BOOLEAN DEFAULT TRUE,
    -- Scheduling
    start_date TIMESTAMP,
    end_date TIMESTAMP,
    start_time TIME,
    end_time TIME,
    weekdays TEXT, -- JSON array for recurring
    days_of_month TEXT, -- JSON array for recurring
    interval_day INTEGER,
    -- Timezone
    timezone VARCHAR(255) DEFAULT NULL,
    -- Nova Integration
    created_by UUID REFERENCES public.users(id),
    created_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Link monitors to maintenance windows
CREATE TABLE IF NOT EXISTS uptime_kuma.monitor_maintenances (
    id SERIAL PRIMARY KEY,
    monitor_id INTEGER NOT NULL REFERENCES uptime_kuma.monitors(id) ON DELETE CASCADE,
    maintenance_id INTEGER NOT NULL REFERENCES uptime_kuma.maintenances(id) ON DELETE CASCADE,
    UNIQUE(monitor_id, maintenance_id)
);

-- Status pages
CREATE TABLE IF NOT EXISTS uptime_kuma.status_pages (
    id SERIAL PRIMARY KEY,
    slug VARCHAR(255) NOT NULL UNIQUE,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    icon TEXT,
    theme VARCHAR(30) DEFAULT 'auto',
    published BOOLEAN DEFAULT TRUE,
    show_tags BOOLEAN DEFAULT FALSE,
    domain_name_list TEXT, -- JSON array
    custom_css TEXT,
    footer_text TEXT,
    show_powered_by BOOLEAN DEFAULT TRUE,
    google_analytics_tag_id VARCHAR(255),
    -- Nova Integration  
    nova_status_page_id UUID REFERENCES public.status_page_configs(id) ON DELETE SET NULL,
    created_by UUID REFERENCES public.users(id),
    created_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Link monitors to status pages
CREATE TABLE IF NOT EXISTS uptime_kuma.monitor_status_pages (
    id SERIAL PRIMARY KEY,
    monitor_id INTEGER NOT NULL REFERENCES uptime_kuma.monitors(id) ON DELETE CASCADE,
    status_page_id INTEGER NOT NULL REFERENCES uptime_kuma.status_pages(id) ON DELETE CASCADE,
    UNIQUE(monitor_id, status_page_id)
);

-- Tags for organizing monitors
CREATE TABLE IF NOT EXISTS uptime_kuma.tags (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    color VARCHAR(255) NOT NULL DEFAULT '#40E0D0',
    created_by UUID REFERENCES public.users(id),
    created_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Link monitors to tags
CREATE TABLE IF NOT EXISTS uptime_kuma.monitor_tags (
    id SERIAL PRIMARY KEY,
    monitor_id INTEGER NOT NULL REFERENCES uptime_kuma.monitors(id) ON DELETE CASCADE,
    tag_id INTEGER NOT NULL REFERENCES uptime_kuma.tags(id) ON DELETE CASCADE,
    value TEXT, -- Optional tag value
    UNIQUE(monitor_id, tag_id)
);

-- Notifications (integrations like Slack, email, etc.)
CREATE TABLE IF NOT EXISTS uptime_kuma.notifications (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    type VARCHAR(50) NOT NULL, -- slack, email, webhook, etc.
    user_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
    config TEXT NOT NULL, -- JSON configuration for the notification type
    is_default BOOLEAN DEFAULT FALSE,
    apply_existing BOOLEAN DEFAULT FALSE,
    created_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Link monitors to notifications
CREATE TABLE IF NOT EXISTS uptime_kuma.monitor_notifications (
    id SERIAL PRIMARY KEY,
    monitor_id INTEGER NOT NULL REFERENCES uptime_kuma.monitors(id) ON DELETE CASCADE,
    notification_id INTEGER NOT NULL REFERENCES uptime_kuma.notifications(id) ON DELETE CASCADE,
    UNIQUE(monitor_id, notification_id)
);

-- User settings and preferences
CREATE TABLE IF NOT EXISTS uptime_kuma.settings (
    id SERIAL PRIMARY KEY,
    key VARCHAR(200) NOT NULL UNIQUE,
    value TEXT,
    type VARCHAR(20) DEFAULT 'string',
    created_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- API keys for external access
CREATE TABLE IF NOT EXISTS uptime_kuma.api_keys (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    key VARCHAR(255) NOT NULL UNIQUE,
    active BOOLEAN DEFAULT TRUE,
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
    expires_date TIMESTAMP,
    created_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Docker hosts (for Docker monitoring)
CREATE TABLE IF NOT EXISTS uptime_kuma.docker_hosts (
    id SERIAL PRIMARY KEY,
    user_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
    docker_daemon VARCHAR(255),
    docker_type VARCHAR(255),
    name VARCHAR(255),
    created_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Proxy servers
CREATE TABLE IF NOT EXISTS uptime_kuma.proxies (
    id SERIAL PRIMARY KEY,
    user_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
    protocol VARCHAR(10) NOT NULL,
    host VARCHAR(255) NOT NULL,
    port INTEGER NOT NULL,
    auth BOOLEAN DEFAULT FALSE,
    username VARCHAR(255),
    password VARCHAR(255),
    active BOOLEAN DEFAULT TRUE,
    default_proxy BOOLEAN DEFAULT FALSE,
    created_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_uptime_kuma_monitors_nova_monitor_id ON uptime_kuma.monitors(nova_monitor_id);
CREATE INDEX IF NOT EXISTS idx_uptime_kuma_monitors_nova_user_id ON uptime_kuma.monitors(nova_user_id);
CREATE INDEX IF NOT EXISTS idx_uptime_kuma_monitors_active ON uptime_kuma.monitors(active);
CREATE INDEX IF NOT EXISTS idx_uptime_kuma_monitors_type ON uptime_kuma.monitors(type);
CREATE INDEX IF NOT EXISTS idx_uptime_kuma_heartbeats_monitor_id ON uptime_kuma.heartbeats(monitor_id);
CREATE INDEX IF NOT EXISTS idx_uptime_kuma_heartbeats_time ON uptime_kuma.heartbeats(time);
CREATE INDEX IF NOT EXISTS idx_uptime_kuma_heartbeats_status ON uptime_kuma.heartbeats(status);
CREATE INDEX IF NOT EXISTS idx_uptime_kuma_incidents_monitor_id ON uptime_kuma.incidents(monitor_id);
CREATE INDEX IF NOT EXISTS idx_uptime_kuma_incidents_active ON uptime_kuma.incidents(active);
CREATE INDEX IF NOT EXISTS idx_uptime_kuma_api_keys_key ON uptime_kuma.api_keys(key);
CREATE INDEX IF NOT EXISTS idx_uptime_kuma_api_keys_user_id ON uptime_kuma.api_keys(user_id);

-- Create triggers for updated_date timestamps
CREATE OR REPLACE FUNCTION uptime_kuma.update_updated_date_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_date = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_uptime_kuma_monitors_updated_date BEFORE UPDATE ON uptime_kuma.monitors FOR EACH ROW EXECUTE FUNCTION uptime_kuma.update_updated_date_column();
CREATE TRIGGER update_uptime_kuma_maintenances_updated_date BEFORE UPDATE ON uptime_kuma.maintenances FOR EACH ROW EXECUTE FUNCTION uptime_kuma.update_updated_date_column();
CREATE TRIGGER update_uptime_kuma_status_pages_updated_date BEFORE UPDATE ON uptime_kuma.status_pages FOR EACH ROW EXECUTE FUNCTION uptime_kuma.update_updated_date_column();
CREATE TRIGGER update_uptime_kuma_notifications_updated_date BEFORE UPDATE ON uptime_kuma.notifications FOR EACH ROW EXECUTE FUNCTION uptime_kuma.update_updated_date_column();
CREATE TRIGGER update_uptime_kuma_settings_updated_date BEFORE UPDATE ON uptime_kuma.settings FOR EACH ROW EXECUTE FUNCTION uptime_kuma.update_updated_date_column();
CREATE TRIGGER update_uptime_kuma_proxies_updated_date BEFORE UPDATE ON uptime_kuma.proxies FOR EACH ROW EXECUTE FUNCTION uptime_kuma.update_updated_date_column();

-- Create function to sync Nova monitors to Uptime Kuma
CREATE OR REPLACE FUNCTION uptime_kuma.sync_nova_monitor_to_kuma(nova_monitor_id UUID)
RETURNS INTEGER AS $$
DECLARE
    kuma_monitor_id INTEGER;
    monitor_record RECORD;
BEGIN
    -- Get Nova monitor details
    SELECT id, name, url, type, check_interval, user_id, created_at
    INTO monitor_record
    FROM public.monitors
    WHERE id = nova_monitor_id;
    
    IF NOT FOUND THEN
        RAISE EXCEPTION 'Nova monitor not found: %', nova_monitor_id;
    END IF;
    
    -- Insert or update Uptime Kuma monitor
    INSERT INTO uptime_kuma.monitors (
        nova_monitor_id,
        nova_user_id,
        name,
        url,
        type,
        interval,
        active,
        sync_status,
        created_date
    ) VALUES (
        nova_monitor_id,
        monitor_record.user_id,
        monitor_record.name,
        monitor_record.url,
        CASE monitor_record.type
            WHEN 'website' THEN 'http'
            WHEN 'api' THEN 'http'
            WHEN 'ping' THEN 'ping'
            WHEN 'port' THEN 'port'
            ELSE 'http'
        END,
        COALESCE(monitor_record.check_interval, 60),
        true,
        'synced',
        monitor_record.created_at
    )
    ON CONFLICT (nova_monitor_id) DO UPDATE SET
        name = EXCLUDED.name,
        url = EXCLUDED.url,
        type = EXCLUDED.type,
        interval = EXCLUDED.interval,
        sync_status = 'synced',
        updated_date = CURRENT_TIMESTAMP
    RETURNING id INTO kuma_monitor_id;
    
    RETURN kuma_monitor_id;
END;
$$ LANGUAGE plpgsql;

-- Create function to auto-sync monitors when they're created/updated in Nova
CREATE OR REPLACE FUNCTION public.sync_monitor_to_uptime_kuma()
RETURNS TRIGGER AS $$
BEGIN
    -- Only sync if monitor has a URL (required for Uptime Kuma)
    IF NEW.url IS NOT NULL AND NEW.url != '' THEN
        PERFORM uptime_kuma.sync_nova_monitor_to_kuma(NEW.id);
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to auto-sync monitors
CREATE TRIGGER sync_monitor_to_uptime_kuma_trigger
    AFTER INSERT OR UPDATE ON public.monitors
    FOR EACH ROW
    EXECUTE FUNCTION public.sync_monitor_to_uptime_kuma();

-- Insert default Uptime Kuma settings
INSERT INTO uptime_kuma.settings (key, value, type) VALUES
('checkUpdate', 'true', 'boolean'),
('checkBeta', 'false', 'boolean'),
('keepDataPeriodDays', '180', 'number'),
('serverTimezone', 'UTC', 'string'),
('entryPage', 'dashboard', 'string'),
('searchEngineIndex', 'false', 'boolean'),
('primaryBaseURL', '', 'string'),
('steamAPIKey', '', 'string'),
('dnsCache', 'true', 'boolean'),
('chromeExecutable', '', 'string'),
('nscd', 'false', 'boolean'),
('novaIntegrationEnabled', 'true', 'boolean'),
('novaApiUrl', 'http://nova-api:3000', 'string'),
('novaWebhookSecret', 'nova-uptime-kuma-webhook-secret', 'string')
ON CONFLICT (key) DO NOTHING;

-- Create default tags
INSERT INTO uptime_kuma.tags (name, color) VALUES
('Production', '#dc3545'),
('Staging', '#fd7e14'),
('Development', '#28a745'),
('Critical', '#dc3545'),
('API', '#007bff'),
('Website', '#17a2b8'),
('Database', '#6610f2'),
('External', '#6c757d')
ON CONFLICT DO NOTHING;

-- Grant permissions
GRANT USAGE ON SCHEMA uptime_kuma TO api_user;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA uptime_kuma TO api_user;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA uptime_kuma TO api_user;
GRANT ALL PRIVILEGES ON ALL FUNCTIONS IN SCHEMA uptime_kuma TO api_user;

-- Reset search path
SET search_path TO public;

-- Create views for Nova integration
CREATE OR REPLACE VIEW public.uptime_kuma_monitor_status AS
SELECT 
    m.id as monitor_id,
    m.name,
    m.url,
    m.type,
    m.active,
    m.nova_monitor_id,
    m.nova_user_id,
    -- Latest heartbeat status
    h.status as current_status,
    h.time as last_check,
    h.duration as response_time_ms,
    h.ping as ping_time_ms,
    h.msg as status_message,
    -- Uptime calculation (last 24 hours)
    (
        SELECT COUNT(*) FILTER (WHERE status = true)::FLOAT / COUNT(*)::FLOAT * 100
        FROM uptime_kuma.heartbeats hb 
        WHERE hb.monitor_id = m.id 
        AND hb.time >= CURRENT_TIMESTAMP - INTERVAL '24 hours'
    ) as uptime_24h
FROM uptime_kuma.monitors m
LEFT JOIN LATERAL (
    SELECT status, time, duration, ping, msg
    FROM uptime_kuma.heartbeats hb
    WHERE hb.monitor_id = m.id
    ORDER BY time DESC
    LIMIT 1
) h ON true
WHERE m.active = true;

-- Create materialized view for performance dashboard
CREATE MATERIALIZED VIEW public.uptime_kuma_performance_summary AS
SELECT 
    m.id as monitor_id,
    m.name,
    m.type,
    -- Performance metrics over last 24 hours
    AVG(h.duration) as avg_response_time_24h,
    MAX(h.duration) as max_response_time_24h,
    MIN(h.duration) as min_response_time_24h,
    COUNT(*) as total_checks_24h,
    COUNT(*) FILTER (WHERE h.status = true) as successful_checks_24h,
    COUNT(*) FILTER (WHERE h.status = false) as failed_checks_24h,
    (COUNT(*) FILTER (WHERE h.status = true)::FLOAT / COUNT(*)::FLOAT * 100) as uptime_percentage_24h,
    -- Last 7 days
    (
        SELECT COUNT(*) FILTER (WHERE status = true)::FLOAT / COUNT(*)::FLOAT * 100
        FROM uptime_kuma.heartbeats hb7 
        WHERE hb7.monitor_id = m.id 
        AND hb7.time >= CURRENT_TIMESTAMP - INTERVAL '7 days'
    ) as uptime_percentage_7d
FROM uptime_kuma.monitors m
JOIN uptime_kuma.heartbeats h ON m.id = h.monitor_id
WHERE m.active = true
AND h.time >= CURRENT_TIMESTAMP - INTERVAL '24 hours'
GROUP BY m.id, m.name, m.type;

-- Create index on materialized view
CREATE UNIQUE INDEX ON public.uptime_kuma_performance_summary (monitor_id);

-- Create refresh function for materialized view
CREATE OR REPLACE FUNCTION public.refresh_uptime_kuma_performance_summary()
RETURNS void AS $$
BEGIN
    REFRESH MATERIALIZED VIEW CONCURRENTLY public.uptime_kuma_performance_summary;
END;
$$ LANGUAGE plpgsql;

COMMENT ON SCHEMA uptime_kuma IS 'Uptime Kuma integration schema - stores Uptime Kuma data within Nova database';
COMMENT ON TABLE uptime_kuma.monitors IS 'Uptime Kuma monitors synced from Nova monitors table';
COMMENT ON TABLE uptime_kuma.heartbeats IS 'Monitor check results and response times';
COMMENT ON TABLE uptime_kuma.incidents IS 'Monitoring incidents linked to Nova incident management';