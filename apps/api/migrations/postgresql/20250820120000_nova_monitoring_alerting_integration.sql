-- Enhanced Nova Monitoring & Alerting Integration Schema
-- Migration: 20250820120000_nova_monitoring_alerting_integration.sql
-- Description: Complete database schema for GoAlert and Uptime Kuma integration

-- Enhanced User Management Integration
-- Extend existing users table with monitoring/alerting capabilities
ALTER TABLE users ADD COLUMN IF NOT EXISTS goalert_user_id VARCHAR(255);
ALTER TABLE users ADD COLUMN IF NOT EXISTS uptime_kuma_api_key VARCHAR(255);
ALTER TABLE users ADD COLUMN IF NOT EXISTS monitoring_preferences JSONB DEFAULT '{}';
ALTER TABLE users ADD COLUMN IF NOT EXISTS alerting_preferences JSONB DEFAULT '{}';

-- Create monitoring user mappings for service integration
CREATE TABLE IF NOT EXISTS monitoring_user_mappings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    nova_user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    goalert_user_id VARCHAR(255),
    uptime_kuma_token VARCHAR(255),
    integration_settings JSONB DEFAULT '{}',
    sync_status VARCHAR(20) DEFAULT 'pending' CHECK (sync_status IN ('pending', 'synced', 'failed')),
    last_sync_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(nova_user_id)
);

-- Enhanced Configuration Management
-- Central configuration store for all monitoring services
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

-- Service Health and Status Tracking
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

-- Enhanced Monitor Management
-- Extend existing monitors table with GoAlert integration
ALTER TABLE monitors ADD COLUMN IF NOT EXISTS goalert_service_id VARCHAR(255);
ALTER TABLE monitors ADD COLUMN IF NOT EXISTS alert_enabled BOOLEAN DEFAULT true;
ALTER TABLE monitors ADD COLUMN IF NOT EXISTS escalation_policy_id VARCHAR(255);
ALTER TABLE monitors ADD COLUMN IF NOT EXISTS alert_settings JSONB DEFAULT '{}';
ALTER TABLE monitors ADD COLUMN IF NOT EXISTS integration_metadata JSONB DEFAULT '{}';

-- Enhanced Alert Management
-- Central alert store bridging GoAlert and Nova
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

-- On-Call Schedule Integration
-- Store GoAlert schedule information locally for Nova UI
CREATE TABLE IF NOT EXISTS oncall_schedules (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    goalert_schedule_id VARCHAR(255) NOT NULL UNIQUE,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    timezone VARCHAR(100) DEFAULT 'UTC',
    tenant_id UUID, -- For multi-tenant support
    is_active BOOLEAN DEFAULT true,
    configuration JSONB DEFAULT '{}', -- GoAlert schedule config
    created_by UUID REFERENCES users(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    last_sync_at TIMESTAMP
);

-- On-Call Assignments
CREATE TABLE IF NOT EXISTS oncall_assignments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    schedule_id UUID NOT NULL REFERENCES oncall_schedules(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    start_time TIMESTAMP NOT NULL,
    end_time TIMESTAMP NOT NULL,
    is_override BOOLEAN DEFAULT false,
    created_by UUID REFERENCES users(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    metadata JSONB DEFAULT '{}'
);

-- Escalation Policies
CREATE TABLE IF NOT EXISTS escalation_policies (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    goalert_policy_id VARCHAR(255) NOT NULL UNIQUE,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    steps JSONB NOT NULL, -- Array of escalation steps
    repeat_count INTEGER DEFAULT 1,
    tenant_id UUID, -- For multi-tenant support
    is_active BOOLEAN DEFAULT true,
    created_by UUID REFERENCES users(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Enhanced Incident Management
-- Extend existing monitor_incidents with alert correlation
ALTER TABLE monitor_incidents ADD COLUMN IF NOT EXISTS alert_id UUID REFERENCES nova_alerts(id);
ALTER TABLE monitor_incidents ADD COLUMN IF NOT EXISTS goalert_incident_id VARCHAR(255);
ALTER TABLE monitor_incidents ADD COLUMN IF NOT EXISTS incident_type VARCHAR(50) DEFAULT 'monitoring';
ALTER TABLE monitor_incidents ADD COLUMN IF NOT EXISTS affected_users_count INTEGER DEFAULT 0;
ALTER TABLE monitor_incidents ADD COLUMN IF NOT EXISTS business_impact VARCHAR(20) CHECK (business_impact IN ('low', 'medium', 'high', 'critical'));
ALTER TABLE monitor_incidents ADD COLUMN IF NOT EXISTS root_cause TEXT;
ALTER TABLE monitor_incidents ADD COLUMN IF NOT EXISTS resolution_notes TEXT;
ALTER TABLE monitor_incidents ADD COLUMN IF NOT EXISTS lessons_learned TEXT;

-- Event Sourcing for Data Synchronization
CREATE TABLE IF NOT EXISTS integration_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    event_type VARCHAR(100) NOT NULL, -- 'user.created', 'alert.triggered', 'monitor.updated', etc.
    source_service VARCHAR(50) NOT NULL, -- 'nova', 'goalert', 'uptime_kuma'
    target_services VARCHAR(50)[], -- Array of target services
    entity_type VARCHAR(50) NOT NULL, -- 'user', 'monitor', 'alert', etc.
    entity_id VARCHAR(255) NOT NULL, -- ID in source system
    payload JSONB NOT NULL,
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'failed', 'skipped')),
    retry_count INTEGER DEFAULT 0,
    max_retries INTEGER DEFAULT 3,
    priority INTEGER DEFAULT 5 CHECK (priority >= 1 AND priority <= 10), -- 1 = highest
    scheduled_for TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    processed_at TIMESTAMP,
    completed_at TIMESTAMP,
    error_message TEXT,
    correlation_id UUID -- For tracking related events
);

-- Enhanced Notification Management
-- Central notification tracking across all systems
CREATE TABLE IF NOT EXISTS notification_deliveries (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    alert_id UUID REFERENCES nova_alerts(id) ON DELETE CASCADE,
    incident_id UUID REFERENCES monitor_incidents(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    notification_type VARCHAR(30) NOT NULL CHECK (notification_type IN ('email', 'sms', 'slack', 'teams', 'webhook', 'push')),
    delivery_method VARCHAR(50) NOT NULL, -- 'nova_comms', 'goalert', 'direct'
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'sent', 'delivered', 'failed', 'bounced')),
    recipient_address TEXT NOT NULL, -- Email, phone, webhook URL, etc.
    subject TEXT,
    content TEXT,
    template_name VARCHAR(100),
    sent_at TIMESTAMP,
    delivered_at TIMESTAMP,
    failed_at TIMESTAMP,
    retry_count INTEGER DEFAULT 0,
    max_retries INTEGER DEFAULT 3,
    error_message TEXT,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Status Page Configuration Enhancement
-- Extend existing status_page_configs with advanced features
ALTER TABLE status_page_configs ADD COLUMN IF NOT EXISTS goalert_integration_enabled BOOLEAN DEFAULT false;
ALTER TABLE status_page_configs ADD COLUMN IF NOT EXISTS incident_auto_posting BOOLEAN DEFAULT true;
ALTER TABLE status_page_configs ADD COLUMN IF NOT EXISTS maintenance_auto_posting BOOLEAN DEFAULT true;
ALTER TABLE status_page_configs ADD COLUMN IF NOT EXISTS subscriber_notifications BOOLEAN DEFAULT true;
ALTER TABLE status_page_configs ADD COLUMN IF NOT EXISTS custom_domain VARCHAR(255);
ALTER TABLE status_page_configs ADD COLUMN IF NOT EXISTS seo_settings JSONB DEFAULT '{}';
ALTER TABLE status_page_configs ADD COLUMN IF NOT EXISTS analytics_enabled BOOLEAN DEFAULT false;
ALTER TABLE status_page_configs ADD COLUMN IF NOT EXISTS analytics_config JSONB DEFAULT '{}';

-- Status Page Subscribers
CREATE TABLE IF NOT EXISTS status_page_subscribers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    status_page_id UUID NOT NULL REFERENCES status_page_configs(id) ON DELETE CASCADE,
    email VARCHAR(255) NOT NULL,
    subscription_types VARCHAR(50)[] DEFAULT ARRAY['incidents', 'maintenance'], -- What they want to be notified about
    is_confirmed BOOLEAN DEFAULT false,
    confirmation_token VARCHAR(255),
    unsubscribe_token VARCHAR(255) UNIQUE,
    subscribed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    confirmed_at TIMESTAMP,
    last_notification_at TIMESTAMP,
    metadata JSONB DEFAULT '{}',
    UNIQUE(status_page_id, email)
);

-- Integration Audit and Compliance
CREATE TABLE IF NOT EXISTS integration_audit_log (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id),
    action VARCHAR(100) NOT NULL, -- 'create_monitor', 'acknowledge_alert', 'modify_schedule', etc.
    resource_type VARCHAR(50) NOT NULL, -- 'monitor', 'alert', 'schedule', 'user', etc.
    resource_id VARCHAR(255) NOT NULL,
    service_name VARCHAR(50) NOT NULL, -- Which service was affected
    before_state JSONB, -- State before change
    after_state JSONB, -- State after change
    ip_address INET,
    user_agent TEXT,
    success BOOLEAN DEFAULT true,
    error_message TEXT,
    session_id VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- API Rate Limiting and Usage Tracking
CREATE TABLE IF NOT EXISTS api_usage_tracking (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id),
    api_key_id VARCHAR(255), -- For service-to-service calls
    endpoint VARCHAR(255) NOT NULL,
    method VARCHAR(10) NOT NULL,
    service_target VARCHAR(50) NOT NULL, -- 'goalert', 'uptime_kuma', 'nova'
    response_status INTEGER,
    response_time_ms INTEGER,
    bytes_sent INTEGER DEFAULT 0,
    bytes_received INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    metadata JSONB DEFAULT '{}'
);

-- Performance Optimization Indexes
-- Integration Events
CREATE INDEX IF NOT EXISTS idx_integration_events_status_priority ON integration_events(status, priority);
CREATE INDEX IF NOT EXISTS idx_integration_events_scheduled_for ON integration_events(scheduled_for) WHERE status = 'pending';
CREATE INDEX IF NOT EXISTS idx_integration_events_correlation_id ON integration_events(correlation_id);
CREATE INDEX IF NOT EXISTS idx_integration_events_entity ON integration_events(entity_type, entity_id);

-- Nova Alerts
CREATE INDEX IF NOT EXISTS idx_nova_alerts_status_severity ON nova_alerts(status, severity);
CREATE INDEX IF NOT EXISTS idx_nova_alerts_created_at ON nova_alerts(created_at);
CREATE INDEX IF NOT EXISTS idx_nova_alerts_monitor_id ON nova_alerts(monitor_id);
CREATE INDEX IF NOT EXISTS idx_nova_alerts_correlation_key ON nova_alerts(correlation_key);
CREATE INDEX IF NOT EXISTS idx_nova_alerts_assigned_to ON nova_alerts(assigned_to);
CREATE INDEX IF NOT EXISTS idx_nova_alerts_sla_breach ON nova_alerts(sla_breached) WHERE sla_breached = true;

-- On-Call Management
CREATE INDEX IF NOT EXISTS idx_oncall_assignments_schedule_id_time ON oncall_assignments(schedule_id, start_time, end_time);
CREATE INDEX IF NOT EXISTS idx_oncall_assignments_user_id_time ON oncall_assignments(user_id, start_time, end_time);
CREATE INDEX IF NOT EXISTS idx_oncall_assignments_current ON oncall_assignments(schedule_id) WHERE start_time <= CURRENT_TIMESTAMP AND end_time >= CURRENT_TIMESTAMP;

-- Notification Deliveries
CREATE INDEX IF NOT EXISTS idx_notification_deliveries_alert_id ON notification_deliveries(alert_id);
CREATE INDEX IF NOT EXISTS idx_notification_deliveries_user_status ON notification_deliveries(user_id, status);
CREATE INDEX IF NOT EXISTS idx_notification_deliveries_retry ON notification_deliveries(status, retry_count) WHERE status = 'failed' AND retry_count < max_retries;

-- Service Health
CREATE INDEX IF NOT EXISTS idx_service_health_status_service ON service_health_status(service_name, status);
CREATE INDEX IF NOT EXISTS idx_service_health_last_check ON service_health_status(last_check);

-- Monitoring User Mappings
CREATE INDEX IF NOT EXISTS idx_monitoring_user_mappings_nova_user ON monitoring_user_mappings(nova_user_id);
CREATE INDEX IF NOT EXISTS idx_monitoring_user_mappings_sync_status ON monitoring_user_mappings(sync_status);

-- Audit Log
CREATE INDEX IF NOT EXISTS idx_audit_log_user_action ON integration_audit_log(user_id, action);
CREATE INDEX IF NOT EXISTS idx_audit_log_resource ON integration_audit_log(resource_type, resource_id);
CREATE INDEX IF NOT EXISTS idx_audit_log_service_time ON integration_audit_log(service_name, created_at);

-- API Usage
CREATE INDEX IF NOT EXISTS idx_api_usage_user_endpoint ON api_usage_tracking(user_id, endpoint);
CREATE INDEX IF NOT EXISTS idx_api_usage_service_time ON api_usage_tracking(service_target, created_at);

-- Create Enhanced Trigger Functions
CREATE OR REPLACE FUNCTION update_integration_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger function for alert SLA tracking
CREATE OR REPLACE FUNCTION check_alert_sla_breach()
RETURNS TRIGGER AS $$
BEGIN
    -- Check response SLA
    IF NEW.acknowledged_at IS NOT NULL AND OLD.acknowledged_at IS NULL THEN
        IF NEW.response_sla_minutes IS NOT NULL AND 
           EXTRACT(EPOCH FROM (NEW.acknowledged_at - NEW.created_at)) / 60 > NEW.response_sla_minutes THEN
            NEW.sla_breached = true;
        END IF;
    END IF;
    
    -- Check resolution SLA
    IF NEW.resolved_at IS NOT NULL AND OLD.resolved_at IS NULL THEN
        IF NEW.resolution_sla_minutes IS NOT NULL AND 
           EXTRACT(EPOCH FROM (NEW.resolved_at - NEW.created_at)) / 60 > NEW.resolution_sla_minutes THEN
            NEW.sla_breached = true;
        END IF;
    END IF;
    
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Enhanced Triggers
CREATE TRIGGER update_monitoring_user_mappings_updated_at 
    BEFORE UPDATE ON monitoring_user_mappings 
    FOR EACH ROW EXECUTE FUNCTION update_integration_updated_at_column();

CREATE TRIGGER update_integration_configurations_updated_at 
    BEFORE UPDATE ON integration_configurations 
    FOR EACH ROW EXECUTE FUNCTION update_integration_updated_at_column();

CREATE TRIGGER update_nova_alerts_updated_at 
    BEFORE UPDATE ON nova_alerts 
    FOR EACH ROW EXECUTE FUNCTION update_integration_updated_at_column();

CREATE TRIGGER update_oncall_schedules_updated_at 
    BEFORE UPDATE ON oncall_schedules 
    FOR EACH ROW EXECUTE FUNCTION update_integration_updated_at_column();

CREATE TRIGGER update_escalation_policies_updated_at 
    BEFORE UPDATE ON escalation_policies 
    FOR EACH ROW EXECUTE FUNCTION update_integration_updated_at_column();

CREATE TRIGGER check_nova_alerts_sla_breach 
    BEFORE UPDATE ON nova_alerts 
    FOR EACH ROW EXECUTE FUNCTION check_alert_sla_breach();

-- Initial Configuration Data
-- Insert default service health status
INSERT INTO service_health_status (service_name, service_type, status, health_score) VALUES 
('goalert', 'alerting', 'unknown', 0),
('uptime_kuma', 'monitoring', 'unknown', 0),
('nova_comms', 'notification', 'unknown', 0),
('nova_api', 'integration', 'unknown', 0)
ON CONFLICT (service_name) DO NOTHING;

-- Insert default integration configurations
INSERT INTO integration_configurations (service_name, config_key, config_value, created_by) VALUES 
('goalert', 'api_url', '"http://nova-goalert:8081"', NULL),
('goalert', 'webhook_secret', '"nova-goalert-webhook-secret"', NULL),
('goalert', 'sync_enabled', 'true', NULL),
('goalert', 'sync_interval_seconds', '30', NULL),
('uptime_kuma', 'api_url', '"http://nova-uptime-kuma-backend:3001"', NULL),
('uptime_kuma', 'sync_enabled', 'true', NULL),
('uptime_kuma', 'sync_interval_seconds', '30', NULL),
('nova_monitoring', 'alert_correlation_enabled', 'true', NULL),
('nova_monitoring', 'auto_incident_creation', 'true', NULL),
('nova_monitoring', 'sla_tracking_enabled', 'true', NULL),
('nova_monitoring', 'default_response_sla_minutes', '15', NULL),
('nova_monitoring', 'default_resolution_sla_minutes', '240', NULL)
ON CONFLICT (service_name, config_key, tenant_id) DO NOTHING;

-- Create Views for Common Queries
-- Active alerts with monitor information
CREATE OR REPLACE VIEW active_alerts_with_monitors AS
SELECT 
    a.*,
    m.name as monitor_name,
    m.type as monitor_type,
    m.url as monitor_url,
    u.email as assigned_to_email,
    u.first_name || ' ' || u.last_name as assigned_to_name
FROM nova_alerts a
LEFT JOIN monitors m ON a.monitor_id = m.id
LEFT JOIN users u ON a.assigned_to = u.id
WHERE a.status IN ('active', 'acknowledged');

-- Current on-call assignments
CREATE OR REPLACE VIEW current_oncall_assignments AS
SELECT 
    oa.*,
    os.name as schedule_name,
    u.email as user_email,
    u.first_name || ' ' || u.last_name as user_name
FROM oncall_assignments oa
JOIN oncall_schedules os ON oa.schedule_id = os.id
JOIN users u ON oa.user_id = u.id
WHERE oa.start_time <= CURRENT_TIMESTAMP 
AND oa.end_time >= CURRENT_TIMESTAMP
AND os.is_active = true;

-- Service health summary
CREATE OR REPLACE VIEW service_health_summary AS
SELECT 
    service_type,
    COUNT(*) as total_services,
    COUNT(CASE WHEN status = 'healthy' THEN 1 END) as healthy_count,
    COUNT(CASE WHEN status = 'degraded' THEN 1 END) as degraded_count,
    COUNT(CASE WHEN status = 'unhealthy' THEN 1 END) as unhealthy_count,
    COUNT(CASE WHEN status = 'unknown' THEN 1 END) as unknown_count,
    AVG(health_score) as avg_health_score
FROM service_health_status
GROUP BY service_type;

-- Alert statistics
CREATE OR REPLACE VIEW alert_statistics AS
SELECT 
    DATE_TRUNC('day', created_at) as date,
    severity,
    COUNT(*) as alert_count,
    COUNT(CASE WHEN acknowledged_at IS NOT NULL THEN 1 END) as acknowledged_count,
    COUNT(CASE WHEN resolved_at IS NOT NULL THEN 1 END) as resolved_count,
    COUNT(CASE WHEN sla_breached = true THEN 1 END) as sla_breach_count,
    AVG(CASE WHEN acknowledged_at IS NOT NULL 
        THEN EXTRACT(EPOCH FROM (acknowledged_at - created_at)) / 60 END) as avg_response_time_minutes,
    AVG(CASE WHEN resolved_at IS NOT NULL 
        THEN EXTRACT(EPOCH FROM (resolved_at - created_at)) / 60 END) as avg_resolution_time_minutes
FROM nova_alerts
WHERE created_at >= CURRENT_DATE - INTERVAL '30 days'
GROUP BY DATE_TRUNC('day', created_at), severity
ORDER BY date DESC, severity;

-- Grant appropriate permissions
GRANT SELECT ON active_alerts_with_monitors TO api_user;
GRANT SELECT ON current_oncall_assignments TO api_user;
GRANT SELECT ON service_health_summary TO api_user;
GRANT SELECT ON alert_statistics TO api_user;

-- Create monitoring functions for health checks
CREATE OR REPLACE FUNCTION get_service_health(service_name_param TEXT)
RETURNS TABLE(
    service_name TEXT,
    status TEXT,
    health_score INTEGER,
    last_check TIMESTAMP,
    uptime_percentage NUMERIC
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        shs.service_name::TEXT,
        shs.status::TEXT,
        shs.health_score,
        shs.last_check,
        CASE 
            WHEN shs.last_healthy IS NOT NULL THEN
                (EXTRACT(EPOCH FROM (CURRENT_TIMESTAMP - shs.last_healthy)) / 
                 EXTRACT(EPOCH FROM (CURRENT_TIMESTAMP - shs.created_at))) * 100
            ELSE 0
        END::NUMERIC as uptime_percentage
    FROM service_health_status shs
    WHERE shs.service_name = service_name_param;
END;
$$ LANGUAGE plpgsql;

-- Function to get alert metrics
CREATE OR REPLACE FUNCTION get_alert_metrics(days_back INTEGER DEFAULT 7)
RETURNS TABLE(
    total_alerts BIGINT,
    active_alerts BIGINT,
    acknowledged_alerts BIGINT,
    resolved_alerts BIGINT,
    critical_alerts BIGINT,
    avg_response_time_minutes NUMERIC,
    avg_resolution_time_minutes NUMERIC,
    sla_breach_rate NUMERIC
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        COUNT(*)::BIGINT as total_alerts,
        COUNT(CASE WHEN status = 'active' THEN 1 END)::BIGINT as active_alerts,
        COUNT(CASE WHEN status = 'acknowledged' THEN 1 END)::BIGINT as acknowledged_alerts,
        COUNT(CASE WHEN status = 'resolved' THEN 1 END)::BIGINT as resolved_alerts,
        COUNT(CASE WHEN severity = 'critical' THEN 1 END)::BIGINT as critical_alerts,
        AVG(CASE WHEN acknowledged_at IS NOT NULL 
            THEN EXTRACT(EPOCH FROM (acknowledged_at - created_at)) / 60 END)::NUMERIC as avg_response_time_minutes,
        AVG(CASE WHEN resolved_at IS NOT NULL 
            THEN EXTRACT(EPOCH FROM (resolved_at - created_at)) / 60 END)::NUMERIC as avg_resolution_time_minutes,
        (COUNT(CASE WHEN sla_breached = true THEN 1 END)::NUMERIC / COUNT(*)::NUMERIC * 100) as sla_breach_rate
    FROM nova_alerts
    WHERE created_at >= CURRENT_TIMESTAMP - INTERVAL '%s days' USING (days_back);
END;
$$ LANGUAGE plpgsql;

COMMENT ON TABLE monitoring_user_mappings IS 'Maps Nova users to service-specific credentials for GoAlert and Uptime Kuma';
COMMENT ON TABLE integration_configurations IS 'Central configuration store for all monitoring and alerting services';
COMMENT ON TABLE integration_events IS 'Event sourcing table for tracking data synchronization between services';
COMMENT ON TABLE nova_alerts IS 'Unified alert store bridging GoAlert alerts with Nova monitoring system';
COMMENT ON TABLE oncall_schedules IS 'Local cache of GoAlert on-call schedules for Nova UI integration';
COMMENT ON TABLE service_health_status IS 'Health monitoring for all integrated monitoring and alerting services';
COMMENT ON TABLE notification_deliveries IS 'Tracking all notifications sent across the integrated system';
COMMENT ON TABLE integration_audit_log IS 'Comprehensive audit log for all integration activities and changes';
