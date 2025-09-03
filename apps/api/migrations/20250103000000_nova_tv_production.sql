-- Nova TV Production Database Schema
-- This removes mock data dependencies and creates production tables

-- Nova TV Dashboards table
CREATE TABLE IF NOT EXISTS nova_tv_dashboards (
    id VARCHAR(36) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    department VARCHAR(100),
    created_by VARCHAR(36) NOT NULL,
    configuration TEXT, -- JSON configuration
    is_active BOOLEAN DEFAULT true,
    is_public BOOLEAN DEFAULT false,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Nova TV Devices table
CREATE TABLE IF NOT EXISTS nova_tv_devices (
    id VARCHAR(36) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    device_id VARCHAR(100) UNIQUE NOT NULL,
    location VARCHAR(255),
    status VARCHAR(50) DEFAULT 'inactive',
    last_ping DATETIME,
    configuration TEXT, -- JSON configuration
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Nova TV Content table
CREATE TABLE IF NOT EXISTS nova_tv_content (
    id VARCHAR(36) PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    content_type VARCHAR(50), -- announcement, image, video, etc.
    content_data TEXT, -- JSON content data
    schedule_start DATETIME,
    schedule_end DATETIME,
    is_active BOOLEAN DEFAULT true,
    created_by VARCHAR(36) NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Nova TV Analytics table
CREATE TABLE IF NOT EXISTS nova_tv_analytics (
    id VARCHAR(36) PRIMARY KEY,
    device_id VARCHAR(36),
    dashboard_id VARCHAR(36),
    metric_type VARCHAR(50), -- view, interaction, error, etc.
    metric_value REAL,
    metadata TEXT, -- JSON metadata
    recorded_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (device_id) REFERENCES nova_tv_devices(id),
    FOREIGN KEY (dashboard_id) REFERENCES nova_tv_dashboards(id)
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_nova_tv_dashboards_department ON nova_tv_dashboards(department);
CREATE INDEX IF NOT EXISTS idx_nova_tv_dashboards_created_by ON nova_tv_dashboards(created_by);
CREATE INDEX IF NOT EXISTS idx_nova_tv_dashboards_active ON nova_tv_dashboards(is_active);
CREATE INDEX IF NOT EXISTS idx_nova_tv_devices_status ON nova_tv_devices(status);
CREATE INDEX IF NOT EXISTS idx_nova_tv_content_active ON nova_tv_content(is_active);
CREATE INDEX IF NOT EXISTS idx_nova_tv_analytics_device ON nova_tv_analytics(device_id);
CREATE INDEX IF NOT EXISTS idx_nova_tv_analytics_recorded ON nova_tv_analytics(recorded_at);

-- Insert a sample production dashboard (not mock data)
INSERT OR IGNORE INTO nova_tv_dashboards (
    id, name, description, department, created_by, configuration, is_active, is_public
) VALUES (
    'prod-it-dashboard',
    'IT Operations Dashboard',
    'Production dashboard for IT operations monitoring',
    'IT',
    'system',
    '{"layout":"grid","theme":"dark","refreshInterval":30000,"widgets":[{"type":"tickets","position":{"x":0,"y":0,"w":6,"h":4}},{"type":"system-health","position":{"x":6,"y":0,"w":6,"h":4}},{"type":"announcements","position":{"x":0,"y":4,"w":12,"h":3}}]}',
    true,
    true
);