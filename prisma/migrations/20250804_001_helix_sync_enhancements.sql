-- Migration: Add Helix sync failure tracking and kiosk organization assignments
-- Description: Creates tables for managing Helix sync failures and kiosk organizational assignments

-- Table for tracking Helix sync failures and retries
CREATE TABLE IF NOT EXISTS helix_sync_failures (
  id SERIAL PRIMARY KEY,
  kiosk_id VARCHAR(255) NOT NULL,
  asset_id INTEGER NOT NULL,
  error_message TEXT NOT NULL,
  metadata JSONB DEFAULT '{}',
  retry_count INTEGER DEFAULT 0,
  next_retry_at TIMESTAMP NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  -- Foreign key constraints
  CONSTRAINT fk_helix_failures_kiosk FOREIGN KEY (kiosk_id) REFERENCES kiosks(id) ON DELETE CASCADE,
  CONSTRAINT fk_helix_failures_asset FOREIGN KEY (asset_id) REFERENCES inventory_assets(id) ON DELETE CASCADE,
  
  -- Unique constraint to prevent duplicate entries
  CONSTRAINT uk_helix_failures_kiosk_asset UNIQUE (kiosk_id, asset_id)
);

-- Table for kiosk organizational assignments
CREATE TABLE IF NOT EXISTS kiosk_organization_assignments (
  id SERIAL PRIMARY KEY,
  kiosk_id VARCHAR(255) NOT NULL UNIQUE,
  organization_id INTEGER,
  department VARCHAR(100),
  floor VARCHAR(50),
  room VARCHAR(50),
  building VARCHAR(100),
  assigned_by VARCHAR(255),
  assignment_metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  -- Foreign key constraint
  CONSTRAINT fk_kiosk_org_kiosk FOREIGN KEY (kiosk_id) REFERENCES kiosks(id) ON DELETE CASCADE
);

-- Table for kiosk metadata logs
CREATE TABLE IF NOT EXISTS kiosk_metadata_logs (
  id SERIAL PRIMARY KEY,
  kiosk_id VARCHAR(255) NOT NULL,
  metadata_type VARCHAR(50) NOT NULL,
  encrypted_metadata TEXT,
  collection_timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  -- Foreign key constraint
  CONSTRAINT fk_kiosk_metadata_kiosk FOREIGN KEY (kiosk_id) REFERENCES kiosks(id) ON DELETE CASCADE
);

-- Indexes for better performance
CREATE INDEX IF NOT EXISTS idx_helix_failures_next_retry ON helix_sync_failures(next_retry_at);
CREATE INDEX IF NOT EXISTS idx_helix_failures_retry_count ON helix_sync_failures(retry_count);
CREATE INDEX IF NOT EXISTS idx_kiosk_org_assignments_org ON kiosk_organization_assignments(organization_id);
CREATE INDEX IF NOT EXISTS idx_kiosk_org_assignments_dept ON kiosk_organization_assignments(department);
CREATE INDEX IF NOT EXISTS idx_kiosk_metadata_logs_kiosk_type ON kiosk_metadata_logs(kiosk_id, metadata_type);
CREATE INDEX IF NOT EXISTS idx_kiosk_metadata_logs_timestamp ON kiosk_metadata_logs(collection_timestamp);

-- Update trigger for updated_at columns
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_helix_sync_failures_updated_at 
  BEFORE UPDATE ON helix_sync_failures 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_kiosk_organization_assignments_updated_at 
  BEFORE UPDATE ON kiosk_organization_assignments 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
