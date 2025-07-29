-- Add inventory asset tables
CREATE TABLE IF NOT EXISTS inventory_assets (
    id SERIAL PRIMARY KEY,
    asset_tag VARCHAR(100) NOT NULL,
    type_id INTEGER,
    serial_number VARCHAR(100),
    model VARCHAR(255),
    vendor_id INTEGER,
    purchase_date TIMESTAMP,
    warranty_expiry TIMESTAMP,
    assigned_to_user_id VARCHAR(100),
    assigned_to_org_id INTEGER,
    assigned_to_customer_id INTEGER,
    department VARCHAR(100),
    status VARCHAR(50),
    location_id INTEGER,
    kiosk_id VARCHAR(100),
    custom_fields JSONB DEFAULT '{}',
    notes TEXT,
    created_by VARCHAR(100),
    updated_by VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS asset_status_logs (
    id SERIAL PRIMARY KEY,
    asset_id INTEGER REFERENCES inventory_assets(id),
    previous_status VARCHAR(50),
    new_status VARCHAR(50) NOT NULL,
    changed_by_user_id VARCHAR(100),
    notes TEXT,
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS asset_assignments (
    id SERIAL PRIMARY KEY,
    asset_id INTEGER REFERENCES inventory_assets(id),
    user_id VARCHAR(100),
    org_id INTEGER,
    customer_id INTEGER,
    assigned_by VARCHAR(100),
    assigned_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    expected_return TIMESTAMP,
    return_date TIMESTAMP,
    manager_id VARCHAR(100)
);

