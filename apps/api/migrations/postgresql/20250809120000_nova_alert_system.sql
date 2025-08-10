-- Nova Alert System Database Schema
-- Support for GoAlert integration audit logging and RBAC

-- Alert audit log table for tracking all alert operations
CREATE TABLE IF NOT EXISTS alert_audit_log (
    id SERIAL PRIMARY KEY,
    user_id VARCHAR(255) NOT NULL,
    operation VARCHAR(50) NOT NULL, -- create, escalate, resolve, acknowledge, rotate
    alert_id VARCHAR(255), -- GoAlert alert ID
    schedule_id VARCHAR(255), -- GoAlert schedule ID  
    service_id VARCHAR(255), -- GoAlert service ID
    source_ticket_id VARCHAR(255), -- Nova ticket ID if applicable
    delivery_status VARCHAR(50) DEFAULT 'pending', -- pending, delivered, failed
    metadata JSONB, -- Additional operation metadata
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Indexes for performance
    INDEX idx_alert_audit_user_id (user_id),
    INDEX idx_alert_audit_alert_id (alert_id),
    INDEX idx_alert_audit_ticket_id (source_ticket_id),
    INDEX idx_alert_audit_created_at (created_at),
    INDEX idx_alert_audit_operation (operation)
);

-- Alert escalation policies configuration
CREATE TABLE IF NOT EXISTS alert_escalation_policies (
    id VARCHAR(255) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    goalert_policy_id VARCHAR(255) UNIQUE NOT NULL,
    team_id VARCHAR(255),
    priority_threshold VARCHAR(50) DEFAULT 'medium',
    auto_escalate_minutes INTEGER DEFAULT 30,
    enabled BOOLEAN DEFAULT true,
    created_by VARCHAR(255) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Alert service mappings (Nova teams/departments to GoAlert services)
CREATE TABLE IF NOT EXISTS alert_service_mappings (
    id SERIAL PRIMARY KEY,
    nova_team VARCHAR(255) NOT NULL,
    nova_department VARCHAR(255),
    goalert_service_id VARCHAR(255) NOT NULL,
    goalert_service_name VARCHAR(255) NOT NULL,
    default_priority VARCHAR(50) DEFAULT 'medium',
    enabled BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Ensure unique mapping per team/department
    UNIQUE(nova_team, nova_department)
);

-- Insert default service mappings
INSERT INTO alert_service_mappings (nova_team, nova_department, goalert_service_id, goalert_service_name, default_priority) VALUES
('ops', 'infrastructure', 'ops-infra-001', 'Ops Infrastructure Team', 'high'),
('ops', 'network', 'ops-network-001', 'Ops Network Team', 'high'),
('security', 'cybersecurity', 'security-001', 'Cybersecurity Team', 'critical'),
('support', 'helpdesk', 'support-l1-001', 'Level 1 Support', 'medium'),
('support', 'escalation', 'support-l2-001', 'Level 2 Support', 'high')
ON CONFLICT (nova_team, nova_department) DO NOTHING;

-- Alert notification channels configuration
CREATE TABLE IF NOT EXISTS alert_notification_channels (
    id SERIAL PRIMARY KEY,
    channel_type VARCHAR(50) NOT NULL, -- email, sms, slack, teams, webhook
    channel_name VARCHAR(255) NOT NULL,
    goalert_channel_id VARCHAR(255),
    configuration JSONB NOT NULL, -- Channel-specific config (webhook URL, Slack channel, etc.)
    user_id VARCHAR(255), -- If user-specific channel
    team_id VARCHAR(255), -- If team-wide channel
    enabled BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    INDEX idx_alert_channels_user_id (user_id),
    INDEX idx_alert_channels_team_id (team_id),
    INDEX idx_alert_channels_type (channel_type)
);

-- Alert suppression windows (maintenance windows, holidays, etc.)
CREATE TABLE IF NOT EXISTS alert_suppression_windows (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    start_time TIMESTAMP WITH TIME ZONE NOT NULL,
    end_time TIMESTAMP WITH TIME ZONE NOT NULL,
    service_ids JSONB, -- Array of GoAlert service IDs to suppress
    reason VARCHAR(500),
    created_by VARCHAR(255) NOT NULL,
    enabled BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    INDEX idx_alert_suppression_times (start_time, end_time),
    INDEX idx_alert_suppression_enabled (enabled)
);

-- User alert preferences
CREATE TABLE IF NOT EXISTS user_alert_preferences (
    id SERIAL PRIMARY KEY,
    user_id VARCHAR(255) UNIQUE NOT NULL,
    goalert_user_id VARCHAR(255), -- Mapping to GoAlert user ID
    notification_methods JSONB DEFAULT '["email"]', -- Array of notification methods
    quiet_hours_start TIME, -- Start of quiet hours (no non-critical alerts)
    quiet_hours_end TIME, -- End of quiet hours
    timezone VARCHAR(100) DEFAULT 'UTC',
    auto_acknowledge_timeout INTEGER DEFAULT 300, -- Seconds
    escalation_delay INTEGER DEFAULT 900, -- Seconds before escalating unacknowledged alerts
    enabled BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Alert workflow automation rules
CREATE TABLE IF NOT EXISTS alert_workflow_rules (
    id SERIAL PRIMARY KEY,
    rule_name VARCHAR(255) NOT NULL,
    description TEXT,
    trigger_conditions JSONB NOT NULL, -- Conditions that trigger the rule
    actions JSONB NOT NULL, -- Actions to take when triggered
    priority INTEGER DEFAULT 100, -- Rule priority (lower = higher priority)
    enabled BOOLEAN DEFAULT true,
    created_by VARCHAR(255) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    INDEX idx_alert_workflow_enabled (enabled),
    INDEX idx_alert_workflow_priority (priority)
);

-- Insert default workflow rules
INSERT INTO alert_workflow_rules (rule_name, description, trigger_conditions, actions, priority, created_by) VALUES
(
    'VIP Customer Critical Escalation',
    'Automatically escalate critical issues for VIP customers to management',
    '{"ticket.priority": "critical", "customer.tier": "vip", "time_threshold": 900}',
    '{"escalate_to": "management", "notify": ["vip_team", "director"], "priority": "critical"}',
    10,
    'system'
),
(
    'Security Incident Auto-Alert',
    'Automatically create security alerts for security-related tickets',
    '{"ticket.category": "security", "keywords": ["breach", "malware", "phishing", "unauthorized"]}',
    '{"create_alert": true, "service": "security-001", "priority": "high", "notify": ["security_team"]}',
    20,
    'system'
),
(
    'Infrastructure Down Escalation',
    'Escalate infrastructure outages affecting multiple users',
    '{"ticket.category": "infrastructure", "affected_users": ">10", "time_threshold": 600}',
    '{"escalate_to": "ops_manager", "create_alert": true, "service": "ops-infra-001", "priority": "critical"}',
    15,
    'system'
)
ON CONFLICT DO NOTHING;

-- Add alert-related columns to existing tickets table if not present
ALTER TABLE tickets 
ADD COLUMN IF NOT EXISTS escalated BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS escalated_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS escalation_reason TEXT,
ADD COLUMN IF NOT EXISTS alert_id VARCHAR(255),
ADD COLUMN IF NOT EXISTS alert_acknowledged BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS alert_acknowledged_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS alert_acknowledged_by VARCHAR(255);

-- Create indexes for alert-related ticket columns
CREATE INDEX IF NOT EXISTS idx_tickets_escalated ON tickets (escalated);
CREATE INDEX IF NOT EXISTS idx_tickets_alert_id ON tickets (alert_id);
CREATE INDEX IF NOT EXISTS idx_tickets_alert_acknowledged ON tickets (alert_acknowledged);

-- Function to update timestamp on alert preference changes
CREATE OR REPLACE FUNCTION update_alert_preferences_timestamp()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for alert preferences timestamp updates
DROP TRIGGER IF EXISTS trigger_update_alert_preferences_timestamp ON user_alert_preferences;
CREATE TRIGGER trigger_update_alert_preferences_timestamp
    BEFORE UPDATE ON user_alert_preferences
    FOR EACH ROW
    EXECUTE FUNCTION update_alert_preferences_timestamp();

-- Function to update timestamp on escalation policy changes  
CREATE OR REPLACE FUNCTION update_escalation_policies_timestamp()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for escalation policies timestamp updates
DROP TRIGGER IF EXISTS trigger_update_escalation_policies_timestamp ON alert_escalation_policies;
CREATE TRIGGER trigger_update_escalation_policies_timestamp
    BEFORE UPDATE ON alert_escalation_policies
    FOR EACH ROW
    EXECUTE FUNCTION update_escalation_policies_timestamp();

-- Grant appropriate permissions
GRANT SELECT, INSERT, UPDATE ON alert_audit_log TO nova_api;
GRANT SELECT, INSERT, UPDATE, DELETE ON alert_escalation_policies TO nova_api;
GRANT SELECT, INSERT, UPDATE, DELETE ON alert_service_mappings TO nova_api;
GRANT SELECT, INSERT, UPDATE, DELETE ON alert_notification_channels TO nova_api;
GRANT SELECT, INSERT, UPDATE, DELETE ON alert_suppression_windows TO nova_api;
GRANT SELECT, INSERT, UPDATE, DELETE ON user_alert_preferences TO nova_api;
GRANT SELECT, INSERT, UPDATE, DELETE ON alert_workflow_rules TO nova_api;

-- Grant sequence permissions
GRANT USAGE, SELECT ON SEQUENCE alert_audit_log_id_seq TO nova_api;
GRANT USAGE, SELECT ON SEQUENCE alert_service_mappings_id_seq TO nova_api;
GRANT USAGE, SELECT ON SEQUENCE alert_notification_channels_id_seq TO nova_api;
GRANT USAGE, SELECT ON SEQUENCE alert_suppression_windows_id_seq TO nova_api;
GRANT USAGE, SELECT ON SEQUENCE user_alert_preferences_id_seq TO nova_api;
GRANT USAGE, SELECT ON SEQUENCE alert_workflow_rules_id_seq TO nova_api;

-- ========================================================================
-- NOVA SENTINEL INTEGRATION TABLES
-- ========================================================================

-- Monitoring monitors (Nova Sentinel integration)
CREATE TABLE IF NOT EXISTS monitoring_monitors (
    id SERIAL PRIMARY KEY,
    kuma_id VARCHAR(255) UNIQUE NOT NULL, -- Uptime Kuma monitor ID
    name VARCHAR(255) NOT NULL,
    type VARCHAR(50) NOT NULL, -- http, tcp, ping, dns, ssl, push
    url TEXT,
    hostname VARCHAR(255),
    port INTEGER,
    tenant_id VARCHAR(255) NOT NULL,
    created_by VARCHAR(255) NOT NULL,
    alerts_enabled BOOLEAN DEFAULT true,
    public_status BOOLEAN DEFAULT false,
    notification_settings JSONB,
    tags JSONB DEFAULT '[]',
    status VARCHAR(50) DEFAULT 'pending', -- pending, up, down, maintenance
    last_check TIMESTAMP WITH TIME ZONE,
    uptime_24h DECIMAL(5,2) DEFAULT 0,
    uptime_7d DECIMAL(5,2) DEFAULT 0,
    uptime_30d DECIMAL(5,2) DEFAULT 0,
    avg_response_time INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    deleted_at TIMESTAMP WITH TIME ZONE,
    
    -- Indexes
    INDEX idx_monitoring_monitors_kuma_id (kuma_id),
    INDEX idx_monitoring_monitors_tenant_id (tenant_id),
    INDEX idx_monitoring_monitors_status (status),
    INDEX idx_monitoring_monitors_type (type),
    INDEX idx_monitoring_monitors_created_by (created_by)
);

-- Monitoring incidents (correlation between Sentinel and Alerts)
CREATE TABLE IF NOT EXISTS monitoring_incidents (
    id SERIAL PRIMARY KEY,
    monitor_id VARCHAR(255) NOT NULL, -- References monitoring_monitors.kuma_id
    monitor_name VARCHAR(255) NOT NULL,
    ticket_id VARCHAR(255), -- References tickets.id if ticket created
    alert_id VARCHAR(255), -- References alert system if alert created
    status VARCHAR(50) DEFAULT 'active', -- active, acknowledged, investigating, resolved
    severity VARCHAR(50) NOT NULL, -- low, medium, high, critical
    summary TEXT NOT NULL,
    description TEXT,
    tenant_id VARCHAR(255) NOT NULL,
    downtime_duration INTEGER, -- Minutes of downtime
    auto_resolved BOOLEAN DEFAULT false,
    acknowledged_by VARCHAR(255),
    acknowledged_at TIMESTAMP WITH TIME ZONE,
    resolved_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Indexes
    INDEX idx_monitoring_incidents_monitor_id (monitor_id),
    INDEX idx_monitoring_incidents_status (status),
    INDEX idx_monitoring_incidents_severity (severity),
    INDEX idx_monitoring_incidents_tenant_id (tenant_id),
    INDEX idx_monitoring_incidents_ticket_id (ticket_id),
    INDEX idx_monitoring_incidents_alert_id (alert_id),
    INDEX idx_monitoring_incidents_created_at (created_at)
);

-- Monitoring events (heartbeat and status changes)
CREATE TABLE IF NOT EXISTS monitoring_events (
    id SERIAL PRIMARY KEY,
    monitor_id VARCHAR(255) NOT NULL,
    monitor_name VARCHAR(255) NOT NULL,
    event_type VARCHAR(50) NOT NULL, -- up, down, maintenance, test
    status VARCHAR(50) NOT NULL,
    message TEXT,
    ping_time INTEGER, -- Response time in milliseconds
    status_code INTEGER,
    important BOOLEAN DEFAULT false,
    tenant_id VARCHAR(255) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Indexes for performance
    INDEX idx_monitoring_events_monitor_id (monitor_id),
    INDEX idx_monitoring_events_tenant_id (tenant_id),
    INDEX idx_monitoring_events_created_at (created_at),
    INDEX idx_monitoring_events_event_type (event_type),
    INDEX idx_monitoring_events_important (important)
);

-- Monitor heartbeats (detailed monitoring data)
CREATE TABLE IF NOT EXISTS monitor_heartbeats (
    id SERIAL PRIMARY KEY,
    monitor_id VARCHAR(255) NOT NULL,
    status VARCHAR(10) NOT NULL, -- up, down
    response_time_ms INTEGER,
    status_code INTEGER,
    error_message TEXT,
    checked_at TIMESTAMP WITH TIME ZONE NOT NULL,
    important BOOLEAN DEFAULT false,
    
    -- Indexes
    INDEX idx_monitor_heartbeats_monitor_id (monitor_id),
    INDEX idx_monitor_heartbeats_checked_at (checked_at),
    INDEX idx_monitor_heartbeats_status (status)
);

-- Monitor subscriptions (user notification preferences)
CREATE TABLE IF NOT EXISTS monitor_subscriptions (
    id SERIAL PRIMARY KEY,
    monitor_id VARCHAR(255) NOT NULL,
    user_id VARCHAR(255) NOT NULL,
    notification_type VARCHAR(50) NOT NULL, -- email, slack, sms, webhook
    notification_config JSONB DEFAULT '{}',
    active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Unique constraint to prevent duplicate subscriptions
    UNIQUE(monitor_id, user_id, notification_type),
    
    -- Indexes
    INDEX idx_monitor_subscriptions_monitor_id (monitor_id),
    INDEX idx_monitor_subscriptions_user_id (user_id),
    INDEX idx_monitor_subscriptions_active (active)
);

-- Status page configurations (Orbit integration)
CREATE TABLE IF NOT EXISTS status_page_configs (
    id SERIAL PRIMARY KEY,
    tenant_id VARCHAR(255) UNIQUE NOT NULL,
    title VARCHAR(255) DEFAULT 'Service Status',
    description TEXT,
    logo_url TEXT,
    favicon_url TEXT,
    custom_css TEXT,
    show_uptime_percentages BOOLEAN DEFAULT true,
    show_incident_history_days INTEGER DEFAULT 30,
    show_maintenance_windows BOOLEAN DEFAULT true,
    custom_domain VARCHAR(255),
    enabled BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Indexes
    INDEX idx_status_page_configs_tenant_id (tenant_id),
    INDEX idx_status_page_configs_enabled (enabled)
);

-- Maintenance windows
CREATE TABLE IF NOT EXISTS maintenance_windows (
    id SERIAL PRIMARY KEY,
    tenant_id VARCHAR(255) NOT NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    status VARCHAR(50) DEFAULT 'scheduled', -- scheduled, in_progress, completed, cancelled
    scheduled_start TIMESTAMP WITH TIME ZONE NOT NULL,
    scheduled_end TIMESTAMP WITH TIME ZONE NOT NULL,
    actual_start TIMESTAMP WITH TIME ZONE,
    actual_end TIMESTAMP WITH TIME ZONE,
    affected_services JSONB DEFAULT '[]', -- Array of monitor IDs
    created_by VARCHAR(255) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Indexes
    INDEX idx_maintenance_windows_tenant_id (tenant_id),
    INDEX idx_maintenance_windows_status (status),
    INDEX idx_maintenance_windows_scheduled_start (scheduled_start),
    INDEX idx_maintenance_windows_scheduled_end (scheduled_end)
);

-- Monitor groups (organization and categorization)
CREATE TABLE IF NOT EXISTS monitor_groups (
    id SERIAL PRIMARY KEY,
    tenant_id VARCHAR(255) NOT NULL,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    color VARCHAR(7), -- Hex color code
    created_by VARCHAR(255) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Unique group names per tenant
    UNIQUE(tenant_id, name),
    
    -- Indexes
    INDEX idx_monitor_groups_tenant_id (tenant_id)
);

-- Monitor group memberships
CREATE TABLE IF NOT EXISTS monitor_group_members (
    id SERIAL PRIMARY KEY,
    group_id INTEGER NOT NULL REFERENCES monitor_groups(id) ON DELETE CASCADE,
    monitor_id VARCHAR(255) NOT NULL,
    added_by VARCHAR(255) NOT NULL,
    added_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Unique membership
    UNIQUE(group_id, monitor_id),
    
    -- Indexes
    INDEX idx_monitor_group_members_group_id (group_id),
    INDEX idx_monitor_group_members_monitor_id (monitor_id)
);

-- Monitoring audit log (Sentinel operations)
CREATE TABLE IF NOT EXISTS monitoring_audit_log (
    id SERIAL PRIMARY KEY,
    user_id VARCHAR(255) NOT NULL,
    operation VARCHAR(50) NOT NULL, -- create, update, delete, acknowledge, resolve
    monitor_id VARCHAR(255),
    monitor_name VARCHAR(255),
    monitor_type VARCHAR(50),
    incident_id INTEGER,
    metadata JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Indexes
    INDEX idx_monitoring_audit_log_user_id (user_id),
    INDEX idx_monitoring_audit_log_monitor_id (monitor_id),
    INDEX idx_monitoring_audit_log_operation (operation),
    INDEX idx_monitoring_audit_log_created_at (created_at)
);

-- Insert default status page configuration for system tenant
INSERT INTO status_page_configs (tenant_id, title, description) VALUES
('system', 'Nova Universe Status', 'Current status of Nova Universe services')
ON CONFLICT (tenant_id) DO NOTHING;

-- Insert default monitor groups
INSERT INTO monitor_groups (tenant_id, name, description, color, created_by) VALUES
('system', 'Core Services', 'Essential Nova Universe services', '#3B82F6', 'system'),
('system', 'Infrastructure', 'Infrastructure and network services', '#10B981', 'system'),
('system', 'External APIs', 'Third-party service dependencies', '#F59E0B', 'system'),
('system', 'Security', 'Security and authentication services', '#EF4444', 'system')
ON CONFLICT (tenant_id, name) DO NOTHING;

-- Grant permissions for Sentinel tables
GRANT SELECT, INSERT, UPDATE, DELETE ON monitoring_monitors TO nova_api;
GRANT SELECT, INSERT, UPDATE, DELETE ON monitoring_incidents TO nova_api;
GRANT SELECT, INSERT, UPDATE ON monitoring_events TO nova_api;
GRANT SELECT, INSERT, UPDATE ON monitor_heartbeats TO nova_api;
GRANT SELECT, INSERT, UPDATE, DELETE ON monitor_subscriptions TO nova_api;
GRANT SELECT, INSERT, UPDATE, DELETE ON status_page_configs TO nova_api;
GRANT SELECT, INSERT, UPDATE, DELETE ON maintenance_windows TO nova_api;
GRANT SELECT, INSERT, UPDATE, DELETE ON monitor_groups TO nova_api;
GRANT SELECT, INSERT, UPDATE, DELETE ON monitor_group_members TO nova_api;
GRANT SELECT, INSERT, UPDATE ON monitoring_audit_log TO nova_api;

-- Grant sequence permissions for Sentinel tables
GRANT USAGE, SELECT ON SEQUENCE monitoring_monitors_id_seq TO nova_api;
GRANT USAGE, SELECT ON SEQUENCE monitoring_incidents_id_seq TO nova_api;
GRANT USAGE, SELECT ON SEQUENCE monitoring_events_id_seq TO nova_api;
GRANT USAGE, SELECT ON SEQUENCE monitor_heartbeats_id_seq TO nova_api;
GRANT USAGE, SELECT ON SEQUENCE monitor_subscriptions_id_seq TO nova_api;
GRANT USAGE, SELECT ON SEQUENCE status_page_configs_id_seq TO nova_api;
GRANT USAGE, SELECT ON SEQUENCE maintenance_windows_id_seq TO nova_api;
GRANT USAGE, SELECT ON SEQUENCE monitor_groups_id_seq TO nova_api;
GRANT USAGE, SELECT ON SEQUENCE monitor_group_members_id_seq TO nova_api;
GRANT USAGE, SELECT ON SEQUENCE monitoring_audit_log_id_seq TO nova_api;

-- Create functions for automatic timestamp updates
CREATE OR REPLACE FUNCTION update_monitoring_timestamps()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers for automatic timestamp updates
DROP TRIGGER IF EXISTS trigger_update_monitoring_monitors_timestamp ON monitoring_monitors;
CREATE TRIGGER trigger_update_monitoring_monitors_timestamp
    BEFORE UPDATE ON monitoring_monitors
    FOR EACH ROW
    EXECUTE FUNCTION update_monitoring_timestamps();

DROP TRIGGER IF EXISTS trigger_update_monitoring_incidents_timestamp ON monitoring_incidents;
CREATE TRIGGER trigger_update_monitoring_incidents_timestamp
    BEFORE UPDATE ON monitoring_incidents
    FOR EACH ROW
    EXECUTE FUNCTION update_monitoring_timestamps();

DROP TRIGGER IF EXISTS trigger_update_status_page_configs_timestamp ON status_page_configs;
CREATE TRIGGER trigger_update_status_page_configs_timestamp
    BEFORE UPDATE ON status_page_configs
    FOR EACH ROW
    EXECUTE FUNCTION update_monitoring_timestamps();

DROP TRIGGER IF EXISTS trigger_update_maintenance_windows_timestamp ON maintenance_windows;
CREATE TRIGGER trigger_update_maintenance_windows_timestamp
    BEFORE UPDATE ON maintenance_windows
    FOR EACH ROW
    EXECUTE FUNCTION update_monitoring_timestamps();

DROP TRIGGER IF EXISTS trigger_update_monitor_groups_timestamp ON monitor_groups;
CREATE TRIGGER trigger_update_monitor_groups_timestamp
    BEFORE UPDATE ON monitor_groups
    FOR EACH ROW
    EXECUTE FUNCTION update_monitoring_timestamps();

-- ========================================================================
-- HELIX USER PREFERENCES (GoAlert Settings Persistence)
-- ========================================================================

-- User preferences table for storing GoAlert settings in Helix
CREATE TABLE IF NOT EXISTS helix_user_preferences (
    id SERIAL PRIMARY KEY,
    user_id VARCHAR(255) NOT NULL,
    preference_key VARCHAR(255) NOT NULL,
    preference_value JSONB NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Unique constraint to prevent duplicate preferences
    UNIQUE(user_id, preference_key),
    
    -- Indexes
    INDEX idx_helix_user_preferences_user_id (user_id),
    INDEX idx_helix_user_preferences_key (preference_key),
    INDEX idx_helix_user_preferences_updated_at (updated_at)
);

-- Grant permissions
GRANT SELECT, INSERT, UPDATE, DELETE ON helix_user_preferences TO nova_api;
GRANT USAGE, SELECT ON SEQUENCE helix_user_preferences_id_seq TO nova_api;

-- Trigger for automatic timestamp updates
DROP TRIGGER IF EXISTS trigger_update_helix_user_preferences_timestamp ON helix_user_preferences;
CREATE TRIGGER trigger_update_helix_user_preferences_timestamp
    BEFORE UPDATE ON helix_user_preferences
    FOR EACH ROW
    EXECUTE FUNCTION update_monitoring_timestamps();

-- ========================================================================
-- GOALERT INTEGRATION TABLES
-- ========================================================================

-- GoAlert services mapping (Nova metadata for GoAlert services)
CREATE TABLE IF NOT EXISTS goalert_services (
    id SERIAL PRIMARY KEY,
    goalert_service_id VARCHAR(255) UNIQUE NOT NULL,
    nova_tenant_id VARCHAR(255) NOT NULL,
    created_by VARCHAR(255) NOT NULL,
    last_sync TIMESTAMP WITH TIME ZONE,
    sync_enabled BOOLEAN DEFAULT true,
    escalation_policy_id VARCHAR(255),
    integration_keys JSONB DEFAULT '[]',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Indexes
    INDEX idx_goalert_services_goalert_id (goalert_service_id),
    INDEX idx_goalert_services_tenant_id (nova_tenant_id),
    INDEX idx_goalert_services_created_by (created_by),
    INDEX idx_goalert_services_sync_enabled (sync_enabled)
);

-- GoAlert escalation policies mapping
CREATE TABLE IF NOT EXISTS goalert_escalation_policies (
    id SERIAL PRIMARY KEY,
    goalert_policy_id VARCHAR(255) UNIQUE NOT NULL,
    nova_tenant_id VARCHAR(255) NOT NULL,
    created_by VARCHAR(255) NOT NULL,
    steps JSONB NOT NULL DEFAULT '[]',
    repeat_count INTEGER DEFAULT 0,
    last_sync TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Indexes
    INDEX idx_goalert_escalation_policies_goalert_id (goalert_policy_id),
    INDEX idx_goalert_escalation_policies_tenant_id (nova_tenant_id),
    INDEX idx_goalert_escalation_policies_created_by (created_by)
);

-- GoAlert schedules mapping
CREATE TABLE IF NOT EXISTS goalert_schedules (
    id SERIAL PRIMARY KEY,
    goalert_schedule_id VARCHAR(255) UNIQUE NOT NULL,
    nova_tenant_id VARCHAR(255) NOT NULL,
    created_by VARCHAR(255) NOT NULL,
    time_zone VARCHAR(100) NOT NULL,
    current_on_call JSONB DEFAULT '[]',
    last_sync TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Indexes
    INDEX idx_goalert_schedules_goalert_id (goalert_schedule_id),
    INDEX idx_goalert_schedules_tenant_id (nova_tenant_id),
    INDEX idx_goalert_schedules_created_by (created_by)
);

-- GoAlert users mapping (Nova users to GoAlert users)
CREATE TABLE IF NOT EXISTS goalert_users (
    id SERIAL PRIMARY KEY,
    nova_user_id VARCHAR(255) NOT NULL,
    goalert_user_id VARCHAR(255) UNIQUE NOT NULL,
    contact_methods JSONB DEFAULT '[]',
    notification_rules JSONB DEFAULT '[]',
    last_sync TIMESTAMP WITH TIME ZONE,
    sync_enabled BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Indexes
    INDEX idx_goalert_users_nova_user_id (nova_user_id),
    INDEX idx_goalert_users_goalert_user_id (goalert_user_id),
    INDEX idx_goalert_users_sync_enabled (sync_enabled)
);

-- GoAlert alerts correlation (link GoAlert alerts to Nova tickets)
CREATE TABLE IF NOT EXISTS goalert_alerts (
    id SERIAL PRIMARY KEY,
    goalert_alert_id VARCHAR(255) UNIQUE NOT NULL,
    goalert_service_id VARCHAR(255) NOT NULL,
    nova_ticket_id VARCHAR(255), -- Link to Nova ticketing system
    nova_monitoring_incident_id INTEGER, -- Link to monitoring incidents
    status VARCHAR(50) NOT NULL, -- active, acknowledged, closed
    summary TEXT NOT NULL,
    details TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    acknowledged_at TIMESTAMP WITH TIME ZONE,
    acknowledged_by VARCHAR(255),
    closed_at TIMESTAMP WITH TIME ZONE,
    closed_by VARCHAR(255),
    
    -- Foreign key to monitoring incidents
    FOREIGN KEY (nova_monitoring_incident_id) REFERENCES monitoring_incidents(id),
    
    -- Indexes
    INDEX idx_goalert_alerts_goalert_alert_id (goalert_alert_id),
    INDEX idx_goalert_alerts_service_id (goalert_service_id),
    INDEX idx_goalert_alerts_nova_ticket_id (nova_ticket_id),
    INDEX idx_goalert_alerts_status (status),
    INDEX idx_goalert_alerts_created_at (created_at)
);

-- Grant permissions for GoAlert tables
GRANT SELECT, INSERT, UPDATE, DELETE ON goalert_services TO nova_api;
GRANT SELECT, INSERT, UPDATE, DELETE ON goalert_escalation_policies TO nova_api;
GRANT SELECT, INSERT, UPDATE, DELETE ON goalert_schedules TO nova_api;
GRANT SELECT, INSERT, UPDATE, DELETE ON goalert_users TO nova_api;
GRANT SELECT, INSERT, UPDATE, DELETE ON goalert_alerts TO nova_api;

-- Grant sequence permissions for GoAlert tables
GRANT USAGE, SELECT ON SEQUENCE goalert_services_id_seq TO nova_api;
GRANT USAGE, SELECT ON SEQUENCE goalert_escalation_policies_id_seq TO nova_api;
GRANT USAGE, SELECT ON SEQUENCE goalert_schedules_id_seq TO nova_api;
GRANT USAGE, SELECT ON SEQUENCE goalert_users_id_seq TO nova_api;
GRANT USAGE, SELECT ON SEQUENCE goalert_alerts_id_seq TO nova_api;

-- Triggers for automatic timestamp updates on GoAlert tables
DROP TRIGGER IF EXISTS trigger_update_goalert_services_timestamp ON goalert_services;
CREATE TRIGGER trigger_update_goalert_services_timestamp
    BEFORE UPDATE ON goalert_services
    FOR EACH ROW
    EXECUTE FUNCTION update_monitoring_timestamps();

DROP TRIGGER IF EXISTS trigger_update_goalert_escalation_policies_timestamp ON goalert_escalation_policies;
CREATE TRIGGER trigger_update_goalert_escalation_policies_timestamp
    BEFORE UPDATE ON goalert_escalation_policies
    FOR EACH ROW
    EXECUTE FUNCTION update_monitoring_timestamps();

DROP TRIGGER IF EXISTS trigger_update_goalert_schedules_timestamp ON goalert_schedules;
CREATE TRIGGER trigger_update_goalert_schedules_timestamp
    BEFORE UPDATE ON goalert_schedules
    FOR EACH ROW
    EXECUTE FUNCTION update_monitoring_timestamps();

DROP TRIGGER IF EXISTS trigger_update_goalert_users_timestamp ON goalert_users;
CREATE TRIGGER trigger_update_goalert_users_timestamp
    BEFORE UPDATE ON goalert_users
    FOR EACH ROW
    EXECUTE FUNCTION update_monitoring_timestamps();
