-- Service Catalog Enhanced Database Schema
-- This script adds comprehensive support for all service catalog features

-- Service Catalog Categories
CREATE TABLE IF NOT EXISTS service_catalog_categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    icon VARCHAR(100),
    order_index INTEGER DEFAULT 0,
    status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'draft')),
    item_count INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Service Catalog Items (Enhanced)
CREATE TABLE IF NOT EXISTS service_catalog_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    short_description TEXT,
    description TEXT,
    category_id UUID REFERENCES service_catalog_categories(id),
    subcategory_id UUID,
    status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'draft')),
    
    -- Pricing Information
    price DECIMAL(10,2) DEFAULT 0,
    recurring_price DECIMAL(10,2),
    currency VARCHAR(3) DEFAULT 'USD',
    pricing_model VARCHAR(20) DEFAULT 'fixed' CHECK (pricing_model IN ('fixed', 'calculated', 'variable', 'tiered')),
    cost_center VARCHAR(100),
    
    -- Cost Tracking
    base_cost DECIMAL(10,2) DEFAULT 0,
    vendor_cost DECIMAL(10,2),
    internal_cost DECIMAL(10,2),
    markup_percentage DECIMAL(5,2),
    profit_margin DECIMAL(5,2),
    
    -- Departmental Billing
    billing_type VARCHAR(20) DEFAULT 'one_time' CHECK (billing_type IN ('one_time', 'recurring', 'usage_based', 'license_based')),
    license_type VARCHAR(20) CHECK (license_type IN ('per_user', 'per_device', 'site_license', 'concurrent')),
    license_cost_per_unit DECIMAL(10,2),
    minimum_licenses INTEGER,
    
    -- Workflow & Fulfillment
    workflow_id UUID,
    fulfillment_group VARCHAR(100),
    approval_required BOOLEAN DEFAULT false,
    auto_approval_threshold DECIMAL(10,2),
    sla_hours INTEGER,
    
    -- Variables & Configuration
    variables JSONB DEFAULT '[]',
    form_layout JSONB,
    
    -- Visibility & Access
    available_for TEXT[] DEFAULT ARRAY['*'],
    departments TEXT[] DEFAULT ARRAY['*'],
    locations TEXT[] DEFAULT ARRAY['*'],
    
    -- Content & Media
    tags TEXT[] DEFAULT ARRAY[]::TEXT[],
    order_count INTEGER DEFAULT 0,
    
    -- Audit Fields
    created_by VARCHAR(255),
    updated_by VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    version INTEGER DEFAULT 1
);

-- Service Catalog Requests (Enhanced)
CREATE TABLE IF NOT EXISTS service_catalog_requests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    number VARCHAR(50) UNIQUE,
    item_id UUID REFERENCES service_catalog_items(id),
    requested_by VARCHAR(255) NOT NULL,
    state VARCHAR(20) DEFAULT 'draft' CHECK (state IN ('draft', 'submitted', 'pending_approval', 'approved', 'rejected', 'cancelled', 'ordered', 'fulfilling', 'delivered', 'closed')),
    priority VARCHAR(20) DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'critical')),
    
    -- Request Details
    variables JSONB DEFAULT '{}',
    quantity INTEGER DEFAULT 1,
    total_cost DECIMAL(10,2) DEFAULT 0,
    recurring_cost DECIMAL(10,2),
    
    -- Approval & Workflow
    approval_flow_id UUID,
    current_step INTEGER DEFAULT 0,
    approved_by VARCHAR(255),
    approved_at TIMESTAMP,
    rejection_reason TEXT,
    
    -- Fulfillment
    assigned_to VARCHAR(255),
    due_date TIMESTAMP,
    delivered_at TIMESTAMP,
    
    -- Audit Fields
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Department Cost Centers
CREATE TABLE IF NOT EXISTS department_cost_centers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    department_name VARCHAR(255) NOT NULL,
    cost_center_code VARCHAR(50) UNIQUE NOT NULL,
    budget_holder VARCHAR(255),
    monthly_budget DECIMAL(12,2) DEFAULT 0,
    annual_budget DECIMAL(12,2) DEFAULT 0,
    currency VARCHAR(3) DEFAULT 'USD',
    
    -- Configuration
    allocation_rules JSONB DEFAULT '[]',
    license_allocations JSONB DEFAULT '[]',
    
    -- Billing
    billing_contact VARCHAR(255),
    billing_email VARCHAR(255),
    billing_frequency VARCHAR(20) DEFAULT 'monthly' CHECK (billing_frequency IN ('monthly', 'quarterly', 'annually')),
    charge_back_enabled BOOLEAN DEFAULT true,
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- RBAC - Enhanced Users Table
ALTER TABLE users ADD COLUMN IF NOT EXISTS first_name VARCHAR(100);
ALTER TABLE users ADD COLUMN IF NOT EXISTS last_name VARCHAR(100);
ALTER TABLE users ADD COLUMN IF NOT EXISTS email VARCHAR(255);
ALTER TABLE users ADD COLUMN IF NOT EXISTS department VARCHAR(100);
ALTER TABLE users ADD COLUMN IF NOT EXISTS manager_id UUID;
ALTER TABLE users ADD COLUMN IF NOT EXISTS active BOOLEAN DEFAULT true;
ALTER TABLE users ADD COLUMN IF NOT EXISTS last_login TIMESTAMP;
ALTER TABLE users ADD COLUMN IF NOT EXISTS locked_out BOOLEAN DEFAULT false;
ALTER TABLE users ADD COLUMN IF NOT EXISTS failed_login_attempts INTEGER DEFAULT 0;
ALTER TABLE users ADD COLUMN IF NOT EXISTS uuid UUID DEFAULT gen_random_uuid();

-- RBAC - Roles Table
CREATE TABLE IF NOT EXISTS rbac_roles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) UNIQUE NOT NULL,
    description TEXT,
    permissions TEXT[] DEFAULT ARRAY[]::TEXT[],
    system_role BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- RBAC - Permissions Table
CREATE TABLE IF NOT EXISTS rbac_permissions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) UNIQUE NOT NULL,
    description TEXT,
    resource VARCHAR(100),
    action VARCHAR(50),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- RBAC - Groups Table
CREATE TABLE IF NOT EXISTS rbac_groups (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) UNIQUE NOT NULL,
    description TEXT,
    members UUID[] DEFAULT ARRAY[]::UUID[],
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- RBAC - User Roles Junction
CREATE TABLE IF NOT EXISTS user_roles (
    user_id UUID,
    role_id UUID REFERENCES rbac_roles(id) ON DELETE CASCADE,
    assigned_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    assigned_by UUID,
    PRIMARY KEY (user_id, role_id)
);

-- RBAC - User Groups Junction
CREATE TABLE IF NOT EXISTS user_groups (
    user_id UUID,
    group_id UUID REFERENCES rbac_groups(id) ON DELETE CASCADE,
    joined_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (user_id, group_id)
);

-- Approval Workflows
CREATE TABLE IF NOT EXISTS approval_workflows (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    trigger_conditions JSONB DEFAULT '{}',
    steps JSONB DEFAULT '[]',
    version INTEGER DEFAULT 1,
    active BOOLEAN DEFAULT true,
    created_by VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Approval Instances
CREATE TABLE IF NOT EXISTS approval_instances (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    workflow_id UUID REFERENCES approval_workflows(id),
    request_id UUID REFERENCES service_catalog_requests(id),
    current_step INTEGER DEFAULT 0,
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'cancelled')),
    steps_completed JSONB DEFAULT '[]',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Feature Flags
CREATE TABLE IF NOT EXISTS feature_flags (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) UNIQUE NOT NULL,
    description TEXT,
    enabled BOOLEAN DEFAULT false,
    rollout_percentage INTEGER DEFAULT 0 CHECK (rollout_percentage >= 0 AND rollout_percentage <= 100),
    target_users TEXT[] DEFAULT ARRAY[]::TEXT[],
    target_groups TEXT[] DEFAULT ARRAY[]::TEXT[],
    conditions JSONB DEFAULT '{}',
    created_by VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- A/B Testing Experiments
CREATE TABLE IF NOT EXISTS ab_experiments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    status VARCHAR(20) DEFAULT 'draft' CHECK (status IN ('draft', 'running', 'paused', 'completed', 'archived')),
    feature_flag_id UUID REFERENCES feature_flags(id),
    
    -- Experiment Configuration
    traffic_split JSONB DEFAULT '{}', -- {"control": 50, "variant_a": 50}
    start_date TIMESTAMP,
    end_date TIMESTAMP,
    success_metrics JSONB DEFAULT '[]',
    
    -- Results
    participants_count INTEGER DEFAULT 0,
    conversions JSONB DEFAULT '{}',
    statistical_significance DECIMAL(5,2),
    confidence_level DECIMAL(5,2),
    
    created_by VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ML Insights and Models
CREATE TABLE IF NOT EXISTS ml_models (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    type VARCHAR(50) NOT NULL, -- 'recommendation', 'anomaly_detection', 'cost_optimization'
    status VARCHAR(20) DEFAULT 'training' CHECK (status IN ('training', 'active', 'deprecated', 'failed')),
    version VARCHAR(20),
    accuracy DECIMAL(5,4),
    configuration JSONB DEFAULT '{}',
    last_trained_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ML Insights
CREATE TABLE IF NOT EXISTS ml_insights (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    model_id UUID REFERENCES ml_models(id),
    type VARCHAR(50) NOT NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    confidence DECIMAL(5,4),
    impact_score DECIMAL(5,2),
    recommendations JSONB DEFAULT '[]',
    data JSONB DEFAULT '{}',
    status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'dismissed', 'implemented')),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Security Events
CREATE TABLE IF NOT EXISTS security_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    event_type VARCHAR(100) NOT NULL,
    severity VARCHAR(20) DEFAULT 'medium' CHECK (severity IN ('low', 'medium', 'high', 'critical')),
    source VARCHAR(100),
    user_id UUID,
    ip_address INET,
    user_agent TEXT,
    
    -- Event Details
    description TEXT,
    details JSONB DEFAULT '{}',
    raw_data JSONB,
    
    -- Detection & Response
    detected_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    investigated_by UUID,
    status VARCHAR(20) DEFAULT 'open' CHECK (status IN ('open', 'investigating', 'resolved', 'false_positive')),
    resolution_notes TEXT,
    resolved_at TIMESTAMP,
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Security Alerts
CREATE TABLE IF NOT EXISTS security_alerts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    rule_name VARCHAR(255) NOT NULL,
    severity VARCHAR(20) DEFAULT 'medium' CHECK (severity IN ('low', 'medium', 'high', 'critical')),
    message TEXT NOT NULL,
    event_ids UUID[] DEFAULT ARRAY[]::UUID[],
    
    -- Alert Management
    status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'acknowledged', 'resolved', 'suppressed')),
    acknowledged_by UUID,
    acknowledged_at TIMESTAMP,
    resolved_by UUID,
    resolved_at TIMESTAMP,
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Audit Logs (Enhanced)
ALTER TABLE audit_logs ADD COLUMN IF NOT EXISTS resource_type VARCHAR(100);
ALTER TABLE audit_logs ADD COLUMN IF NOT EXISTS resource_id UUID;
ALTER TABLE audit_logs ADD COLUMN IF NOT EXISTS before_value JSONB;
ALTER TABLE audit_logs ADD COLUMN IF NOT EXISTS after_value JSONB;
ALTER TABLE audit_logs ADD COLUMN IF NOT EXISTS ip_address INET;
ALTER TABLE audit_logs ADD COLUMN IF NOT EXISTS user_agent TEXT;

-- Indexes for Performance
CREATE INDEX IF NOT EXISTS idx_service_catalog_items_category ON service_catalog_items(category_id);
CREATE INDEX IF NOT EXISTS idx_service_catalog_items_status ON service_catalog_items(status);
CREATE INDEX IF NOT EXISTS idx_service_catalog_requests_state ON service_catalog_requests(state);
CREATE INDEX IF NOT EXISTS idx_service_catalog_requests_requested_by ON service_catalog_requests(requested_by);
CREATE INDEX IF NOT EXISTS idx_security_events_type ON security_events(event_type);
CREATE INDEX IF NOT EXISTS idx_security_events_severity ON security_events(severity);
CREATE INDEX IF NOT EXISTS idx_security_events_detected_at ON security_events(detected_at);
CREATE INDEX IF NOT EXISTS idx_ml_insights_type ON ml_insights(type);
CREATE INDEX IF NOT EXISTS idx_ml_insights_status ON ml_insights(status);
CREATE INDEX IF NOT EXISTS idx_feature_flags_name ON feature_flags(name);
CREATE INDEX IF NOT EXISTS idx_ab_experiments_status ON ab_experiments(status);

-- Insert Standard Roles
INSERT INTO rbac_roles (name, description, permissions, system_role) VALUES
('admin', 'System Administrator', ARRAY['admin:*', 'catalog:*', 'security:*', 'ml:*', 'workflow:*', 'testing:*', 'features:*', 'approvals:*'], true),
('catalog_admin', 'Catalog Administrator', ARRAY['catalog:*', 'approvals:read', 'approvals:write'], true),
('catalog_user', 'Catalog User', ARRAY['catalog:read', 'catalog:request', 'requests:read'], true),
('approver', 'Request Approver', ARRAY['catalog:read', 'approvals:read', 'approvals:approve', 'requests:read'], true),
('security_analyst', 'Security Analyst', ARRAY['security:*', 'audit:read'], true),
('ml_analyst', 'ML Analyst', ARRAY['ml:*', 'analytics:read'], true)
ON CONFLICT (name) DO NOTHING;

-- Insert Standard Permissions
INSERT INTO rbac_permissions (name, description, resource, action) VALUES
('admin:read', 'Read admin data', 'admin', 'read'),
('admin:write', 'Write admin data', 'admin', 'write'),
('catalog:read', 'Read catalog items', 'catalog', 'read'),
('catalog:write', 'Write catalog items', 'catalog', 'write'),
('catalog:request', 'Create requests', 'catalog', 'request'),
('requests:read', 'Read requests', 'requests', 'read'),
('requests:write', 'Write requests', 'requests', 'write'),
('approvals:read', 'Read approvals', 'approvals', 'read'),
('approvals:write', 'Write approvals', 'approvals', 'write'),
('approvals:approve', 'Approve requests', 'approvals', 'approve'),
('security:read', 'Read security data', 'security', 'read'),
('security:write', 'Write security data', 'security', 'write'),
('ml:read', 'Read ML insights', 'ml', 'read'),
('ml:write', 'Write ML insights', 'ml', 'write'),
('workflow:read', 'Read workflows', 'workflow', 'read'),
('workflow:write', 'Write workflows', 'workflow', 'write'),
('testing:read', 'Read A/B tests', 'testing', 'read'),
('testing:write', 'Write A/B tests', 'testing', 'write'),
('features:read', 'Read feature flags', 'features', 'read'),
('features:write', 'Write feature flags', 'features', 'write'),
('analytics:read', 'Read analytics', 'analytics', 'read')
ON CONFLICT (name) DO NOTHING;

-- Insert Sample Data for Testing
INSERT INTO service_catalog_categories (name, description, icon, order_index) VALUES
('Software & Licenses', 'Software applications, licenses, and digital tools', 'package', 1),
('Hardware & Equipment', 'Computers, devices, and physical equipment', 'monitor', 2),
('Services & Consulting', 'Professional services and consulting', 'users', 3)
ON CONFLICT DO NOTHING;

-- Create admin user if not exists
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM users WHERE username = 'admin') THEN
        INSERT INTO users (username, email, first_name, last_name, role, active, uuid)
        VALUES ('admin', 'admin@nova-universe.com', 'System', 'Administrator', 'admin', true, gen_random_uuid());
    END IF;
END $$;
