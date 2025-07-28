-- Initial PostgreSQL schema migration
-- Created: 2025-01-24
-- Migrates from SQLite schema to PostgreSQL with improvements

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Users table with enhanced security
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    uuid UUID DEFAULT uuid_generate_v4() UNIQUE,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    password_hash VARCHAR(255),
    disabled BOOLEAN DEFAULT FALSE,
    is_default BOOLEAN DEFAULT FALSE,
    last_login TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    -- Security fields
    failed_login_attempts INTEGER DEFAULT 0,
    locked_until TIMESTAMP NULL,
    password_changed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    -- Constraints
    CONSTRAINT users_email_format CHECK (email ~* '^[A-Za-z0-9](\.?[A-Za-z0-9_-])*@[A-Za-z0-9-]+(\.[A-Za-z]{2,})+$'),
    CONSTRAINT users_name_length CHECK (length(name) >= 2)
);

-- Roles table
CREATE TABLE IF NOT EXISTS roles (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    CONSTRAINT roles_name_length CHECK (length(name) >= 2)
);

-- Permissions table
CREATE TABLE IF NOT EXISTS permissions (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    description TEXT,
    resource VARCHAR(100),
    action VARCHAR(50),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    CONSTRAINT permissions_name_length CHECK (length(name) >= 2)
);

-- Role permissions junction table
CREATE TABLE IF NOT EXISTS role_permissions (
    role_id INTEGER NOT NULL REFERENCES roles(id) ON DELETE CASCADE,
    permission_id INTEGER NOT NULL REFERENCES permissions(id) ON DELETE CASCADE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    PRIMARY KEY (role_id, permission_id)
);

-- User roles junction table
CREATE TABLE IF NOT EXISTS user_roles (
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    role_id INTEGER NOT NULL REFERENCES roles(id) ON DELETE CASCADE,
    assigned_by INTEGER REFERENCES users(id),
    assigned_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    expires_at TIMESTAMP NULL,
    
    PRIMARY KEY (user_id, role_id)
);

-- WebAuthn/Passkeys table
CREATE TABLE IF NOT EXISTS passkeys (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    credential_id TEXT NOT NULL UNIQUE,
    public_key TEXT NOT NULL,
    counter INTEGER DEFAULT 0,
    transports TEXT,
    device_type VARCHAR(50),
    backed_up BOOLEAN DEFAULT FALSE,
    name VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    last_used TIMESTAMP,
    
    CONSTRAINT passkeys_credential_id_length CHECK (length(credential_id) > 0),
    CONSTRAINT passkeys_public_key_length CHECK (length(public_key) > 0)
);

-- Configuration table with enhanced structure
CREATE TABLE IF NOT EXISTS config (
    id SERIAL PRIMARY KEY,
    key VARCHAR(255) NOT NULL UNIQUE,
    value TEXT,
    value_type VARCHAR(20) DEFAULT 'string',
    description TEXT,
    is_public BOOLEAN DEFAULT FALSE,
    is_encrypted BOOLEAN DEFAULT FALSE,
    category VARCHAR(100) DEFAULT 'general',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    CONSTRAINT config_key_format CHECK (key ~* '^[a-z0-9_]+$'),
    CONSTRAINT config_value_type_check CHECK (value_type IN ('string', 'number', 'boolean', 'json', 'encrypted'))
);

-- Kiosks table with enhanced features
CREATE TABLE IF NOT EXISTS kiosks (
    id VARCHAR(100) PRIMARY KEY,
    uuid UUID DEFAULT uuid_generate_v4() UNIQUE,
    name VARCHAR(255),
    location VARCHAR(255),
    last_seen TIMESTAMP,
    version VARCHAR(50),
    active BOOLEAN DEFAULT FALSE,
    
    -- Display configuration
    logo_url TEXT,
    bg_url TEXT,
    
    -- Status configuration
    status_enabled BOOLEAN DEFAULT FALSE,
    current_status VARCHAR(50),
    
    -- Status messages
    open_msg TEXT DEFAULT 'Open',
    closed_msg TEXT DEFAULT 'Closed',
    error_msg TEXT DEFAULT 'Error',
    meeting_msg TEXT DEFAULT 'In a Meeting - Back Soon',
    brb_msg TEXT DEFAULT 'Be Right Back',
    lunch_msg TEXT DEFAULT 'Out to Lunch - Back in 1 Hour',
    unavailable_msg TEXT DEFAULT 'Status Unavailable',
    
    -- Schedule (JSON format)
    schedule JSONB,
    
    -- Metadata
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    CONSTRAINT kiosks_id_length CHECK (length(id) > 0),
    CONSTRAINT kiosks_version_format CHECK (version ~* '^[0-9]+\.[0-9]+\.[0-9]+')
);

-- Logs table with improved structure
CREATE TABLE IF NOT EXISTS logs (
    id SERIAL PRIMARY KEY,
    uuid UUID DEFAULT uuid_generate_v4() UNIQUE,
    ticket_id VARCHAR(100),
    name VARCHAR(255),
    email VARCHAR(255),
    title VARCHAR(500),
    system VARCHAR(100),
    urgency VARCHAR(20),
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    -- Email integration
    email_status VARCHAR(50) DEFAULT 'pending',
    email_sent_at TIMESTAMP,
    
    -- External integrations
    servicenow_id VARCHAR(100),
    external_refs JSONB DEFAULT '{}',
    
    -- Metadata
    kiosk_id VARCHAR(100) REFERENCES kiosks(id),
    user_id INTEGER REFERENCES users(id),
    metadata JSONB DEFAULT '{}',
    
    -- Status tracking
    status VARCHAR(50) DEFAULT 'open',
    resolved_at TIMESTAMP,
    resolved_by INTEGER REFERENCES users(id),
    
    CONSTRAINT logs_urgency_check CHECK (urgency IN ('low', 'medium', 'high', 'critical')),
    CONSTRAINT logs_status_check CHECK (status IN ('open', 'in_progress', 'resolved', 'closed')),
    CONSTRAINT logs_email_status_check CHECK (email_status IN ('pending', 'sent', 'failed', 'not_required'))
);

-- Notifications table
CREATE TABLE IF NOT EXISTS notifications (
    id SERIAL PRIMARY KEY,
    uuid UUID DEFAULT uuid_generate_v4() UNIQUE,
    message TEXT NOT NULL,
    level VARCHAR(20) DEFAULT 'info',
    type VARCHAR(50) DEFAULT 'system',
    active BOOLEAN DEFAULT TRUE,
    
    -- Targeting
    target_user_id INTEGER REFERENCES users(id),
    target_role_id INTEGER REFERENCES roles(id),
    target_kiosk_id VARCHAR(100) REFERENCES kiosks(id),
    
    -- Scheduling
    scheduled_at TIMESTAMP,
    expires_at TIMESTAMP,
    
    -- Metadata
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    CONSTRAINT notifications_level_check CHECK (level IN ('info', 'warning', 'error', 'success')),
    CONSTRAINT notifications_message_length CHECK (length(message) > 0)
);

-- Assets table for file management
CREATE TABLE IF NOT EXISTS assets (
    id SERIAL PRIMARY KEY,
    uuid UUID DEFAULT uuid_generate_v4() UNIQUE,
    name VARCHAR(255) NOT NULL,
    type VARCHAR(100) NOT NULL,
    filename VARCHAR(255) NOT NULL,
    url TEXT NOT NULL,
    file_size BIGINT,
    mime_type VARCHAR(100),
    
    -- Security
    checksum VARCHAR(64),
    is_public BOOLEAN DEFAULT FALSE,
    
    -- Metadata
    metadata JSONB DEFAULT '{}',
    uploaded_by INTEGER REFERENCES users(id),
    uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    CONSTRAINT assets_name_length CHECK (length(name) > 0),
    CONSTRAINT assets_filename_length CHECK (length(filename) > 0),
    CONSTRAINT assets_url_length CHECK (length(url) > 0)
);

-- Kiosk activations table
CREATE TABLE IF NOT EXISTS kiosk_activations (
    id VARCHAR(100) PRIMARY KEY,
    code VARCHAR(20) NOT NULL UNIQUE,
    qr_code TEXT NOT NULL,
    expires_at TIMESTAMP NOT NULL,
    used BOOLEAN DEFAULT FALSE,
    used_at TIMESTAMP,
    used_by_kiosk VARCHAR(100) REFERENCES kiosks(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    CONSTRAINT kiosk_activations_code_length CHECK (length(code) >= 6),
    CONSTRAINT kiosk_activations_expires_future CHECK (expires_at > created_at)
);

-- SSO configurations table
CREATE TABLE IF NOT EXISTS sso_configurations (
    id SERIAL PRIMARY KEY,
    provider VARCHAR(50) NOT NULL,
    enabled BOOLEAN DEFAULT FALSE,
    configuration JSONB NOT NULL DEFAULT '{}',
    
    -- Metadata
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_by INTEGER REFERENCES users(id),
    
    CONSTRAINT sso_provider_check CHECK (provider IN ('saml', 'oidc', 'oauth2', 'ldap')),
    CONSTRAINT sso_configurations_unique_provider UNIQUE (provider)
);

-- Admin PINs table
CREATE TABLE IF NOT EXISTS admin_pins (
    id INTEGER PRIMARY KEY DEFAULT 1,
    global_pin VARCHAR(20),
    kiosk_pins JSONB DEFAULT '{}',
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_by INTEGER REFERENCES users(id),
    
    CONSTRAINT admin_pins_single_row CHECK (id = 1),
    CONSTRAINT admin_pins_global_pin_length CHECK (length(global_pin) >= 4)
);

-- Directory integrations table
CREATE TABLE IF NOT EXISTS directory_integrations (
    id SERIAL PRIMARY KEY,
    provider VARCHAR(50) NOT NULL,
    enabled BOOLEAN DEFAULT FALSE,
    settings JSONB DEFAULT '{}',
    
    -- Connection details
    url TEXT,
    username VARCHAR(255),
    password_encrypted TEXT,
    
    -- Sync configuration
    sync_enabled BOOLEAN DEFAULT FALSE,
    last_sync TIMESTAMP,
    sync_interval INTEGER DEFAULT 3600,
    
    -- Metadata
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    CONSTRAINT directory_provider_check CHECK (provider IN ('ldap', 'active_directory', 'azure_ad', 'google', 'mock'))
);

-- Drop audit_logs table if it exists to avoid partial/corrupt state
DROP TABLE IF EXISTS audit_logs CASCADE;

-- Audit logs table (no foreign key constraint)
CREATE TABLE audit_logs (
    id SERIAL PRIMARY KEY,
    uuid UUID DEFAULT uuid_generate_v4() UNIQUE,
    action VARCHAR(100) NOT NULL,
    resource_type VARCHAR(50),
    resource_id VARCHAR(100),
    user_id INTEGER,
    
    -- Request details
    ip_address INET,
    user_agent TEXT,
    request_id VARCHAR(100),
    
    -- Change details
    old_values JSONB,
    new_values JSONB,
    
    -- Metadata
    details JSONB DEFAULT '{}',
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    CONSTRAINT audit_logs_action_length CHECK (length(action) > 0)
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_uuid ON users(uuid);
CREATE INDEX IF NOT EXISTS idx_users_disabled ON users(disabled);
CREATE INDEX IF NOT EXISTS idx_users_lastLogin ON users("lastLogin");
CREATE INDEX IF NOT EXISTS idx_users_createdAt ON users("createdAt");
CREATE INDEX IF NOT EXISTS idx_users_updatedAt ON users("updatedAt");

CREATE INDEX IF NOT EXISTS idx_passkeys_userId ON passkeys("userId");
CREATE INDEX IF NOT EXISTS idx_passkeys_credentialId ON passkeys("credentialId");

CREATE INDEX IF NOT EXISTS idx_config_key ON config(key);
CREATE INDEX IF NOT EXISTS idx_config_category ON config(category);
CREATE INDEX IF NOT EXISTS idx_config_is_public ON config(is_public);

CREATE INDEX IF NOT EXISTS idx_kiosks_active ON kiosks(active);
CREATE INDEX IF NOT EXISTS idx_kiosks_lastSeen ON kiosks("lastSeen");
-- CREATE INDEX IF NOT EXISTS idx_kiosks_uuid ON kiosks(uuid);

CREATE INDEX IF NOT EXISTS idx_logs_timestamp ON logs("timestamp");
CREATE INDEX IF NOT EXISTS idx_logs_ticketId ON logs("ticketId");
CREATE INDEX IF NOT EXISTS idx_logs_email ON logs(email);
-- CREATE INDEX IF NOT EXISTS idx_logs_status ON logs(status);
-- CREATE INDEX IF NOT EXISTS idx_logs_kioskId ON logs("kioskId");
CREATE INDEX IF NOT EXISTS idx_logs_userId ON logs("userId");
-- CREATE INDEX IF NOT EXISTS idx_logs_uuid ON logs(uuid);

CREATE INDEX IF NOT EXISTS idx_notifications_active ON notifications(active);
CREATE INDEX IF NOT EXISTS idx_notifications_level ON notifications(level);
CREATE INDEX IF NOT EXISTS idx_notifications_type ON notifications(type);

CREATE INDEX IF NOT EXISTS idx_assets_type ON assets(type);
CREATE INDEX IF NOT EXISTS idx_assets_uploadedAt ON assets("uploadedAt");

CREATE INDEX IF NOT EXISTS idx_audit_logs_timestamp ON audit_logs(timestamp);
CREATE INDEX IF NOT EXISTS idx_audit_logs_user_id ON audit_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_action ON audit_logs(action);
CREATE INDEX IF NOT EXISTS idx_audit_logs_resource ON audit_logs(resource_type, resource_id);

-- (Removed trigger function and triggers from this migration. They are now in a separate migration file.)
