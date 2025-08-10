-- Enhanced CMDB Support Groups Migration
-- Add support group models with user-based ownership and RBAC

-- Support Groups table
CREATE TABLE IF NOT EXISTS support_groups (
    id VARCHAR(255) PRIMARY KEY,
    name VARCHAR(255) UNIQUE NOT NULL,
    description TEXT,
    type VARCHAR(50) DEFAULT 'technical' NOT NULL,
    email VARCHAR(255),
    phone VARCHAR(255),
    manager VARCHAR(255), -- Reference to core.users.id
    escalation_group VARCHAR(255), -- Reference to support_groups.id
    is_active BOOLEAN DEFAULT true NOT NULL,
    business_hours JSONB,
    sla_target INTEGER, -- Response time in minutes
    external_id VARCHAR(255), -- Reference to external ITSM system
    ad_group_dn VARCHAR(255), -- Active Directory group
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    created_by VARCHAR(255),
    updated_by VARCHAR(255),
    
    CONSTRAINT fk_support_groups_escalation 
        FOREIGN KEY (escalation_group) 
        REFERENCES support_groups(id)
);

-- Support Group Members table
CREATE TABLE IF NOT EXISTS support_group_members (
    id VARCHAR(255) PRIMARY KEY,
    support_group_id VARCHAR(255) NOT NULL,
    user_id VARCHAR(255) NOT NULL, -- Reference to core.users.id
    role VARCHAR(50) DEFAULT 'member' NOT NULL,
    is_primary BOOLEAN DEFAULT false NOT NULL,
    is_active BOOLEAN DEFAULT true NOT NULL,
    start_date TIMESTAMP WITH TIME ZONE,
    end_date TIMESTAMP WITH TIME ZONE,
    assigned_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    assigned_by VARCHAR(255),
    
    CONSTRAINT fk_support_group_members_group 
        FOREIGN KEY (support_group_id) 
        REFERENCES support_groups(id) 
        ON DELETE CASCADE,
    
    CONSTRAINT uk_support_group_members_user 
        UNIQUE (support_group_id, user_id)
);

-- Support Group Permissions table (RBAC)
CREATE TABLE IF NOT EXISTS support_group_permissions (
    id VARCHAR(255) PRIMARY KEY,
    support_group_id VARCHAR(255) NOT NULL,
    resource VARCHAR(100) NOT NULL, -- cmdb, inventory, tickets, knowledge
    action VARCHAR(50) NOT NULL, -- read, write, admin, approve
    scope VARCHAR(255), -- Scope limitations (e.g., ci_type, location)
    conditions JSONB, -- Additional conditions for permission
    is_active BOOLEAN DEFAULT true NOT NULL,
    granted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    granted_by VARCHAR(255),
    
    CONSTRAINT fk_support_group_permissions_group 
        FOREIGN KEY (support_group_id) 
        REFERENCES support_groups(id) 
        ON DELETE CASCADE,
    
    CONSTRAINT uk_support_group_permissions 
        UNIQUE (support_group_id, resource, action)
);

-- CI Ownership table (Enhanced user-based ownership)
CREATE TABLE IF NOT EXISTS ci_ownership (
    id VARCHAR(255) PRIMARY KEY,
    ci_id VARCHAR(255) NOT NULL, -- Reference to configuration_items.id
    ownership_type VARCHAR(50) NOT NULL, -- technical, business, application, data
    user_id VARCHAR(255) NOT NULL, -- Reference to core.users.id
    support_group_id VARCHAR(255), -- Reference to support_groups.id
    is_primary BOOLEAN DEFAULT false NOT NULL,
    is_active BOOLEAN DEFAULT true NOT NULL,
    start_date TIMESTAMP WITH TIME ZONE,
    end_date TIMESTAMP WITH TIME ZONE,
    responsibilities TEXT[], -- Array of specific responsibilities
    assigned_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    assigned_by VARCHAR(255),
    
    CONSTRAINT fk_ci_ownership_support_group 
        FOREIGN KEY (support_group_id) 
        REFERENCES support_groups(id),
    
    CONSTRAINT uk_ci_ownership 
        UNIQUE (ci_id, ownership_type, user_id)
);

-- CMDB-Inventory Asset Integration Mapping
CREATE TABLE IF NOT EXISTS cmdb_inventory_mapping (
    id VARCHAR(255) PRIMARY KEY,
    ci_id VARCHAR(255) NOT NULL, -- Reference to configuration_items.id
    inventory_asset_id INTEGER NOT NULL, -- Reference to core.inventory_assets.id
    mapping_type VARCHAR(50) DEFAULT 'direct' NOT NULL, -- direct, related, component
    relationship VARCHAR(255), -- describes the relationship
    sync_enabled BOOLEAN DEFAULT true NOT NULL,
    last_sync_at TIMESTAMP WITH TIME ZONE,
    sync_status VARCHAR(50), -- success, failed, pending
    sync_errors TEXT,
    conflict_resolution VARCHAR(50) DEFAULT 'cmdb_wins' NOT NULL, -- cmdb_wins, inventory_wins, manual
    field_mapping JSONB, -- Custom field mappings
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    created_by VARCHAR(255),
    
    CONSTRAINT uk_cmdb_inventory_mapping 
        UNIQUE (ci_id, inventory_asset_id)
);

-- Update Configuration Items table to add inventory asset reference
ALTER TABLE configuration_items 
ADD COLUMN IF NOT EXISTS inventory_asset_id INTEGER;

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_support_groups_name ON support_groups(name);
CREATE INDEX IF NOT EXISTS idx_support_groups_type ON support_groups(type);
CREATE INDEX IF NOT EXISTS idx_support_groups_active ON support_groups(is_active);

CREATE INDEX IF NOT EXISTS idx_support_group_members_user ON support_group_members(user_id);
CREATE INDEX IF NOT EXISTS idx_support_group_members_group ON support_group_members(support_group_id);
CREATE INDEX IF NOT EXISTS idx_support_group_members_role ON support_group_members(role);

CREATE INDEX IF NOT EXISTS idx_support_group_permissions_resource ON support_group_permissions(resource);
CREATE INDEX IF NOT EXISTS idx_support_group_permissions_action ON support_group_permissions(action);

CREATE INDEX IF NOT EXISTS idx_ci_ownership_ci ON ci_ownership(ci_id);
CREATE INDEX IF NOT EXISTS idx_ci_ownership_user ON ci_ownership(user_id);
CREATE INDEX IF NOT EXISTS idx_ci_ownership_type ON ci_ownership(ownership_type);

CREATE INDEX IF NOT EXISTS idx_cmdb_inventory_mapping_asset ON cmdb_inventory_mapping(inventory_asset_id);
CREATE INDEX IF NOT EXISTS idx_cmdb_inventory_mapping_type ON cmdb_inventory_mapping(mapping_type);
CREATE INDEX IF NOT EXISTS idx_cmdb_inventory_mapping_sync ON cmdb_inventory_mapping(sync_enabled);

-- Update existing configuration_items to reference support groups instead of string-based support_group
ALTER TABLE configuration_items 
ADD COLUMN IF NOT EXISTS support_group_id VARCHAR(255);

-- Add foreign key constraint for support_group_id
ALTER TABLE configuration_items 
ADD CONSTRAINT IF NOT EXISTS fk_configuration_items_support_group 
    FOREIGN KEY (support_group_id) 
    REFERENCES support_groups(id);

-- Comments for documentation
COMMENT ON TABLE support_groups IS 'Support groups for CMDB CI ownership and management with RBAC permissions';
COMMENT ON TABLE support_group_members IS 'User membership in support groups with roles';
COMMENT ON TABLE support_group_permissions IS 'RBAC permissions assigned to support groups';
COMMENT ON TABLE ci_ownership IS 'Enhanced CI ownership model linking users and support groups to CIs';
COMMENT ON TABLE cmdb_inventory_mapping IS 'Integration mapping between CMDB CIs and Nova Inventory assets';

COMMENT ON COLUMN support_groups.type IS 'Type of support group: technical, business, application, infrastructure';
COMMENT ON COLUMN support_groups.sla_target IS 'Response time target in minutes';
COMMENT ON COLUMN support_group_members.role IS 'Member role: member, lead, manager, backup';
COMMENT ON COLUMN support_group_permissions.resource IS 'Resource type: cmdb, inventory, tickets, knowledge';
COMMENT ON COLUMN support_group_permissions.action IS 'Permission action: read, write, admin, approve';
COMMENT ON COLUMN ci_ownership.ownership_type IS 'Type of ownership: technical, business, application, data';
COMMENT ON COLUMN cmdb_inventory_mapping.mapping_type IS 'Mapping relationship: direct, related, component';
COMMENT ON COLUMN cmdb_inventory_mapping.conflict_resolution IS 'Conflict resolution strategy: cmdb_wins, inventory_wins, manual';
