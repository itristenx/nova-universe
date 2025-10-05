-- Nova Universe Tenant Organizations and Cross-Tenant Access
-- Enables organization hierarchies where tenants can grant access to other tenants

-- Organizations: group multiple tenants under a parent organization
CREATE TABLE IF NOT EXISTS organizations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  slug VARCHAR(100) UNIQUE NOT NULL,
  description TEXT,
  
  -- Organization hierarchy
  parent_organization_id UUID REFERENCES organizations(id) ON DELETE SET NULL,
  
  -- Organization metadata
  industry VARCHAR(100),
  company_size VARCHAR(50),
  country VARCHAR(2),
  
  -- Billing and subscription
  subscription_tier VARCHAR(50) DEFAULT 'free',
  billing_email VARCHAR(255),
  
  -- Settings
  settings JSONB DEFAULT '{}',
  
  -- Status
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Link tenants to organizations
ALTER TABLE tenants ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) ON DELETE SET NULL;

-- Tenant relationships for cross-tenant access
CREATE TABLE IF NOT EXISTS tenant_relationships (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Source tenant grants access to target tenant
  source_tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  target_tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  
  -- Relationship type
  relationship_type VARCHAR(50) NOT NULL, -- 'full_access', 'read_only', 'scoped', 'bidirectional'
  
  -- Access scope and permissions
  access_level VARCHAR(50) NOT NULL DEFAULT 'read_only', -- 'none', 'read_only', 'read_write', 'full_admin'
  scoped_resources JSONB DEFAULT '[]', -- Array of resource types: ['users', 'tickets', 'assets']
  custom_permissions JSONB DEFAULT '{}',
  
  -- Conditions
  require_approval BOOLEAN DEFAULT false,
  auto_approved BOOLEAN DEFAULT false,
  expires_at TIMESTAMP WITH TIME ZONE,
  
  -- Metadata
  created_by TEXT, -- User ID who created the relationship
  approved_by TEXT, -- User ID who approved (if require_approval)
  description TEXT,
  
  -- Status
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  
  -- Prevent duplicate relationships
  UNIQUE(source_tenant_id, target_tenant_id),
  
  -- Prevent self-relationships
  CHECK (source_tenant_id != target_tenant_id)
);

-- Tenant discovery configurations for API-only and UI usage
CREATE TABLE IF NOT EXISTS tenant_discovery_configs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  
  -- Discovery methods
  allow_email_domain_discovery BOOLEAN DEFAULT true,
  allow_subdomain_discovery BOOLEAN DEFAULT true,
  allow_custom_domain_discovery BOOLEAN DEFAULT false,
  
  -- API-specific discovery
  api_discovery_enabled BOOLEAN DEFAULT true,
  api_discovery_methods JSONB DEFAULT '["header", "subdomain", "query_param"]', -- Methods: header, subdomain, query_param, jwt
  api_key_header_name VARCHAR(100) DEFAULT 'X-Tenant-ID',
  api_subdomain_pattern VARCHAR(255), -- e.g., {tenant}.api.example.com
  
  -- UI-specific discovery
  ui_discovery_enabled BOOLEAN DEFAULT true,
  ui_discovery_methods JSONB DEFAULT '["subdomain", "email"]',
  ui_subdomain_pattern VARCHAR(255), -- e.g., {tenant}.example.com
  ui_custom_domains TEXT[], -- Array of custom domains
  
  -- Fallback behavior
  fallback_to_default_tenant BOOLEAN DEFAULT false,
  default_tenant_id UUID REFERENCES tenants(id),
  
  -- Multi-tenant mode
  multi_tenant_mode VARCHAR(50) DEFAULT 'isolated', -- 'isolated', 'shared', 'hybrid'
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  
  UNIQUE(tenant_id)
);

-- Audit log for cross-tenant access
CREATE TABLE IF NOT EXISTS cross_tenant_access_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Access details
  source_tenant_id UUID NOT NULL REFERENCES tenants(id),
  target_tenant_id UUID NOT NULL REFERENCES tenants(id),
  user_id TEXT NOT NULL,
  
  -- Request details
  action VARCHAR(100) NOT NULL, -- 'read', 'write', 'delete', 'admin'
  resource_type VARCHAR(100), -- 'user', 'ticket', 'asset', etc.
  resource_id TEXT,
  
  -- Access result
  access_granted BOOLEAN NOT NULL,
  denial_reason TEXT,
  
  -- Context
  ip_address INET,
  user_agent TEXT,
  request_path TEXT,
  
  -- Metadata
  metadata JSONB DEFAULT '{}',
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_organizations_slug ON organizations(slug);
CREATE INDEX IF NOT EXISTS idx_organizations_parent ON organizations(parent_organization_id);
CREATE INDEX IF NOT EXISTS idx_tenants_organization ON tenants(organization_id);
CREATE INDEX IF NOT EXISTS idx_tenant_relationships_source ON tenant_relationships(source_tenant_id);
CREATE INDEX IF NOT EXISTS idx_tenant_relationships_target ON tenant_relationships(target_tenant_id);
CREATE INDEX IF NOT EXISTS idx_tenant_relationships_active ON tenant_relationships(active) WHERE active = true;
CREATE INDEX IF NOT EXISTS idx_tenant_discovery_configs_tenant ON tenant_discovery_configs(tenant_id);
CREATE INDEX IF NOT EXISTS idx_cross_tenant_logs_source ON cross_tenant_access_logs(source_tenant_id);
CREATE INDEX IF NOT EXISTS idx_cross_tenant_logs_target ON cross_tenant_access_logs(target_tenant_id);
CREATE INDEX IF NOT EXISTS idx_cross_tenant_logs_user ON cross_tenant_access_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_cross_tenant_logs_created ON cross_tenant_access_logs(created_at);

-- Create default discovery configs for existing tenants
INSERT INTO tenant_discovery_configs (tenant_id, api_discovery_enabled, ui_discovery_enabled)
SELECT id, true, true FROM tenants
WHERE id NOT IN (SELECT tenant_id FROM tenant_discovery_configs)
ON CONFLICT (tenant_id) DO NOTHING;

-- Triggers for updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_organizations_updated_at BEFORE UPDATE ON organizations
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_tenant_relationships_updated_at BEFORE UPDATE ON tenant_relationships
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_tenant_discovery_configs_updated_at BEFORE UPDATE ON tenant_discovery_configs
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Sample data for localhost tenant (development/demo)
DO $$
DECLARE
  localhost_tenant_id UUID;
  demo_org_id UUID;
BEGIN
  -- Get localhost tenant
  SELECT id INTO localhost_tenant_id FROM tenants WHERE domain = 'localhost' LIMIT 1;
  
  IF localhost_tenant_id IS NOT NULL THEN
    -- Create demo organization
    INSERT INTO organizations (name, slug, description, subscription_tier)
    VALUES ('Demo Organization', 'demo-org', 'Default organization for development', 'enterprise')
    ON CONFLICT (slug) DO NOTHING
    RETURNING id INTO demo_org_id;
    
    -- Link localhost tenant to organization
    IF demo_org_id IS NOT NULL THEN
      UPDATE tenants SET organization_id = demo_org_id WHERE id = localhost_tenant_id;
    END IF;
    
    -- Create discovery config for localhost tenant
    INSERT INTO tenant_discovery_configs (
      tenant_id,
      allow_email_domain_discovery,
      allow_subdomain_discovery,
      api_discovery_enabled,
      ui_discovery_enabled,
      fallback_to_default_tenant
    ) VALUES (
      localhost_tenant_id,
      true,
      true,
      true,
      true,
      true
    ) ON CONFLICT (tenant_id) DO NOTHING;
  END IF;
END $$;

COMMENT ON TABLE organizations IS 'Organizations group multiple tenants for hierarchical multi-tenancy';
COMMENT ON TABLE tenant_relationships IS 'Define cross-tenant access relationships (e.g., Tenant A can access Tenant B)';
COMMENT ON TABLE tenant_discovery_configs IS 'Configure how tenants are discovered for API and UI usage';
COMMENT ON TABLE cross_tenant_access_logs IS 'Audit log for all cross-tenant access attempts';
