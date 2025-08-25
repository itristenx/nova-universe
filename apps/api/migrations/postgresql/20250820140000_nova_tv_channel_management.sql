-- Nova TV Channel Management Database Schema
-- Created: $(date '+%Y-%m-%d %H:%M:%S')
-- Description: Database schema for Nova TV channel (dashboard) management and device activation

-- Nova TV Dashboards (Channels) table
CREATE TABLE IF NOT EXISTS nova_tv_dashboards (
    id VARCHAR(255) PRIMARY KEY DEFAULT 'ntv_' || generate_random_uuid(),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    department VARCHAR(100),
    created_by VARCHAR(255) NOT NULL,
    template_id VARCHAR(255),
    configuration JSONB DEFAULT '{}',
    is_active BOOLEAN DEFAULT true,
    is_public BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Indexes for performance
    INDEX idx_nova_tv_dashboards_department (department),
    INDEX idx_nova_tv_dashboards_created_by (created_by),
    INDEX idx_nova_tv_dashboards_is_active (is_active),
    INDEX idx_nova_tv_dashboards_created_at (created_at)
);

-- Nova TV Devices table (similar to kiosks but for TV displays)
CREATE TABLE IF NOT EXISTS nova_tv_devices (
    id VARCHAR(255) PRIMARY KEY DEFAULT 'ntvd_' || generate_random_uuid(),
    name VARCHAR(255) NOT NULL,
    location VARCHAR(255),
    department VARCHAR(100),
    ip_address INET,
    browser_info TEXT,
    device_fingerprint VARCHAR(255) UNIQUE NOT NULL,
    dashboard_id VARCHAR(255),
    last_active_at TIMESTAMP WITH TIME ZONE,
    connection_status VARCHAR(50) DEFAULT 'disconnected',
    
    -- Enhanced settings similar to kiosks
    settings JSONB DEFAULT '{}',
    metadata JSONB DEFAULT '{}',
    
    -- Branding and configuration (similar to kiosk model)
    logo_url VARCHAR(500),
    bg_url VARCHAR(500),
    branding_config JSONB DEFAULT '{}',
    display_config JSONB DEFAULT '{}',
    
    -- Activation tracking  
    is_activated BOOLEAN DEFAULT false,
    activated_by VARCHAR(255),
    activated_at TIMESTAMP WITH TIME ZONE,
    
    -- Device status and health
    last_ping_at TIMESTAMP WITH TIME ZONE,
    version VARCHAR(50),
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Foreign key constraints
    FOREIGN KEY (dashboard_id) REFERENCES nova_tv_dashboards(id) ON DELETE SET NULL,
    FOREIGN KEY (activated_by) REFERENCES users(id) ON DELETE SET NULL,
    
    -- Indexes for performance
    INDEX idx_nova_tv_devices_department (department),
    INDEX idx_nova_tv_devices_connection_status (connection_status),
    INDEX idx_nova_tv_devices_dashboard_id (dashboard_id),
    INDEX idx_nova_tv_devices_is_activated (is_activated),
    INDEX idx_nova_tv_devices_device_fingerprint (device_fingerprint),
    INDEX idx_nova_tv_devices_last_active_at (last_active_at)
);

-- Nova TV Templates table
CREATE TABLE IF NOT EXISTS nova_tv_templates (
    id VARCHAR(255) PRIMARY KEY DEFAULT 'ntvt_' || generate_random_uuid(),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    category VARCHAR(100),
    department_type VARCHAR(100),
    template_config JSONB DEFAULT '{}',
    is_system_template BOOLEAN DEFAULT false,
    is_active BOOLEAN DEFAULT true,
    created_by VARCHAR(255),
    preview_image_url VARCHAR(500),
    tags TEXT[] DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Foreign key constraints
    FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL,
    
    -- Indexes for performance
    INDEX idx_nova_tv_templates_category (category),
    INDEX idx_nova_tv_templates_department_type (department_type),
    INDEX idx_nova_tv_templates_is_system_template (is_system_template),
    INDEX idx_nova_tv_templates_is_active (is_active)
);

-- Nova TV Content table
CREATE TABLE IF NOT EXISTS nova_tv_content (
    id VARCHAR(255) PRIMARY KEY DEFAULT 'ntvc_' || generate_random_uuid(),
    dashboard_id VARCHAR(255) NOT NULL,
    content_type VARCHAR(100) NOT NULL,
    title VARCHAR(255),
    content_data JSONB DEFAULT '{}',
    display_order INTEGER,
    is_active BOOLEAN DEFAULT true,
    expires_at TIMESTAMP WITH TIME ZONE,
    scheduled_at TIMESTAMP WITH TIME ZONE,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Foreign key constraints
    FOREIGN KEY (dashboard_id) REFERENCES nova_tv_dashboards(id) ON DELETE CASCADE,
    
    -- Indexes for performance
    INDEX idx_nova_tv_content_dashboard_id (dashboard_id),
    INDEX idx_nova_tv_content_content_type (content_type),
    INDEX idx_nova_tv_content_is_active (is_active),
    INDEX idx_nova_tv_content_expires_at (expires_at),
    INDEX idx_nova_tv_content_display_order (display_order)
);

-- Nova TV Analytics table
CREATE TABLE IF NOT EXISTS nova_tv_analytics (
    id VARCHAR(255) PRIMARY KEY DEFAULT 'ntva_' || generate_random_uuid(),
    dashboard_id VARCHAR(255),
    device_id VARCHAR(255),
    session_id VARCHAR(255),
    event_type VARCHAR(100) NOT NULL,
    event_data JSONB,
    user_agent TEXT,
    ip_address INET,
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Foreign key constraints
    FOREIGN KEY (dashboard_id) REFERENCES nova_tv_dashboards(id) ON DELETE CASCADE,
    FOREIGN KEY (device_id) REFERENCES nova_tv_devices(id) ON DELETE CASCADE,
    
    -- Indexes for performance
    INDEX idx_nova_tv_analytics_dashboard_id (dashboard_id),
    INDEX idx_nova_tv_analytics_device_id (device_id),
    INDEX idx_nova_tv_analytics_event_type (event_type),
    INDEX idx_nova_tv_analytics_timestamp (timestamp),
    INDEX idx_nova_tv_analytics_session_id (session_id)
);

-- Nova TV Auth Sessions table
CREATE TABLE IF NOT EXISTS nova_tv_auth_sessions (
    id VARCHAR(255) PRIMARY KEY DEFAULT 'ntvas_' || generate_random_uuid(),
    session_id VARCHAR(255) UNIQUE NOT NULL,
    six_digit_code VARCHAR(6) NOT NULL,
    device_id VARCHAR(255),
    user_id VARCHAR(255),
    is_used BOOLEAN DEFAULT false,
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Foreign key constraints
    FOREIGN KEY (device_id) REFERENCES nova_tv_devices(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    
    -- Indexes for performance
    INDEX idx_nova_tv_auth_sessions_session_id (session_id),
    INDEX idx_nova_tv_auth_sessions_six_digit_code (six_digit_code),
    INDEX idx_nova_tv_auth_sessions_expires_at (expires_at),
    INDEX idx_nova_tv_auth_sessions_is_used (is_used)
);

-- Nova TV Dashboard Sharing table
CREATE TABLE IF NOT EXISTS nova_tv_dashboard_shares (
    id VARCHAR(255) PRIMARY KEY DEFAULT 'ntvds_' || generate_random_uuid(),
    dashboard_id VARCHAR(255) NOT NULL,
    user_id VARCHAR(255) NOT NULL,
    permission VARCHAR(50) DEFAULT 'view', -- view, edit, admin
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Foreign key constraints
    FOREIGN KEY (dashboard_id) REFERENCES nova_tv_dashboards(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    
    -- Unique constraint
    UNIQUE(dashboard_id, user_id),
    
    -- Indexes for performance
    INDEX idx_nova_tv_dashboard_shares_dashboard_id (dashboard_id),
    INDEX idx_nova_tv_dashboard_shares_user_id (user_id),
    INDEX idx_nova_tv_dashboard_shares_permission (permission)
);

-- Nova TV Activation table (similar to kiosk activations)
CREATE TABLE IF NOT EXISTS nova_tv_activations (
    id VARCHAR(255) PRIMARY KEY DEFAULT 'ntva_' || generate_random_uuid(),
    code VARCHAR(10) NOT NULL,
    qr_code TEXT,
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    used BOOLEAN DEFAULT false,
    used_at TIMESTAMP WITH TIME ZONE,
    device_id VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Foreign key constraints
    FOREIGN KEY (device_id) REFERENCES nova_tv_devices(id) ON DELETE SET NULL,
    
    -- Indexes for performance
    INDEX idx_nova_tv_activations_code (code),
    INDEX idx_nova_tv_activations_used (used),
    INDEX idx_nova_tv_activations_expires_at (expires_at),
    INDEX idx_nova_tv_activations_device_id (device_id)
);

-- Add updated_at triggers for all Nova TV tables
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at columns
CREATE TRIGGER update_nova_tv_dashboards_updated_at BEFORE UPDATE ON nova_tv_dashboards FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_nova_tv_devices_updated_at BEFORE UPDATE ON nova_tv_devices FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_nova_tv_templates_updated_at BEFORE UPDATE ON nova_tv_templates FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_nova_tv_content_updated_at BEFORE UPDATE ON nova_tv_content FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Insert default template data
INSERT INTO nova_tv_templates (
    id, name, description, category, department_type, 
    template_config, is_system_template, is_active, 
    preview_image_url, tags
) VALUES 
(
    'template_it_dashboard',
    'IT Department Dashboard',
    'Standard IT department dashboard with tickets, system health, and announcements',
    'departmental',
    'IT',
    '{
        "layout": "grid",
        "theme": "dark",
        "refreshInterval": 30000,
        "widgets": [
            {"type": "tickets", "position": {"x": 0, "y": 0, "w": 6, "h": 4}},
            {"type": "system-health", "position": {"x": 6, "y": 0, "w": 6, "h": 4}},
            {"type": "announcements", "position": {"x": 0, "y": 4, "w": 12, "h": 3}}
        ]
    }',
    true,
    true,
    '/assets/templates/it-dashboard-preview.png',
    ARRAY['tickets', 'monitoring', 'announcements', 'it']
),
(
    'template_hr_dashboard',
    'HR Department Dashboard',
    'HR dashboard with employee metrics, announcements, and events',
    'departmental',
    'HR',
    '{
        "layout": "grid",
        "theme": "light",
        "refreshInterval": 60000,
        "widgets": [
            {"type": "employee-count", "position": {"x": 0, "y": 0, "w": 4, "h": 3}},
            {"type": "upcoming-events", "position": {"x": 4, "y": 0, "w": 8, "h": 3}},
            {"type": "announcements", "position": {"x": 0, "y": 3, "w": 12, "h": 4}}
        ]
    }',
    true,
    true,
    '/assets/templates/hr-dashboard-preview.png',
    ARRAY['hr', 'employees', 'events', 'announcements']
),
(
    'template_generic_dashboard',
    'Generic Dashboard',
    'Basic dashboard template suitable for any department',
    'generic',
    null,
    '{
        "layout": "grid",
        "theme": "dark",
        "refreshInterval": 30000,
        "widgets": [
            {"type": "clock", "position": {"x": 0, "y": 0, "w": 4, "h": 2}},
            {"type": "weather", "position": {"x": 4, "y": 0, "w": 4, "h": 2}},
            {"type": "announcements", "position": {"x": 8, "y": 0, "w": 4, "h": 2}},
            {"type": "calendar", "position": {"x": 0, "y": 2, "w": 12, "h": 4}}
        ]
    }',
    true,
    true,
    '/assets/templates/generic-dashboard-preview.png',
    ARRAY['generic', 'clock', 'weather', 'calendar']
)
ON CONFLICT (id) DO NOTHING;

-- Insert demo dashboard
INSERT INTO nova_tv_dashboards (
    id, name, description, department, created_by, 
    template_id, configuration, is_active, is_public
) VALUES (
    'demo-dashboard',
    'IT Department Demo Dashboard',
    'Demo dashboard for IT department showing tickets and system health',
    'IT',
    'user-1',
    'template_it_dashboard',
    '{
        "layout": "grid",
        "theme": "dark",
        "refreshInterval": 30000,
        "widgets": [
            {"type": "tickets", "position": {"x": 0, "y": 0, "w": 6, "h": 4}},
            {"type": "system-health", "position": {"x": 6, "y": 0, "w": 6, "h": 4}},
            {"type": "announcements", "position": {"x": 0, "y": 4, "w": 12, "h": 3}}
        ]
    }',
    true,
    true
) ON CONFLICT (id) DO NOTHING;

-- Add some demo content for the demo dashboard
INSERT INTO nova_tv_content (
    dashboard_id, content_type, title, content_data, display_order, is_active
) VALUES 
(
    'demo-dashboard',
    'announcement',
    'Welcome to Nova TV',
    '{"message": "Nova TV is now active! This dashboard will display real-time information for the IT department.", "priority": "info"}',
    1,
    true
),
(
    'demo-dashboard',
    'ticket-metrics',
    'Current Ticket Status',
    '{"source": "nova-tickets", "filters": {"department": "IT"}, "displayType": "summary"}',
    2,
    true
),
(
    'demo-dashboard',
    'system-health',
    'System Health Overview',
    '{"services": ["nova-api", "nova-db", "nova-sentinel"], "displayType": "status-grid"}',
    3,
    true
)
ON CONFLICT DO NOTHING;

-- Comments for documentation
COMMENT ON TABLE nova_tv_dashboards IS 'Nova TV Dashboards (Channels) - manages different display configurations for TV screens';
COMMENT ON TABLE nova_tv_devices IS 'Nova TV Devices - tracks TV devices that can display dashboards, similar to kiosks';
COMMENT ON TABLE nova_tv_templates IS 'Nova TV Templates - predefined dashboard layouts and configurations';
COMMENT ON TABLE nova_tv_content IS 'Nova TV Content - individual content items displayed on dashboards';
COMMENT ON TABLE nova_tv_analytics IS 'Nova TV Analytics - tracks usage and interaction analytics';
COMMENT ON TABLE nova_tv_auth_sessions IS 'Nova TV Auth Sessions - manages device authentication via codes';
COMMENT ON TABLE nova_tv_dashboard_shares IS 'Nova TV Dashboard Shares - manages dashboard sharing permissions';
COMMENT ON TABLE nova_tv_activations IS 'Nova TV Activations - tracks device activation codes similar to kiosk activations';

-- Grant permissions (adjust as needed for your environment)
-- GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO nova_api_user;
-- GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO nova_api_user;
