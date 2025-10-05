-- API Key Rotation Schema
-- Supports API key versioning and rotation with grace periods

CREATE TABLE IF NOT EXISTS api_keys (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  key_hash VARCHAR(255) UNIQUE NOT NULL,
  client_id UUID,
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  
  -- Key metadata
  description TEXT,
  scopes JSONB DEFAULT '[]'::jsonb,
  version INTEGER DEFAULT 1,
  
  -- Status and lifecycle
  is_active BOOLEAN DEFAULT true,
  expires_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  rotated_at TIMESTAMP WITH TIME ZONE,
  last_used_at TIMESTAMP WITH TIME ZONE,
  
  -- Audit
  created_by TEXT,
  notes TEXT
);

-- Indexes for performance
CREATE INDEX idx_api_keys_tenant ON api_keys(tenant_id);
CREATE INDEX idx_api_keys_client ON api_keys(client_id);
CREATE INDEX idx_api_keys_hash ON api_keys(key_hash) WHERE is_active = true;
CREATE INDEX idx_api_keys_expires ON api_keys(expires_at) WHERE expires_at IS NOT NULL;
CREATE INDEX idx_api_keys_active ON api_keys(tenant_id, is_active) WHERE is_active = true;

-- Add session_config column to tenants if not exists
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'tenants' AND column_name = 'session_config'
  ) THEN
    ALTER TABLE tenants ADD COLUMN session_config JSONB DEFAULT '{}'::jsonb;
  END IF;
END $$;

-- Add token_config column to tenants if not exists
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'tenants' AND column_name = 'token_config'
  ) THEN
    ALTER TABLE tenants ADD COLUMN token_config JSONB DEFAULT '{}'::jsonb;
  END IF;
END $$;

-- Add logged_out_at column to auth_sessions if not exists
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'auth_sessions' AND column_name = 'logged_out_at'
  ) THEN
    ALTER TABLE auth_sessions ADD COLUMN logged_out_at TIMESTAMP WITH TIME ZONE;
  END IF;
END $$;

-- Password history table for preventing password reuse
CREATE TABLE IF NOT EXISTS password_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL,
  tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
  password_hash VARCHAR(255) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_password_history_user ON password_history(user_id, tenant_id);
CREATE INDEX idx_password_history_created ON password_history(created_at);

-- Function to check password history
CREATE OR REPLACE FUNCTION check_password_history(
  p_user_id TEXT,
  p_tenant_id UUID,
  p_new_password_hash VARCHAR(255),
  p_history_count INTEGER DEFAULT 5
) RETURNS BOOLEAN AS $$
DECLARE
  v_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO v_count
  FROM (
    SELECT password_hash
    FROM password_history
    WHERE user_id = p_user_id AND tenant_id = p_tenant_id
    ORDER BY created_at DESC
    LIMIT p_history_count
  ) recent
  WHERE password_hash = p_new_password_hash;
  
  RETURN v_count = 0;
END;
$$ LANGUAGE plpgsql;

-- Function to add password to history
CREATE OR REPLACE FUNCTION add_password_to_history() RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO password_history (user_id, tenant_id, password_hash)
  VALUES (NEW.id, NEW.tenant_id, NEW.password);
  
  -- Clean up old password history (keep last 10)
  DELETE FROM password_history
  WHERE user_id = NEW.id
    AND tenant_id = NEW.tenant_id
    AND id NOT IN (
      SELECT id FROM password_history
      WHERE user_id = NEW.id AND tenant_id = NEW.tenant_id
      ORDER BY created_at DESC
      LIMIT 10
    );
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for password history (only if users table exists)
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'users') THEN
    DROP TRIGGER IF EXISTS trigger_password_history ON users;
    CREATE TRIGGER trigger_password_history
    AFTER UPDATE OF password ON users
    FOR EACH ROW
    WHEN (OLD.password IS DISTINCT FROM NEW.password)
    EXECUTE FUNCTION add_password_to_history();
  END IF;
END $$;

-- Comments for documentation
COMMENT ON TABLE api_keys IS 'API keys with rotation support and grace periods';
COMMENT ON TABLE password_history IS 'Password history to prevent password reuse';
COMMENT ON COLUMN api_keys.version IS 'Version number incremented on each rotation';
COMMENT ON COLUMN api_keys.rotated_at IS 'Timestamp when key was rotated (old key gets grace period)';
COMMENT ON COLUMN tenants.session_config IS 'Tenant-specific session configuration (max sessions, timeouts, etc.)';
COMMENT ON COLUMN tenants.token_config IS 'Tenant-specific token configuration (expiry times, etc.)';
