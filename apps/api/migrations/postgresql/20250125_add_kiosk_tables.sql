-- Nova Universe Kiosk Management Tables
-- Created: 2025-01-25
-- Supports Nova Beacon kiosk app functionality

-- Kiosks table for device registration and management
CREATE TABLE IF NOT EXISTS kiosks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    device_id VARCHAR(255) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    location VARCHAR(255),
    status VARCHAR(50) DEFAULT 'offline' CHECK (status IN ('available', 'busy', 'maintenance', 'offline')),
    is_active BOOLEAN DEFAULT true,
    configuration JSONB,
    activation_code VARCHAR(255),
    activated_at TIMESTAMP WITH TIME ZONE,
    last_ping TIMESTAMP WITH TIME ZONE,
    status_update_interval INTEGER DEFAULT 300, -- seconds
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP WITH TIME ZONE NULL
);

-- Kiosk activations for secure device onboarding
CREATE TABLE IF NOT EXISTS kiosk_activations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    activation_code VARCHAR(255) UNIQUE NOT NULL,
    created_by INTEGER REFERENCES users(id),
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    used_at TIMESTAMP WITH TIME ZONE NULL,
    used_by_device VARCHAR(255) NULL,
    location VARCHAR(255),
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Kiosk authentication tokens
CREATE TABLE IF NOT EXISTS kiosk_tokens (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    device_id VARCHAR(255) NOT NULL REFERENCES kiosks(device_id) ON DELETE CASCADE,
    token VARCHAR(255) UNIQUE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    last_used TIMESTAMP WITH TIME ZONE NULL
);

-- Kiosk telemetry for status tracking and monitoring
CREATE TABLE IF NOT EXISTS kiosk_telemetry (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    device_id VARCHAR(255) NOT NULL REFERENCES kiosks(device_id) ON DELETE CASCADE,
    status VARCHAR(50) NOT NULL CHECK (status IN ('available', 'busy', 'maintenance', 'offline')),
    location VARCHAR(255),
    ping_time TIMESTAMP WITH TIME ZONE NOT NULL,
    metadata JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Kiosk asset registry for inventory tracking
CREATE TABLE IF NOT EXISTS kiosk_asset_registry (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    kiosk_id VARCHAR(255) NOT NULL REFERENCES kiosks(device_id) ON DELETE CASCADE,
    asset_tag VARCHAR(255) NOT NULL,
    asset_type VARCHAR(100),
    scanned_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    helix_sync_status VARCHAR(50) DEFAULT 'pending' CHECK (helix_sync_status IN ('pending', 'synced', 'failed')),
    helix_sync_at TIMESTAMP WITH TIME ZONE NULL,
    metadata JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_kiosks_device_id ON kiosks(device_id);
CREATE INDEX IF NOT EXISTS idx_kiosks_status ON kiosks(status);
CREATE INDEX IF NOT EXISTS idx_kiosks_location ON kiosks(location);
CREATE INDEX IF NOT EXISTS idx_kiosks_active ON kiosks(is_active);

CREATE INDEX IF NOT EXISTS idx_kiosk_activations_code ON kiosk_activations(activation_code);
CREATE INDEX IF NOT EXISTS idx_kiosk_activations_expires ON kiosk_activations(expires_at);

CREATE INDEX IF NOT EXISTS idx_kiosk_tokens_device ON kiosk_tokens(device_id);
CREATE INDEX IF NOT EXISTS idx_kiosk_tokens_token ON kiosk_tokens(token);
CREATE INDEX IF NOT EXISTS idx_kiosk_tokens_expires ON kiosk_tokens(expires_at);

CREATE INDEX IF NOT EXISTS idx_kiosk_telemetry_device ON kiosk_telemetry(device_id);
CREATE INDEX IF NOT EXISTS idx_kiosk_telemetry_status ON kiosk_telemetry(status);
CREATE INDEX IF NOT EXISTS idx_kiosk_telemetry_ping_time ON kiosk_telemetry(ping_time);

CREATE INDEX IF NOT EXISTS idx_kiosk_assets_kiosk ON kiosk_asset_registry(kiosk_id);
CREATE INDEX IF NOT EXISTS idx_kiosk_assets_tag ON kiosk_asset_registry(asset_tag);
CREATE INDEX IF NOT EXISTS idx_kiosk_assets_sync_status ON kiosk_asset_registry(helix_sync_status);

-- Updated at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply updated_at trigger to kiosks table
CREATE TRIGGER update_kiosks_updated_at 
    BEFORE UPDATE ON kiosks 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Insert some sample activation codes for testing
INSERT INTO kiosk_activations (activation_code, expires_at, location, notes) VALUES
('NOVA-KIOSK-2025-001', CURRENT_TIMESTAMP + INTERVAL '30 days', 'Main Lobby', 'Test activation code for main lobby kiosk'),
('NOVA-KIOSK-2025-002', CURRENT_TIMESTAMP + INTERVAL '30 days', 'IT Department', 'Test activation code for IT department kiosk'),
('NOVA-KIOSK-2025-003', CURRENT_TIMESTAMP + INTERVAL '30 days', 'Conference Room A', 'Test activation code for conference room kiosk')
ON CONFLICT (activation_code) DO NOTHING;