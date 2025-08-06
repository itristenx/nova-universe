-- Nova Helix Universal Login Schema Migration
-- Creates tables for tenant-aware authentication, SSO, MFA, and audit logging

-- Tenants table for multi-tenant branding and configuration
CREATE TABLE IF NOT EXISTS tenants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  domain VARCHAR(255) UNIQUE NOT NULL,
  subdomain VARCHAR(100) UNIQUE,
  logo_url TEXT,
  theme_color VARCHAR(7) DEFAULT '#000000',
  background_image_url TEXT,
  custom_css TEXT,
  login_message TEXT,
  terms_url TEXT,
  privacy_url TEXT,
  support_email VARCHAR(255),
  sso_enabled BOOLEAN DEFAULT false,
  mfa_required BOOLEAN DEFAULT false,
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- SSO configurations for each tenant
CREATE TABLE IF NOT EXISTS sso_configs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  provider VARCHAR(50) NOT NULL, -- 'saml', 'oidc', 'google', 'microsoft'
  provider_name VARCHAR(100) NOT NULL,
  enabled BOOLEAN DEFAULT true,
  
  -- SAML specific fields
  saml_entity_id TEXT,
  saml_sso_url TEXT,
  saml_slo_url TEXT,
  saml_certificate TEXT,
  saml_name_id_format VARCHAR(100),
  
  -- OIDC specific fields  
  oidc_issuer TEXT,
  oidc_client_id TEXT,
  oidc_client_secret_encrypted TEXT,
  oidc_authorization_url TEXT,
  oidc_token_url TEXT,
  oidc_userinfo_url TEXT,
  oidc_jwks_uri TEXT,
  oidc_scopes TEXT DEFAULT 'openid profile email',
  
  -- Common fields
  attribute_mappings JSONB,
  auto_provision BOOLEAN DEFAULT false,
  default_role_id INTEGER,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  
  UNIQUE(tenant_id, provider)
);

-- Enhanced auth sessions for centralized session management
CREATE TABLE IF NOT EXISTS auth_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
  session_token VARCHAR(255) UNIQUE NOT NULL,
  refresh_token VARCHAR(255) UNIQUE,
  access_token_hash VARCHAR(255), -- Hash of JWT for revocation
  
  -- Session metadata
  ip_address INET,
  user_agent TEXT,
  device_fingerprint VARCHAR(255),
  location_country VARCHAR(2),
  location_city VARCHAR(100),
  
  -- Session status
  is_active BOOLEAN DEFAULT true,
  login_method VARCHAR(50) NOT NULL, -- 'password', 'sso', 'mfa', 'passkey'
  sso_provider VARCHAR(50),
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  last_accessed_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  refresh_expires_at TIMESTAMP WITH TIME ZONE
);

-- MFA methods and configurations per user
CREATE TABLE IF NOT EXISTS mfa_methods (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
  method_type VARCHAR(50) NOT NULL, -- 'totp', 'sms', 'email', 'backup_codes'
  method_name VARCHAR(100),
  
  -- TOTP specific
  totp_secret_encrypted TEXT,
  totp_algorithm VARCHAR(10) DEFAULT 'SHA1',
  totp_digits INTEGER DEFAULT 6,
  totp_period INTEGER DEFAULT 30,
  
  -- SMS/Email specific
  phone_number_encrypted TEXT,
  email_address_encrypted TEXT,
  
  -- Backup codes
  backup_codes_encrypted TEXT, -- JSON array of codes
  backup_codes_used JSONB DEFAULT '[]',
  
  -- Status
  is_primary BOOLEAN DEFAULT false,
  is_verified BOOLEAN DEFAULT false,
  is_active BOOLEAN DEFAULT true,
  
  -- Metadata
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  verified_at TIMESTAMP WITH TIME ZONE,
  last_used_at TIMESTAMP WITH TIME ZONE
);

-- Comprehensive audit logging for authentication events
CREATE TABLE IF NOT EXISTS auth_audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID REFERENCES tenants(id),
  user_id UUID REFERENCES users(id),
  session_id UUID REFERENCES auth_sessions(id),
  
  -- Event details
  event_type VARCHAR(50) NOT NULL, -- 'login_attempt', 'login_success', 'login_failure', 'logout', 'mfa_challenge', 'mfa_success', 'mfa_failure', 'token_refresh', 'session_expired'
  event_category VARCHAR(50) NOT NULL, -- 'authentication', 'authorization', 'session', 'mfa'
  event_description TEXT,
  
  -- Request details
  ip_address INET,
  user_agent TEXT,
  device_fingerprint VARCHAR(255),
  request_id VARCHAR(100),
  
  -- Authentication details
  auth_method VARCHAR(50), -- 'password', 'sso', 'mfa', 'passkey'
  sso_provider VARCHAR(50),
  mfa_method VARCHAR(50),
  
  -- Result details
  success BOOLEAN NOT NULL,
  error_code VARCHAR(50),
  error_message TEXT,
  
  -- Security context
  location_country VARCHAR(2),
  location_city VARCHAR(100),
  risk_score INTEGER, -- 0-100, higher = more risky
  risk_factors JSONB,
  
  -- Additional metadata
  metadata JSONB,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- MFA challenges table for temporary challenge storage
CREATE TABLE IF NOT EXISTS mfa_challenges (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  session_temp_id VARCHAR(255) NOT NULL, -- Temporary session identifier
  challenge_type VARCHAR(50) NOT NULL, -- 'totp', 'sms', 'email'
  challenge_code_hash VARCHAR(255), -- Hashed challenge code for SMS/email
  
  -- Status
  is_verified BOOLEAN DEFAULT false,
  attempts INTEGER DEFAULT 0,
  max_attempts INTEGER DEFAULT 3,
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  verified_at TIMESTAMP WITH TIME ZONE
);

-- Login rate limiting table
CREATE TABLE IF NOT EXISTS login_rate_limits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  identifier VARCHAR(255) NOT NULL, -- Could be IP, email, user_id
  identifier_type VARCHAR(50) NOT NULL, -- 'ip', 'email', 'user'
  attempts INTEGER DEFAULT 1,
  last_attempt_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  blocked_until TIMESTAMP WITH TIME ZONE,
  
  UNIQUE(identifier, identifier_type)
);

-- Device trust table for device fingerprinting
CREATE TABLE IF NOT EXISTS trusted_devices (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  device_fingerprint VARCHAR(255) NOT NULL,
  device_name VARCHAR(255),
  device_type VARCHAR(50), -- 'desktop', 'mobile', 'tablet'
  browser_info JSONB,
  
  -- Trust level
  is_trusted BOOLEAN DEFAULT false,
  trust_expires_at TIMESTAMP WITH TIME ZONE,
  
  -- Metadata
  first_seen_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  last_seen_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  seen_count INTEGER DEFAULT 1,
  
  UNIQUE(user_id, device_fingerprint)
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_tenants_domain ON tenants(domain);
CREATE INDEX IF NOT EXISTS idx_tenants_subdomain ON tenants(subdomain);
CREATE INDEX IF NOT EXISTS idx_sso_configs_tenant ON sso_configs(tenant_id);
CREATE INDEX IF NOT EXISTS idx_auth_sessions_user ON auth_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_auth_sessions_token ON auth_sessions(session_token);
CREATE INDEX IF NOT EXISTS idx_auth_sessions_active ON auth_sessions(is_active, expires_at);
CREATE INDEX IF NOT EXISTS idx_mfa_methods_user ON mfa_methods(user_id);
CREATE INDEX IF NOT EXISTS idx_auth_audit_logs_user ON auth_audit_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_auth_audit_logs_tenant ON auth_audit_logs(tenant_id);
CREATE INDEX IF NOT EXISTS idx_auth_audit_logs_event ON auth_audit_logs(event_type, created_at);
CREATE INDEX IF NOT EXISTS idx_mfa_challenges_user ON mfa_challenges(user_id);
CREATE INDEX IF NOT EXISTS idx_mfa_challenges_temp_session ON mfa_challenges(session_temp_id);
CREATE INDEX IF NOT EXISTS idx_login_rate_limits_identifier ON login_rate_limits(identifier, identifier_type);
CREATE INDEX IF NOT EXISTS idx_trusted_devices_user ON trusted_devices(user_id);

-- Insert default tenant for existing installations
INSERT INTO tenants (id, name, domain, subdomain, theme_color, sso_enabled, mfa_required, active)
VALUES (
  gen_random_uuid(),
  'Default Organization',
  'localhost',
  'default',
  '#1f2937', -- Dark gray theme
  false,
  false,
  true
) ON CONFLICT (domain) DO NOTHING;

-- Add tenant relationship to existing users table if not exists
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='users' AND column_name='tenant_id') THEN
    ALTER TABLE users ADD COLUMN tenant_id UUID REFERENCES tenants(id);
    
    -- Set all existing users to the default tenant
    UPDATE users SET tenant_id = (SELECT id FROM tenants WHERE domain = 'localhost' LIMIT 1) WHERE tenant_id IS NULL;
  END IF;
END $$;

-- Update the updated_at timestamp on tenants
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_tenants_updated_at BEFORE UPDATE ON tenants
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_sso_configs_updated_at BEFORE UPDATE ON sso_configs
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
