-- Migration to add VIP support columns to users table
-- Created: 2025-09-01
-- Adds is_vip, vip_level, and vip_trigger_source columns to support VIP system

-- Add VIP columns to users table
ALTER TABLE users ADD COLUMN IF NOT EXISTS is_vip BOOLEAN DEFAULT FALSE;
ALTER TABLE users ADD COLUMN IF NOT EXISTS vip_level VARCHAR(20) CHECK (vip_level IN ('priority', 'gold', 'exec'));
ALTER TABLE users ADD COLUMN IF NOT EXISTS vip_trigger_source VARCHAR(20) DEFAULT 'manual' CHECK (vip_trigger_source IN ('manual', 'scim', 'cosmo', 'api'));
ALTER TABLE users ADD COLUMN IF NOT EXISTS vip_assigned_at TIMESTAMP NULL;
ALTER TABLE users ADD COLUMN IF NOT EXISTS vip_assigned_by INTEGER REFERENCES users(id);

-- Create VIP-specific tables for advanced features

-- VIP proxy support table (if not already exists)
CREATE TABLE IF NOT EXISTS vip_proxies (
    id SERIAL PRIMARY KEY,
    vip_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    proxy_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    expires_at TIMESTAMP NULL,
    created_by INTEGER REFERENCES users(id),
    
    UNIQUE(vip_id, proxy_id)
);

-- VIP SLA overrides table
CREATE TABLE IF NOT EXISTS vip_sla_overrides (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    group_name VARCHAR(100),
    location VARCHAR(100),
    response_minutes INTEGER NOT NULL DEFAULT 30,
    resolution_minutes INTEGER NOT NULL DEFAULT 240,
    business_hours_only BOOLEAN DEFAULT FALSE,
    escalation_chain JSONB,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    -- Ensure only one active override per user/group/location combination
    UNIQUE(user_id, group_name, location, is_active)
);

-- VIP notification preferences table
CREATE TABLE IF NOT EXISTS vip_notification_preferences (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    notification_type VARCHAR(50) NOT NULL, -- 'email', 'slack', 'sms', 'webhook'
    endpoint VARCHAR(500), -- email address, slack channel, phone number, webhook URL
    enabled BOOLEAN DEFAULT TRUE,
    escalation_level INTEGER DEFAULT 1, -- 1=immediate, 2=after SLA breach, etc.
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_users_vip_status ON users(is_vip, vip_level) WHERE is_vip = TRUE;
CREATE INDEX IF NOT EXISTS idx_vip_proxies_vip_id ON vip_proxies(vip_id);
CREATE INDEX IF NOT EXISTS idx_vip_proxies_proxy_id ON vip_proxies(proxy_id);
CREATE INDEX IF NOT EXISTS idx_vip_sla_overrides_user ON vip_sla_overrides(user_id) WHERE is_active = TRUE;
CREATE INDEX IF NOT EXISTS idx_vip_notifications_user_type ON vip_notification_preferences(user_id, notification_type);

-- Add VIP priority score to tickets if not already present
ALTER TABLE enhanced_support_tickets ADD COLUMN IF NOT EXISTS vip_priority_score INTEGER DEFAULT 0;
ALTER TABLE enhanced_support_tickets ADD COLUMN IF NOT EXISTS vip_trigger_source VARCHAR(20) DEFAULT 'manual' CHECK (vip_trigger_source IN ('manual', 'scim', 'cosmo', 'api'));

-- Create index on VIP priority score for queue sorting
CREATE INDEX IF NOT EXISTS idx_tickets_vip_priority_state ON enhanced_support_tickets(vip_priority_score DESC, state, created_at);

-- Add VIP-specific audit log entries function
CREATE OR REPLACE FUNCTION log_vip_change()
RETURNS TRIGGER AS $$
BEGIN
    -- Log when VIP status changes
    IF OLD.is_vip IS DISTINCT FROM NEW.is_vip OR OLD.vip_level IS DISTINCT FROM NEW.vip_level THEN
        INSERT INTO audit_logs (user_id, action, details, timestamp)
        VALUES (
            NEW.vip_assigned_by,
            'VIP_STATUS_CHANGE',
            jsonb_build_object(
                'target_user_id', NEW.id,
                'old_is_vip', OLD.is_vip,
                'new_is_vip', NEW.is_vip,
                'old_vip_level', OLD.vip_level,
                'new_vip_level', NEW.vip_level,
                'trigger_source', NEW.vip_trigger_source
            ),
            CURRENT_TIMESTAMP
        );
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for VIP audit logging
DROP TRIGGER IF EXISTS vip_change_audit_trigger ON users;
CREATE TRIGGER vip_change_audit_trigger
    AFTER UPDATE ON users
    FOR EACH ROW
    EXECUTE FUNCTION log_vip_change();

-- Create default VIP SLA definitions
INSERT INTO sla_definitions (name, description, priority, response_time, resolution_time, is_vip_only, is_active) VALUES
    ('VIP Priority SLA', 'Standard VIP support with 1 hour response', 'HIGH', 60, 480, TRUE, TRUE),
    ('VIP Gold SLA', 'Premium VIP support with 30 minute response', 'HIGH', 30, 240, TRUE, TRUE),
    ('VIP Executive SLA', 'Executive level VIP support with 15 minute response', 'CRITICAL', 15, 120, TRUE, TRUE)
ON CONFLICT (name) DO NOTHING;

-- Create trigger to update updated_at on vip_sla_overrides
CREATE OR REPLACE FUNCTION update_vip_sla_overrides_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_vip_sla_overrides_updated_at_trigger
    BEFORE UPDATE ON vip_sla_overrides
    FOR EACH ROW
    EXECUTE FUNCTION update_vip_sla_overrides_updated_at();

CREATE TRIGGER update_vip_notification_preferences_updated_at_trigger
    BEFORE UPDATE ON vip_notification_preferences
    FOR EACH ROW
    EXECUTE FUNCTION update_vip_sla_overrides_updated_at();

COMMIT;