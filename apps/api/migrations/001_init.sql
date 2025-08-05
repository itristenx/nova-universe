-- Combined migration for Nova Universe API (all schema in one file for new DB)

-- Config table
CREATE TABLE IF NOT EXISTS config (
  key TEXT PRIMARY KEY,
  value TEXT
);

-- Users table
CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP
);

-- Roles table
CREATE TABLE IF NOT EXISTS roles (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  description TEXT
);

-- User roles join table
CREATE TABLE IF NOT EXISTS user_roles (
  user_id INTEGER NOT NULL,
  role_id INTEGER NOT NULL,
  PRIMARY KEY (user_id, role_id),
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (role_id) REFERENCES roles(id) ON DELETE CASCADE
);

-- WebAuthn credentials for passkey support
CREATE TABLE IF NOT EXISTS webauthn_credentials (
  id TEXT PRIMARY KEY,
  user_id INTEGER NOT NULL,
  credential_id TEXT NOT NULL UNIQUE,
  credential_public_key TEXT NOT NULL,
  counter INTEGER DEFAULT 0,
  credential_device_type TEXT,
  credential_backed_up INTEGER DEFAULT 0,
  transports TEXT,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP,
  last_used TEXT,
  name TEXT,
  FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
);

-- SSO configurations
CREATE TABLE IF NOT EXISTS sso_configurations (
  id SERIAL PRIMARY KEY,
  provider TEXT NOT NULL,
  enabled INTEGER DEFAULT 0,
  configuration TEXT NOT NULL,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT DEFAULT CURRENT_TIMESTAMP
);

-- SCIM configurations
CREATE TABLE IF NOT EXISTS scim_configurations (
  id SERIAL PRIMARY KEY,
  enabled INTEGER DEFAULT 0,
  bearer_token TEXT,
  endpoint_url TEXT DEFAULT '/scim/v2',
  auto_provisioning INTEGER DEFAULT 1,
  auto_deprovisioning INTEGER DEFAULT 0,
  sync_interval INTEGER DEFAULT 3600,
  last_sync TEXT,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT DEFAULT CURRENT_TIMESTAMP
);

-- Audit logs table
CREATE TABLE IF NOT EXISTS audit_logs (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
  action TEXT NOT NULL,
  details TEXT,
  timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Default config values
INSERT OR IGNORE INTO config (key, value) VALUES ('sso_enabled', '0');
INSERT OR IGNORE INTO config (key, value) VALUES ('scim_enabled', '0');
INSERT OR IGNORE INTO config (key, value) VALUES ('passkey_enabled', '1');
INSERT OR IGNORE INTO config (key, value) VALUES ('webauthn_rp_name', 'Nova Universe Portal');
INSERT OR IGNORE INTO config (key, value) VALUES ('webauthn_rp_id', 'localhost');

-- Indices
CREATE INDEX IF NOT EXISTS idx_webauthn_user_id ON webauthn_credentials(user_id);
CREATE INDEX IF NOT EXISTS idx_webauthn_credential_id ON webauthn_credentials(credential_id);
CREATE INDEX IF NOT EXISTS idx_sso_provider ON sso_configurations(provider);
