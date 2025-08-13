-- Migration: Enhanced Inventory Schema with Ticket History, Warranty Alerts, and Encrypted Fields
-- Date: 2025-08-04
-- Description: Adds comprehensive inventory management features including ticket tracking, warranty management, and field encryption

-- Add encrypted columns for sensitive asset data
ALTER TABLE inventory_assets 
  ADD COLUMN IF NOT EXISTS serial_number_enc TEXT,
  ADD COLUMN IF NOT EXISTS warranty_info_enc TEXT,
  ADD COLUMN IF NOT EXISTS purchase_info_enc TEXT,
  ADD COLUMN IF NOT EXISTS maintenance_notes_enc TEXT;

-- Add warranty alert configuration
ALTER TABLE inventory_assets 
  ADD COLUMN IF NOT EXISTS warranty_alert_days INTEGER DEFAULT 30,
  ADD COLUMN IF NOT EXISTS warranty_alert_enabled BOOLEAN DEFAULT true,
  ADD COLUMN IF NOT EXISTS last_warranty_alert_sent TIMESTAMP NULL;

-- Add import tracking fields
ALTER TABLE inventory_assets 
  ADD COLUMN IF NOT EXISTS import_batch_id UUID NULL,
  ADD COLUMN IF NOT EXISTS import_source VARCHAR(100) NULL,
  ADD COLUMN IF NOT EXISTS import_validated BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS validation_errors TEXT NULL;

-- Create asset ticket history table
CREATE TABLE IF NOT EXISTS asset_ticket_history (
  id SERIAL PRIMARY KEY,
  asset_id INTEGER NOT NULL REFERENCES inventory_assets(id) ON DELETE CASCADE,
  ticket_id INTEGER NOT NULL REFERENCES support_tickets(id) ON DELETE CASCADE,
  relationship_type VARCHAR(50) NOT NULL, -- 'assigned_to', 'related_to', 'repair_for', 'replacement_for'
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  ended_at TIMESTAMP NULL,
  created_by VARCHAR(255) NULL,
  notes TEXT NULL
);

-- Create warranty alerts table
CREATE TABLE IF NOT EXISTS asset_warranty_alerts (
  id SERIAL PRIMARY KEY,
  asset_id INTEGER NOT NULL REFERENCES inventory_assets(id) ON DELETE CASCADE,
  alert_type VARCHAR(50) NOT NULL, -- 'warning', 'critical', 'expired'
  alert_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  expiry_date DATE NOT NULL,
  days_remaining INTEGER NOT NULL,
  notification_sent BOOLEAN DEFAULT false,
  notification_sent_at TIMESTAMP NULL,
  dismissed BOOLEAN DEFAULT false,
  dismissed_by VARCHAR(255) NULL,
  dismissed_at TIMESTAMP NULL
);

-- Create asset import batches table for validation and rollback
CREATE TABLE IF NOT EXISTS asset_import_batches (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  filename VARCHAR(255) NOT NULL,
  imported_by VARCHAR(255) NOT NULL,
  import_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  total_records INTEGER NOT NULL DEFAULT 0,
  successful_records INTEGER NOT NULL DEFAULT 0,
  failed_records INTEGER NOT NULL DEFAULT 0,
  validation_status VARCHAR(50) NOT NULL DEFAULT 'pending', -- 'pending', 'valid', 'invalid', 'rolled_back'
  validation_errors TEXT NULL,
  rollback_date TIMESTAMP NULL,
  rollback_by VARCHAR(255) NULL
);

-- Create asset validation logs table
CREATE TABLE IF NOT EXISTS asset_validation_logs (
  id SERIAL PRIMARY KEY,
  batch_id UUID NOT NULL REFERENCES asset_import_batches(id) ON DELETE CASCADE,
  asset_id INTEGER NULL REFERENCES inventory_assets(id) ON DELETE SET NULL,
  row_number INTEGER NOT NULL,
  validation_level VARCHAR(20) NOT NULL, -- 'error', 'warning', 'info'
  field_name VARCHAR(100) NULL,
  message TEXT NOT NULL,
  raw_data JSON NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create kiosk asset registry for Helix integration
CREATE TABLE IF NOT EXISTS kiosk_asset_registry (
  id SERIAL PRIMARY KEY,
  kiosk_id VARCHAR(255) NOT NULL REFERENCES kiosks(id) ON DELETE CASCADE,
  asset_id INTEGER NOT NULL REFERENCES inventory_assets(id) ON DELETE CASCADE,
  registration_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  last_check_in TIMESTAMP NULL,
  status VARCHAR(50) DEFAULT 'active', -- 'active', 'inactive', 'maintenance', 'missing'
  helix_sync_status VARCHAR(50) DEFAULT 'pending', -- 'pending', 'synced', 'failed'
  helix_last_sync TIMESTAMP NULL,
  helix_error_message TEXT NULL,
  encrypted_metadata TEXT NULL, -- Encrypted JSON for sensitive kiosk-specific data
  created_by VARCHAR(255) NULL,
  updated_by VARCHAR(255) NULL,
  UNIQUE(kiosk_id, asset_id)
);

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_asset_ticket_history_asset_id ON asset_ticket_history(asset_id);
CREATE INDEX IF NOT EXISTS idx_asset_ticket_history_ticket_id ON asset_ticket_history(ticket_id);
CREATE INDEX IF NOT EXISTS idx_asset_warranty_alerts_asset_id ON asset_warranty_alerts(asset_id);
CREATE INDEX IF NOT EXISTS idx_asset_warranty_alerts_expiry_date ON asset_warranty_alerts(expiry_date);
CREATE INDEX IF NOT EXISTS idx_asset_warranty_alerts_notification_sent ON asset_warranty_alerts(notification_sent);
CREATE INDEX IF NOT EXISTS idx_asset_import_batches_imported_by ON asset_import_batches(imported_by);
CREATE INDEX IF NOT EXISTS idx_asset_import_batches_import_date ON asset_import_batches(import_date);
CREATE INDEX IF NOT EXISTS idx_asset_validation_logs_batch_id ON asset_validation_logs(batch_id);
CREATE INDEX IF NOT EXISTS idx_kiosk_asset_registry_kiosk_id ON kiosk_asset_registry(kiosk_id);
CREATE INDEX IF NOT EXISTS idx_kiosk_asset_registry_asset_id ON kiosk_asset_registry(asset_id);
CREATE INDEX IF NOT EXISTS idx_kiosk_asset_registry_helix_sync ON kiosk_asset_registry(helix_sync_status);
CREATE INDEX IF NOT EXISTS idx_inventory_assets_import_batch ON inventory_assets(import_batch_id);
CREATE INDEX IF NOT EXISTS idx_inventory_assets_warranty_expiry ON inventory_assets(warranty_expiry);

-- Add triggers for automatic warranty alert generation
CREATE OR REPLACE FUNCTION generate_warranty_alerts()
RETURNS TRIGGER AS $$
BEGIN
    -- Only create alerts if warranty_expiry is set and in the future
    IF NEW.warranty_expiry IS NOT NULL AND NEW.warranty_expiry > CURRENT_DATE THEN
        -- Delete existing alerts for this asset
        DELETE FROM asset_warranty_alerts WHERE asset_id = NEW.id;
        
        -- Create warning alert (default 30 days before expiry, or custom setting)
        INSERT INTO asset_warranty_alerts (asset_id, alert_type, expiry_date, days_remaining)
        SELECT 
            NEW.id,
            'warning',
            NEW.warranty_expiry,
            EXTRACT(DAY FROM NEW.warranty_expiry - CURRENT_DATE)
        WHERE NEW.warranty_expiry - INTERVAL '1 day' * COALESCE(NEW.warranty_alert_days, 30) <= CURRENT_DATE + INTERVAL '1 day';
        
        -- Create critical alert (7 days before expiry)
        INSERT INTO asset_warranty_alerts (asset_id, alert_type, expiry_date, days_remaining)
        SELECT 
            NEW.id,
            'critical',
            NEW.warranty_expiry,
            EXTRACT(DAY FROM NEW.warranty_expiry - CURRENT_DATE)
        WHERE NEW.warranty_expiry - INTERVAL '7 days' <= CURRENT_DATE + INTERVAL '1 day';
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger
DROP TRIGGER IF EXISTS trigger_generate_warranty_alerts ON inventory_assets;
CREATE TRIGGER trigger_generate_warranty_alerts
    AFTER INSERT OR UPDATE OF warranty_expiry, warranty_alert_days
    ON inventory_assets
    FOR EACH ROW
    EXECUTE FUNCTION generate_warranty_alerts();

-- Insert initial warranty alerts for existing assets with warranty dates
INSERT INTO asset_warranty_alerts (asset_id, alert_type, expiry_date, days_remaining)
SELECT 
    id,
    CASE 
        WHEN warranty_expiry - CURRENT_DATE <= 7 THEN 'critical'
        WHEN warranty_expiry - CURRENT_DATE <= COALESCE(warranty_alert_days, 30) THEN 'warning'
        ELSE 'info'
    END as alert_type,
    warranty_expiry,
    EXTRACT(DAY FROM warranty_expiry - CURRENT_DATE)
FROM inventory_assets 
WHERE warranty_expiry IS NOT NULL 
  AND warranty_expiry > CURRENT_DATE
  AND warranty_alert_enabled = true;

-- Create view for asset summary with ticket and warranty info
CREATE OR REPLACE VIEW asset_summary_view AS
SELECT 
    a.id,
    a.asset_tag,
    a.model,
    a.status,
    a.assigned_to_user_id,
    a.department,
    a.warranty_expiry,
    a.warranty_alert_enabled,
    CASE 
        WHEN a.warranty_expiry IS NULL THEN 'no_warranty'
        WHEN a.warranty_expiry < CURRENT_DATE THEN 'expired'
        WHEN a.warranty_expiry - CURRENT_DATE <= 7 THEN 'critical'
        WHEN a.warranty_expiry - CURRENT_DATE <= COALESCE(a.warranty_alert_days, 30) THEN 'warning'
        ELSE 'ok'
    END as warranty_status,
    EXTRACT(DAY FROM a.warranty_expiry - CURRENT_DATE) as warranty_days_remaining,
    COUNT(DISTINCT ath.ticket_id) as total_tickets,
    COUNT(DISTINCT CASE WHEN st.status IN ('open', 'in_progress') THEN ath.ticket_id END) as active_tickets,
    COUNT(DISTINCT awa.id) as warranty_alerts_count,
    COUNT(DISTINCT CASE WHEN awa.notification_sent = false THEN awa.id END) as pending_alerts_count,
    a.created_at,
    a.updated_at
FROM inventory_assets a
LEFT JOIN asset_ticket_history ath ON a.id = ath.asset_id AND ath.ended_at IS NULL
LEFT JOIN support_tickets st ON ath.ticket_id = st.id
LEFT JOIN asset_warranty_alerts awa ON a.id = awa.asset_id AND awa.dismissed = false
GROUP BY a.id, a.asset_tag, a.model, a.status, a.assigned_to_user_id, a.department, 
         a.warranty_expiry, a.warranty_alert_enabled, a.warranty_alert_days, a.created_at, a.updated_at;

-- Add comments for documentation
COMMENT ON TABLE asset_ticket_history IS 'Tracks relationships between assets and support tickets';
COMMENT ON TABLE asset_warranty_alerts IS 'Automated warranty expiration alerts and notifications';
COMMENT ON TABLE asset_import_batches IS 'Tracks bulk import operations with validation and rollback capabilities';
COMMENT ON TABLE asset_validation_logs IS 'Detailed logs for import validation errors and warnings';
COMMENT ON TABLE kiosk_asset_registry IS 'Registry of assets associated with kiosks, integrated with Helix APIs';
COMMENT ON VIEW asset_summary_view IS 'Comprehensive asset view with ticket history and warranty status';
