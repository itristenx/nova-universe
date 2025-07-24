-- Migration for SSO, SCIM, and Passkey configurations
-- This migration adds the necessary tables and configurations for modern authentication

-- Create webauthn_credentials table for passkey support
CREATE TABLE IF NOT EXISTS webauthn_credentials (
  id TEXT PRIMARY KEY,
  user_id INTEGER NOT NULL,
  credential_id TEXT NOT NULL UNIQUE,
  credential_public_key TEXT NOT NULL,
  counter INTEGER DEFAULT 0,
  credential_device_type TEXT,
  credential_backed_up INTEGER DEFAULT 0,
  transports TEXT, -- JSON array of transport methods
  created_at TEXT DEFAULT CURRENT_TIMESTAMP,
  last_used TEXT,
  name TEXT, -- User-friendly name for the credential
  FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
);

-- Create sso_configurations table
CREATE TABLE IF NOT EXISTS sso_configurations (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  provider TEXT NOT NULL, -- 'saml', 'oidc', etc.
  enabled INTEGER DEFAULT 0,
  configuration TEXT NOT NULL, -- JSON configuration
  created_at TEXT DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT DEFAULT CURRENT_TIMESTAMP
);

-- Create scim_configurations table
CREATE TABLE IF NOT EXISTS scim_configurations (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  enabled INTEGER DEFAULT 0,
  bearer_token TEXT,
  endpoint_url TEXT DEFAULT '/scim/v2',
  auto_provisioning INTEGER DEFAULT 1,
  auto_deprovisioning INTEGER DEFAULT 0,
  sync_interval INTEGER DEFAULT 3600, -- seconds
  last_sync TEXT,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT DEFAULT CURRENT_TIMESTAMP
);

-- Insert default configurations
INSERT OR IGNORE INTO config (key, value) VALUES ('sso_enabled', '0');
INSERT OR IGNORE INTO config (key, value) VALUES ('scim_enabled', '0');
INSERT OR IGNORE INTO config (key, value) VALUES ('passkey_enabled', '1');
INSERT OR IGNORE INTO config (key, value) VALUES ('webauthn_rp_name', 'CueIT Portal');
INSERT OR IGNORE INTO config (key, value) VALUES ('webauthn_rp_id', 'localhost');

-- Create indices for performance
CREATE INDEX IF NOT EXISTS idx_webauthn_user_id ON webauthn_credentials(user_id);
CREATE INDEX IF NOT EXISTS idx_webauthn_credential_id ON webauthn_credentials(credential_id);
CREATE INDEX IF NOT EXISTS idx_sso_provider ON sso_configurations(provider);
