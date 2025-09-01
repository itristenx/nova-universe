-- GoAlert Schema Integration with Nova Universe Database
-- Migration: 20250101000000_goalert_schema_integration.sql
-- Description: Creates GoAlert schema within Nova's PostgreSQL database

-- Create GoAlert schema namespace
CREATE SCHEMA IF NOT EXISTS goalert;

-- Set search path to include GoAlert schema
SET search_path TO goalert, public;

-- GoAlert Core Tables (based on GoAlert v0.29+ schema)
-- These tables replicate GoAlert's internal structure within Nova's database

-- Users table for GoAlert (synced with Nova users)
CREATE TABLE IF NOT EXISTS goalert.users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    email TEXT NOT NULL UNIQUE,
    role TEXT NOT NULL DEFAULT 'user' CHECK (role IN ('admin', 'user')),
    avatar_url TEXT,
    bio TEXT,
    -- Nova Integration
    nova_user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
    sync_status TEXT DEFAULT 'pending' CHECK (sync_status IN ('pending', 'synced', 'failed')),
    last_sync_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Contact methods (email, SMS, voice, webhook)
CREATE TABLE IF NOT EXISTS goalert.contact_methods (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES goalert.users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    type TEXT NOT NULL CHECK (type IN ('EMAIL', 'SMS', 'VOICE', 'WEBHOOK', 'SLACK_DM')),
    value TEXT NOT NULL, -- email address, phone number, webhook URL, etc.
    disabled BOOLEAN DEFAULT FALSE,
    pending BOOLEAN DEFAULT FALSE,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Notification rules (when and how to notify users)
CREATE TABLE IF NOT EXISTS goalert.notification_rules (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES goalert.users(id) ON DELETE CASCADE,
    contact_method_id UUID NOT NULL REFERENCES goalert.contact_methods(id) ON DELETE CASCADE,
    delay_minutes INTEGER NOT NULL DEFAULT 0 CHECK (delay_minutes >= 0),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Escalation policies (define escalation chains)
CREATE TABLE IF NOT EXISTS goalert.escalation_policies (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    description TEXT,
    repeat INTEGER NOT NULL DEFAULT 0 CHECK (repeat >= 0 AND repeat <= 9),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Escalation policy steps
CREATE TABLE IF NOT EXISTS goalert.escalation_policy_steps (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    policy_id UUID NOT NULL REFERENCES goalert.escalation_policies(id) ON DELETE CASCADE,
    step_number INTEGER NOT NULL CHECK (step_number >= 0),
    delay_minutes INTEGER NOT NULL DEFAULT 0 CHECK (delay_minutes >= 0),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE (policy_id, step_number)
);

-- Escalation policy step targets (users, schedules, rotations)
CREATE TABLE IF NOT EXISTS goalert.escalation_policy_actions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    step_id UUID NOT NULL REFERENCES goalert.escalation_policy_steps(id) ON DELETE CASCADE,
    type TEXT NOT NULL CHECK (type IN ('user', 'schedule', 'rotation')),
    target_id UUID NOT NULL, -- References users, schedules, or rotations
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Services (what's being monitored/alerted on)
CREATE TABLE IF NOT EXISTS goalert.services (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    description TEXT,
    escalation_policy_id UUID NOT NULL REFERENCES goalert.escalation_policies(id),
    -- Nova Integration
    nova_monitor_id UUID REFERENCES public.monitors(id),
    integration_metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Integration keys (for external systems to send alerts)
CREATE TABLE IF NOT EXISTS goalert.integration_keys (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    service_id UUID NOT NULL REFERENCES goalert.services(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    type TEXT NOT NULL CHECK (type IN ('generic', 'grafana', 'site24x7', 'prometheusAlertmanager', 'email')),
    config JSONB DEFAULT '{}',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Heartbeat monitors
CREATE TABLE IF NOT EXISTS goalert.heartbeat_monitors (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    service_id UUID NOT NULL REFERENCES goalert.services(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    timeout_minutes INTEGER NOT NULL CHECK (timeout_minutes > 0),
    additional_details TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Schedules (on-call scheduling)
CREATE TABLE IF NOT EXISTS goalert.schedules (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    description TEXT,
    time_zone TEXT NOT NULL DEFAULT 'UTC',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Schedule rules (define when people are on-call)
CREATE TABLE IF NOT EXISTS goalert.schedule_rules (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    schedule_id UUID NOT NULL REFERENCES goalert.schedules(id) ON DELETE CASCADE,
    sunday BOOLEAN DEFAULT FALSE,
    monday BOOLEAN DEFAULT FALSE,
    tuesday BOOLEAN DEFAULT FALSE,
    wednesday BOOLEAN DEFAULT FALSE,
    thursday BOOLEAN DEFAULT FALSE,
    friday BOOLEAN DEFAULT FALSE,
    saturday BOOLEAN DEFAULT FALSE,
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    target_type TEXT NOT NULL CHECK (target_type IN ('user', 'rotation')),
    target_id UUID NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Schedule overrides (temporary on-call changes)
CREATE TABLE IF NOT EXISTS goalert.schedule_overrides (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    schedule_id UUID NOT NULL REFERENCES goalert.schedules(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES goalert.users(id) ON DELETE CASCADE,
    start_time TIMESTAMP NOT NULL,
    end_time TIMESTAMP NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CHECK (end_time > start_time)
);

-- Rotations (groups of users in rotation)
CREATE TABLE IF NOT EXISTS goalert.rotations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    description TEXT,
    type TEXT NOT NULL CHECK (type IN ('daily', 'weekly', 'hourly')),
    shift_length INTEGER NOT NULL DEFAULT 1 CHECK (shift_length > 0),
    start_time TIMESTAMP NOT NULL,
    time_zone TEXT NOT NULL DEFAULT 'UTC',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Rotation participants
CREATE TABLE IF NOT EXISTS goalert.rotation_participants (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    rotation_id UUID NOT NULL REFERENCES goalert.rotations(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES goalert.users(id) ON DELETE CASCADE,
    position INTEGER NOT NULL CHECK (position >= 0),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE (rotation_id, position),
    UNIQUE (rotation_id, user_id)
);

-- Alerts (active incidents)
CREATE TABLE IF NOT EXISTS goalert.alerts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    service_id UUID NOT NULL REFERENCES goalert.services(id) ON DELETE CASCADE,
    summary TEXT NOT NULL,
    details TEXT,
    status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'acknowledged', 'closed')),
    source TEXT NOT NULL DEFAULT 'manual',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    acknowledged_at TIMESTAMP,
    closed_at TIMESTAMP,
    -- Nova Integration
    nova_alert_id UUID REFERENCES public.nova_alerts(id),
    correlation_key TEXT,
    metadata JSONB DEFAULT '{}'
);

-- Alert logs (history of alert actions)
CREATE TABLE IF NOT EXISTS goalert.alert_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    alert_id UUID NOT NULL REFERENCES goalert.alerts(id) ON DELETE CASCADE,
    timestamp TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    event TEXT NOT NULL CHECK (event IN ('created', 'acknowledged', 'closed', 'escalated', 'notification_sent')),
    message TEXT,
    user_id UUID REFERENCES goalert.users(id),
    metadata JSONB DEFAULT '{}'
);

-- Alert status subscriptions (who gets notified)
CREATE TABLE IF NOT EXISTS goalert.alert_status_subscriptions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES goalert.users(id) ON DELETE CASCADE,
    alert_id UUID NOT NULL REFERENCES goalert.alerts(id) ON DELETE CASCADE,
    last_alert_status TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE (user_id, alert_id)
);

-- Notification channels (Slack, webhook endpoints, etc.)
CREATE TABLE IF NOT EXISTS goalert.notification_channels (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    type TEXT NOT NULL CHECK (type IN ('SLACK', 'WEBHOOK', 'EMAIL')),
    value TEXT NOT NULL, -- webhook URL, Slack channel, email address
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- User verification codes (for contact method verification)
CREATE TABLE IF NOT EXISTS goalert.user_verification_codes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    contact_method_id UUID NOT NULL REFERENCES goalert.contact_methods(id) ON DELETE CASCADE,
    code TEXT NOT NULL,
    expires_at TIMESTAMP NOT NULL,
    sent BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Auth subjects (for authentication mapping)
CREATE TABLE IF NOT EXISTS goalert.auth_subjects (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES goalert.users(id) ON DELETE CASCADE,
    provider_id TEXT NOT NULL,
    subject_id TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE (provider_id, subject_id)
);

-- System configuration
CREATE TABLE IF NOT EXISTS goalert.config (
    id SERIAL PRIMARY KEY,
    key TEXT NOT NULL UNIQUE,
    value TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_goalert_users_nova_user_id ON goalert.users(nova_user_id);
CREATE INDEX IF NOT EXISTS idx_goalert_users_email ON goalert.users(email);
CREATE INDEX IF NOT EXISTS idx_goalert_contact_methods_user_id ON goalert.contact_methods(user_id);
CREATE INDEX IF NOT EXISTS idx_goalert_notification_rules_user_id ON goalert.notification_rules(user_id);
CREATE INDEX IF NOT EXISTS idx_goalert_services_escalation_policy_id ON goalert.services(escalation_policy_id);
CREATE INDEX IF NOT EXISTS idx_goalert_services_nova_monitor_id ON goalert.services(nova_monitor_id);
CREATE INDEX IF NOT EXISTS idx_goalert_alerts_service_id ON goalert.alerts(service_id);
CREATE INDEX IF NOT EXISTS idx_goalert_alerts_status ON goalert.alerts(status);
CREATE INDEX IF NOT EXISTS idx_goalert_alerts_nova_alert_id ON goalert.alerts(nova_alert_id);
CREATE INDEX IF NOT EXISTS idx_goalert_alerts_created_at ON goalert.alerts(created_at);
CREATE INDEX IF NOT EXISTS idx_goalert_alert_logs_alert_id ON goalert.alert_logs(alert_id);
CREATE INDEX IF NOT EXISTS idx_goalert_schedule_rules_schedule_id ON goalert.schedule_rules(schedule_id);
CREATE INDEX IF NOT EXISTS idx_goalert_schedule_overrides_schedule_id ON goalert.schedule_overrides(schedule_id);
CREATE INDEX IF NOT EXISTS idx_goalert_schedule_overrides_time ON goalert.schedule_overrides(start_time, end_time);
CREATE INDEX IF NOT EXISTS idx_goalert_rotation_participants_rotation_id ON goalert.rotation_participants(rotation_id);

-- Create triggers for updated_at timestamps
CREATE OR REPLACE FUNCTION goalert.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_goalert_users_updated_at BEFORE UPDATE ON goalert.users FOR EACH ROW EXECUTE FUNCTION goalert.update_updated_at_column();
CREATE TRIGGER update_goalert_contact_methods_updated_at BEFORE UPDATE ON goalert.contact_methods FOR EACH ROW EXECUTE FUNCTION goalert.update_updated_at_column();
CREATE TRIGGER update_goalert_escalation_policies_updated_at BEFORE UPDATE ON goalert.escalation_policies FOR EACH ROW EXECUTE FUNCTION goalert.update_updated_at_column();
CREATE TRIGGER update_goalert_services_updated_at BEFORE UPDATE ON goalert.services FOR EACH ROW EXECUTE FUNCTION goalert.update_updated_at_column();
CREATE TRIGGER update_goalert_heartbeat_monitors_updated_at BEFORE UPDATE ON goalert.heartbeat_monitors FOR EACH ROW EXECUTE FUNCTION goalert.update_updated_at_column();
CREATE TRIGGER update_goalert_schedules_updated_at BEFORE UPDATE ON goalert.schedules FOR EACH ROW EXECUTE FUNCTION goalert.update_updated_at_column();
CREATE TRIGGER update_goalert_rotations_updated_at BEFORE UPDATE ON goalert.rotations FOR EACH ROW EXECUTE FUNCTION goalert.update_updated_at_column();
CREATE TRIGGER update_goalert_notification_channels_updated_at BEFORE UPDATE ON goalert.notification_channels FOR EACH ROW EXECUTE FUNCTION goalert.update_updated_at_column();
CREATE TRIGGER update_goalert_config_updated_at BEFORE UPDATE ON goalert.config FOR EACH ROW EXECUTE FUNCTION goalert.update_updated_at_column();

-- Create function to sync Nova users to GoAlert users
CREATE OR REPLACE FUNCTION goalert.sync_nova_user_to_goalert(nova_user_id UUID)
RETURNS UUID AS $$
DECLARE
    goalert_user_id UUID;
    user_record RECORD;
BEGIN
    -- Get Nova user details
    SELECT id, email, first_name, last_name, email
    INTO user_record
    FROM public.users
    WHERE id = nova_user_id;
    
    IF NOT FOUND THEN
        RAISE EXCEPTION 'Nova user not found: %', nova_user_id;
    END IF;
    
    -- Insert or update GoAlert user
    INSERT INTO goalert.users (
        nova_user_id,
        name,
        email,
        role,
        sync_status,
        last_sync_at
    ) VALUES (
        nova_user_id,
        COALESCE(user_record.first_name || ' ' || user_record.last_name, user_record.email),
        user_record.email,
        'user',
        'synced',
        CURRENT_TIMESTAMP
    )
    ON CONFLICT (nova_user_id) DO UPDATE SET
        name = EXCLUDED.name,
        email = EXCLUDED.email,
        sync_status = 'synced',
        last_sync_at = CURRENT_TIMESTAMP,
        updated_at = CURRENT_TIMESTAMP
    RETURNING id INTO goalert_user_id;
    
    RETURN goalert_user_id;
END;
$$ LANGUAGE plpgsql;

-- Create function to auto-sync users when they're created/updated in Nova
CREATE OR REPLACE FUNCTION public.sync_user_to_goalert()
RETURNS TRIGGER AS $$
BEGIN
    -- Sync to GoAlert when user is created or updated
    PERFORM goalert.sync_nova_user_to_goalert(NEW.id);
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to auto-sync users
CREATE TRIGGER sync_user_to_goalert_trigger
    AFTER INSERT OR UPDATE ON public.users
    FOR EACH ROW
    EXECUTE FUNCTION public.sync_user_to_goalert();

-- Insert default GoAlert configuration
INSERT INTO goalert.config (key, value) VALUES
('base_url', 'http://localhost:8081'),
('database_url', ''),
('smtp_from', 'alerts@nova.local'),
('general_message_bundle_type', 'simple'),
('twilio_disable', 'true'),
('slack_disable', 'false'),
('general_notification_disclaimer_url', ''),
('webhook_disable', 'false')
ON CONFLICT (key) DO NOTHING;

-- Grant permissions
GRANT USAGE ON SCHEMA goalert TO api_user;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA goalert TO api_user;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA goalert TO api_user;
GRANT ALL PRIVILEGES ON ALL FUNCTIONS IN SCHEMA goalert TO api_user;

-- Reset search path
SET search_path TO public;

COMMENT ON SCHEMA goalert IS 'GoAlert integration schema - stores GoAlert data within Nova database';
COMMENT ON TABLE goalert.users IS 'GoAlert users synced from Nova users table';
COMMENT ON TABLE goalert.services IS 'GoAlert services linked to Nova monitors';
COMMENT ON TABLE goalert.alerts IS 'GoAlert alerts correlated with Nova alerts';