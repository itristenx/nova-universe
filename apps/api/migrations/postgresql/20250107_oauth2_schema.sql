-- OAuth 2.0 Database Schema Migration
-- Implements RFC 6749 (OAuth 2.0) with PKCE (RFC 7636) support
-- Includes tenant isolation for multi-tenant environments

-- OAuth Clients Table (RFC 7591 - Dynamic Client Registration)
CREATE TABLE IF NOT EXISTS oauth_clients (
  id SERIAL PRIMARY KEY,
  client_id VARCHAR(255) UNIQUE NOT NULL,
  client_secret_hash VARCHAR(255) NOT NULL,
  client_name VARCHAR(255) NOT NULL,
  redirect_uris TEXT NOT NULL, -- JSON array of allowed redirect URIs
  scope TEXT, -- Space-separated list of scopes
  grant_types TEXT, -- JSON array of allowed grant types
  tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_oauth_clients_client_id ON oauth_clients(client_id);
CREATE INDEX idx_oauth_clients_tenant_id ON oauth_clients(tenant_id);

-- OAuth Authorization Codes Table (RFC 6749 Section 4.1)
CREATE TABLE IF NOT EXISTS oauth_authorization_codes (
  id SERIAL PRIMARY KEY,
  code VARCHAR(255) UNIQUE NOT NULL,
  client_id VARCHAR(255) NOT NULL REFERENCES oauth_clients(client_id) ON DELETE CASCADE,
  user_id TEXT, -- Reference to users table
  redirect_uri TEXT NOT NULL,
  scope TEXT,
  code_challenge VARCHAR(255), -- PKCE code challenge (RFC 7636)
  code_challenge_method VARCHAR(10) DEFAULT 'S256', -- S256 or plain
  tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
  used BOOLEAN DEFAULT FALSE,
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_oauth_codes_code ON oauth_authorization_codes(code);
CREATE INDEX idx_oauth_codes_client_id ON oauth_authorization_codes(client_id);
CREATE INDEX idx_oauth_codes_user_id ON oauth_authorization_codes(user_id);
CREATE INDEX idx_oauth_codes_expires_at ON oauth_authorization_codes(expires_at);

-- OAuth Revoked Tokens Table (RFC 7009 - Token Revocation)
CREATE TABLE IF NOT EXISTS oauth_revoked_tokens (
  id SERIAL PRIMARY KEY,
  jti VARCHAR(255) UNIQUE NOT NULL, -- JWT ID from token
  token_type VARCHAR(50), -- 'access' or 'refresh'
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  revoked_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_oauth_revoked_jti ON oauth_revoked_tokens(jti);
CREATE INDEX idx_oauth_revoked_expires ON oauth_revoked_tokens(expires_at);

-- Cleanup function to remove expired authorization codes and revoked tokens
CREATE OR REPLACE FUNCTION cleanup_expired_oauth_data()
RETURNS void AS $$
BEGIN
  -- Delete expired authorization codes
  DELETE FROM oauth_authorization_codes 
  WHERE expires_at < CURRENT_TIMESTAMP;
  
  -- Delete expired revoked tokens
  DELETE FROM oauth_revoked_tokens 
  WHERE expires_at < CURRENT_TIMESTAMP;
END;
$$ LANGUAGE plpgsql;

-- Create a scheduled job to run cleanup (requires pg_cron extension)
-- If pg_cron is not available, this can be run manually or via cron
-- SELECT cron.schedule('cleanup_oauth_data', '0 * * * *', 'SELECT cleanup_expired_oauth_data()');

-- Update trigger for oauth_clients
CREATE OR REPLACE FUNCTION update_oauth_clients_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER oauth_clients_updated_at_trigger
BEFORE UPDATE ON oauth_clients
FOR EACH ROW EXECUTE FUNCTION update_oauth_clients_updated_at();

-- Insert default OAuth client for testing/development
INSERT INTO oauth_clients (
  client_id, 
  client_secret_hash, 
  client_name, 
  redirect_uris, 
  scope, 
  grant_types,
  tenant_id
) VALUES (
  'nova-universe-dev',
  -- Hash of 'dev-secret-change-in-production'
  'c7ad44cbad762a5da0a452f9e854fdc1e0e7a52a38015f23f3eab1d80b931dd472634dfac71cd34ebc35d16ab7fb8a90c81f975113d6c7538dc69dd8de9077ec',
  'Nova Universe Development Client',
  '["http://localhost:5173/callback", "http://localhost:3000/callback", "http://localhost:8080/callback"]',
  'read write openid profile email',
  '["authorization_code", "refresh_token", "client_credentials"]',
  NULL
) ON CONFLICT (client_id) DO NOTHING;

-- Comments for documentation
COMMENT ON TABLE oauth_clients IS 'OAuth 2.0 client registrations (RFC 7591)';
COMMENT ON TABLE oauth_authorization_codes IS 'OAuth 2.0 authorization codes with PKCE support (RFC 6749, RFC 7636)';
COMMENT ON TABLE oauth_revoked_tokens IS 'Revoked OAuth 2.0 tokens for blacklist checking (RFC 7009)';

COMMENT ON COLUMN oauth_clients.client_id IS 'Unique client identifier';
COMMENT ON COLUMN oauth_clients.client_secret_hash IS 'SHA-256 hash of client secret';
COMMENT ON COLUMN oauth_clients.redirect_uris IS 'JSON array of allowed redirect URIs';
COMMENT ON COLUMN oauth_clients.scope IS 'Space-separated list of allowed scopes';
COMMENT ON COLUMN oauth_clients.grant_types IS 'JSON array of allowed grant types';

COMMENT ON COLUMN oauth_authorization_codes.code_challenge IS 'PKCE code challenge (RFC 7636)';
COMMENT ON COLUMN oauth_authorization_codes.code_challenge_method IS 'PKCE challenge method: S256 or plain';
COMMENT ON COLUMN oauth_authorization_codes.used IS 'Whether authorization code has been exchanged for tokens';

COMMENT ON COLUMN oauth_revoked_tokens.jti IS 'JWT ID from token claims for revocation tracking';
