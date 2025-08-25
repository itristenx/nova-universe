-- Enhanced App Switcher Database Schema
-- Production-ready app management with advanced features

-- ==============================================
-- Core Application Management Tables
-- ==============================================

-- App Categories (for organization)
CREATE TABLE IF NOT EXISTS app_categories (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    description TEXT,
    icon VARCHAR(100),
    color VARCHAR(20) DEFAULT '#3B82F6',
    sort_order INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Applications table with enhanced features
CREATE TABLE IF NOT EXISTS applications (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    url TEXT NOT NULL,
    icon_url TEXT,
    category_id INTEGER REFERENCES app_categories(id),
    
    -- App Configuration
    app_type VARCHAR(50) NOT NULL DEFAULT 'external', -- external, saml, oauth, internal
    auth_config JSONB DEFAULT '{}', -- SSO configuration
    launch_config JSONB DEFAULT '{}', -- Launch behavior config
    custom_headers JSONB DEFAULT '{}', -- Custom headers for auth
    
    -- Visual Configuration
    background_color VARCHAR(20) DEFAULT '#FFFFFF',
    text_color VARCHAR(20) DEFAULT '#000000',
    logo_background VARCHAR(20),
    
    -- Visibility and Access
    is_active BOOLEAN DEFAULT true,
    is_featured BOOLEAN DEFAULT false,
    requires_approval BOOLEAN DEFAULT false,
    auto_assign_new_users BOOLEAN DEFAULT false,
    
    -- Metadata
    version VARCHAR(50),
    vendor VARCHAR(255),
    support_url TEXT,
    documentation_url TEXT,
    release_notes TEXT,
    
    -- Analytics
    total_users INTEGER DEFAULT 0,
    active_users_30d INTEGER DEFAULT 0,
    launch_count INTEGER DEFAULT 0,
    
    -- Lifecycle
    status VARCHAR(50) DEFAULT 'active', -- active, deprecated, maintenance, sunset
    deprecation_date TIMESTAMP,
    sunset_date TIMESTAMP,
    replacement_app_id INTEGER REFERENCES applications(id),
    
    -- Admin
    created_by VARCHAR(255) NOT NULL,
    updated_by VARCHAR(255),
    approved_by VARCHAR(255),
    approved_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- User-specific app assignments and permissions
CREATE TABLE IF NOT EXISTS user_app_assignments (
    id SERIAL PRIMARY KEY,
    user_id VARCHAR(255) NOT NULL,
    app_id INTEGER NOT NULL REFERENCES applications(id) ON DELETE CASCADE,
    assignment_type VARCHAR(50) NOT NULL, -- direct, group, department, auto
    assignment_source VARCHAR(255), -- group name, department, etc.
    
    -- Permissions
    can_launch BOOLEAN DEFAULT true,
    can_configure BOOLEAN DEFAULT false,
    can_share BOOLEAN DEFAULT true,
    
    -- Personalization
    is_favorite BOOLEAN DEFAULT false,
    is_pinned BOOLEAN DEFAULT false,
    custom_name VARCHAR(255), -- User's custom name for the app
    sort_order INTEGER DEFAULT 0,
    
    -- Access tracking
    first_access TIMESTAMP,
    last_access TIMESTAMP,
    access_count INTEGER DEFAULT 0,
    
    -- Lifecycle
    granted_by VARCHAR(255) NOT NULL,
    granted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    expires_at TIMESTAMP,
    revoked_at TIMESTAMP,
    revoked_by VARCHAR(255),
    revoked_reason TEXT,
    
    UNIQUE(user_id, app_id)
);

-- App usage analytics and tracking
CREATE TABLE IF NOT EXISTS app_usage_logs (
    id SERIAL PRIMARY KEY,
    user_id VARCHAR(255) NOT NULL,
    app_id INTEGER NOT NULL REFERENCES applications(id) ON DELETE CASCADE,
    
    -- Usage details
    action VARCHAR(50) NOT NULL, -- launch, configure, share, favorite, etc.
    session_id VARCHAR(255),
    ip_address INET,
    user_agent TEXT,
    
    -- Context
    launch_method VARCHAR(50), -- dashboard, search, favorite, recent, etc.
    referrer_url TEXT,
    device_info JSONB,
    location_info JSONB,
    
    -- Performance
    load_time_ms INTEGER,
    success BOOLEAN DEFAULT true,
    error_message TEXT,
    
    -- Timestamp
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    -- Indexes for analytics
    INDEX idx_app_usage_user_app (user_id, app_id),
    INDEX idx_app_usage_app_date (app_id, created_at),
    INDEX idx_app_usage_user_date (user_id, created_at)
);

-- App collections/groups for organization
CREATE TABLE IF NOT EXISTS app_collections (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    type VARCHAR(50) NOT NULL, -- personal, shared, department, system
    owner_user_id VARCHAR(255),
    visibility VARCHAR(50) DEFAULT 'private', -- private, team, department, organization
    
    -- Visual
    icon VARCHAR(100),
    color VARCHAR(20) DEFAULT '#6B7280',
    
    -- Configuration
    is_smart BOOLEAN DEFAULT false, -- Smart collections based on rules
    smart_rules JSONB, -- Rules for smart collections
    sort_order INTEGER DEFAULT 0,
    
    -- Metadata
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Apps within collections
CREATE TABLE IF NOT EXISTS app_collection_items (
    id SERIAL PRIMARY KEY,
    collection_id INTEGER NOT NULL REFERENCES app_collections(id) ON DELETE CASCADE,
    app_id INTEGER NOT NULL REFERENCES applications(id) ON DELETE CASCADE,
    sort_order INTEGER DEFAULT 0,
    added_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    added_by VARCHAR(255) NOT NULL,
    
    UNIQUE(collection_id, app_id)
);

-- App reviews and ratings (for internal app store)
CREATE TABLE IF NOT EXISTS app_reviews (
    id SERIAL PRIMARY KEY,
    app_id INTEGER NOT NULL REFERENCES applications(id) ON DELETE CASCADE,
    user_id VARCHAR(255) NOT NULL,
    rating INTEGER CHECK (rating >= 1 AND rating <= 5),
    review_text TEXT,
    helpful_count INTEGER DEFAULT 0,
    
    -- Moderation
    is_approved BOOLEAN DEFAULT true,
    moderated_by VARCHAR(255),
    moderated_at TIMESTAMP,
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    UNIQUE(app_id, user_id)
);

-- ==============================================
-- SSO and Integration Tables
-- ==============================================

-- SSO Providers configuration
CREATE TABLE IF NOT EXISTS sso_providers (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    provider_type VARCHAR(50) NOT NULL, -- okta, azure_ad, google, saml, oidc
    
    -- Configuration
    config JSONB NOT NULL, -- Provider-specific configuration
    metadata JSONB, -- SAML metadata, OIDC discovery, etc.
    
    -- Status
    is_active BOOLEAN DEFAULT true,
    is_default BOOLEAN DEFAULT false,
    
    -- Metadata
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- App-specific SSO configurations
CREATE TABLE IF NOT EXISTS app_sso_configs (
    id SERIAL PRIMARY KEY,
    app_id INTEGER NOT NULL REFERENCES applications(id) ON DELETE CASCADE,
    sso_provider_id INTEGER REFERENCES sso_providers(id),
    
    -- SSO Configuration
    sso_type VARCHAR(50) NOT NULL, -- saml, oidc, header_based, custom
    config JSONB NOT NULL, -- App-specific SSO settings
    
    -- Mapping
    user_id_attribute VARCHAR(100),
    email_attribute VARCHAR(100),
    name_attribute VARCHAR(100),
    group_attribute VARCHAR(100),
    custom_attributes JSONB,
    
    -- Status
    is_active BOOLEAN DEFAULT true,
    
    -- Testing and Validation
    last_test_at TIMESTAMP,
    last_test_result JSONB,
    test_user_id VARCHAR(255),
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    UNIQUE(app_id, sso_provider_id)
);

-- ==============================================
-- Advanced Features Tables
-- ==============================================

-- App recommendations engine
CREATE TABLE IF NOT EXISTS app_recommendations (
    id SERIAL PRIMARY KEY,
    user_id VARCHAR(255) NOT NULL,
    app_id INTEGER NOT NULL REFERENCES applications(id) ON DELETE CASCADE,
    
    -- Recommendation details
    recommendation_type VARCHAR(50) NOT NULL, -- trending, similar_users, department, ai_suggested
    confidence_score DECIMAL(3,2), -- 0.00 to 1.00
    reason TEXT,
    recommendation_data JSONB,
    
    -- Tracking
    shown_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    clicked_at TIMESTAMP,
    dismissed_at TIMESTAMP,
    installed_at TIMESTAMP,
    
    -- Metadata
    algorithm_version VARCHAR(50),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- App marketplace (for internal apps)
CREATE TABLE IF NOT EXISTS app_marketplace_submissions (
    id SERIAL PRIMARY KEY,
    app_id INTEGER REFERENCES applications(id) ON DELETE CASCADE,
    
    -- Submission details
    submitted_by VARCHAR(255) NOT NULL,
    submission_type VARCHAR(50) NOT NULL, -- new, update, removal
    
    -- Review process
    status VARCHAR(50) DEFAULT 'pending', -- pending, approved, rejected, needs_changes
    reviewer_id VARCHAR(255),
    review_notes TEXT,
    reviewed_at TIMESTAMP,
    
    -- Deployment
    deployed_at TIMESTAMP,
    deployment_notes TEXT,
    rollback_version VARCHAR(50),
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- User dashboard configurations
CREATE TABLE IF NOT EXISTS user_dashboard_configs (
    id SERIAL PRIMARY KEY,
    user_id VARCHAR(255) NOT NULL UNIQUE,
    
    -- Layout preferences
    layout_type VARCHAR(50) DEFAULT 'grid', -- grid, list, compact, tiles
    apps_per_row INTEGER DEFAULT 6,
    show_app_names BOOLEAN DEFAULT true,
    show_descriptions BOOLEAN DEFAULT false,
    show_categories BOOLEAN DEFAULT true,
    
    -- Behavior preferences
    default_view VARCHAR(50) DEFAULT 'all', -- all, favorites, recent, categories
    auto_launch_behavior VARCHAR(50) DEFAULT 'same_tab', -- same_tab, new_tab, new_window
    show_usage_stats BOOLEAN DEFAULT true,
    enable_recommendations BOOLEAN DEFAULT true,
    
    -- Personalization
    theme VARCHAR(50) DEFAULT 'auto', -- light, dark, auto
    primary_color VARCHAR(20),
    custom_css TEXT,
    
    -- Privacy
    track_usage BOOLEAN DEFAULT true,
    share_usage_analytics BOOLEAN DEFAULT true,
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ==============================================
-- Indexes for Performance
-- ==============================================

-- Applications indexes
CREATE INDEX idx_applications_category ON applications(category_id);
CREATE INDEX idx_applications_status ON applications(status);
CREATE INDEX idx_applications_active ON applications(is_active);
CREATE INDEX idx_applications_type ON applications(app_type);

-- User assignments indexes
CREATE INDEX idx_user_assignments_user ON user_app_assignments(user_id);
CREATE INDEX idx_user_assignments_app ON user_app_assignments(app_id);
CREATE INDEX idx_user_assignments_active ON user_app_assignments(user_id) WHERE revoked_at IS NULL;

-- Usage logs indexes (optimized for analytics)
CREATE INDEX idx_usage_logs_user_recent ON app_usage_logs(user_id, created_at DESC);
CREATE INDEX idx_usage_logs_app_recent ON app_usage_logs(app_id, created_at DESC);
CREATE INDEX idx_usage_logs_action ON app_usage_logs(action);

-- ==============================================
-- Initial Data
-- ==============================================

-- Default categories
INSERT INTO app_categories (name, description, icon, color, sort_order) VALUES
('Productivity', 'Office applications and productivity tools', 'briefcase', '#3B82F6', 1),
('Communication', 'Messaging, email, and collaboration tools', 'chat-bubble-left-right', '#10B981', 2),
('Development', 'Developer tools and code repositories', 'code-bracket', '#8B5CF6', 3),
('Analytics', 'Business intelligence and reporting tools', 'chart-bar', '#F59E0B', 4),
('Security', 'Security and compliance applications', 'shield-check', '#EF4444', 5),
('HR & Finance', 'Human resources and financial systems', 'banknotes', '#06B6D4', 6),
('Custom', 'Organization-specific applications', 'cog-6-tooth', '#6B7280', 7),
('Legacy', 'Legacy applications being phased out', 'archive-box', '#9CA3AF', 99)
ON CONFLICT (name) DO NOTHING;

-- System collections
INSERT INTO app_collections (name, description, type, visibility, is_smart, smart_rules) VALUES
('Favorites', 'Your favorite applications', 'system', 'private', true, '{"type": "favorites"}'),
('Recent', 'Recently used applications', 'system', 'private', true, '{"type": "recent", "days": 30}'),
('Recommended', 'Recommended applications for you', 'system', 'private', true, '{"type": "recommendations"}'),
('Popular', 'Most popular applications in your organization', 'system', 'organization', true, '{"type": "popular", "period": "30d"}')
ON CONFLICT (name) DO NOTHING;

-- Default SSO provider (placeholder for Okta)
INSERT INTO sso_providers (name, provider_type, config, is_default) VALUES
('Okta', 'okta', '{"domain": "", "client_id": "", "client_secret": "", "issuer": ""}', true)
ON CONFLICT (name) DO NOTHING;

-- ==============================================
-- Views for Common Queries
-- ==============================================

-- User's active apps with usage stats
CREATE OR REPLACE VIEW user_active_apps AS
SELECT 
    uaa.user_id,
    uaa.app_id,
    a.name,
    a.description,
    a.url,
    a.icon_url,
    a.background_color,
    ac.name as category_name,
    ac.color as category_color,
    uaa.is_favorite,
    uaa.is_pinned,
    uaa.custom_name,
    uaa.sort_order,
    uaa.last_access,
    uaa.access_count,
    COALESCE(recent_usage.last_30d_count, 0) as usage_30d
FROM user_app_assignments uaa
JOIN applications a ON uaa.app_id = a.id
LEFT JOIN app_categories ac ON a.category_id = ac.id
LEFT JOIN (
    SELECT 
        user_id, 
        app_id, 
        COUNT(*) as last_30d_count
    FROM app_usage_logs 
    WHERE created_at >= CURRENT_TIMESTAMP - INTERVAL '30 days'
        AND action = 'launch'
    GROUP BY user_id, app_id
) recent_usage ON uaa.user_id = recent_usage.user_id AND uaa.app_id = recent_usage.app_id
WHERE uaa.revoked_at IS NULL
    AND a.is_active = true
    AND (uaa.expires_at IS NULL OR uaa.expires_at > CURRENT_TIMESTAMP);

-- App analytics summary
CREATE OR REPLACE VIEW app_analytics_summary AS
SELECT 
    a.id,
    a.name,
    COUNT(DISTINCT uaa.user_id) as total_assigned_users,
    COUNT(DISTINCT CASE WHEN recent_usage.user_id IS NOT NULL THEN recent_usage.user_id END) as active_users_30d,
    COALESCE(SUM(recent_usage.launch_count), 0) as total_launches_30d,
    COALESCE(AVG(ar.rating), 0) as average_rating,
    COUNT(ar.id) as review_count
FROM applications a
LEFT JOIN user_app_assignments uaa ON a.id = uaa.app_id AND uaa.revoked_at IS NULL
LEFT JOIN (
    SELECT 
        user_id, 
        app_id, 
        COUNT(*) as launch_count
    FROM app_usage_logs 
    WHERE created_at >= CURRENT_TIMESTAMP - INTERVAL '30 days'
        AND action = 'launch'
    GROUP BY user_id, app_id
) recent_usage ON a.id = recent_usage.app_id
LEFT JOIN app_reviews ar ON a.id = ar.app_id AND ar.is_approved = true
WHERE a.is_active = true
GROUP BY a.id, a.name;

-- ==============================================
-- Functions for Common Operations
-- ==============================================

-- Function to assign app to user
CREATE OR REPLACE FUNCTION assign_app_to_user(
    p_user_id VARCHAR(255),
    p_app_id INTEGER,
    p_assignment_type VARCHAR(50),
    p_assignment_source VARCHAR(255),
    p_granted_by VARCHAR(255)
) RETURNS BOOLEAN AS $$
BEGIN
    INSERT INTO user_app_assignments (
        user_id, app_id, assignment_type, assignment_source, granted_by
    ) VALUES (
        p_user_id, p_app_id, p_assignment_type, p_assignment_source, p_granted_by
    ) ON CONFLICT (user_id, app_id) DO UPDATE SET
        revoked_at = NULL,
        revoked_by = NULL,
        revoked_reason = NULL,
        assignment_type = EXCLUDED.assignment_type,
        assignment_source = EXCLUDED.assignment_source,
        granted_by = EXCLUDED.granted_by,
        granted_at = CURRENT_TIMESTAMP;
    
    RETURN true;
EXCEPTION WHEN OTHERS THEN
    RETURN false;
END;
$$ LANGUAGE plpgsql;

-- Function to log app usage
CREATE OR REPLACE FUNCTION log_app_usage(
    p_user_id VARCHAR(255),
    p_app_id INTEGER,
    p_action VARCHAR(50),
    p_session_id VARCHAR(255) DEFAULT NULL,
    p_ip_address INET DEFAULT NULL,
    p_user_agent TEXT DEFAULT NULL,
    p_context JSONB DEFAULT '{}'
) RETURNS BOOLEAN AS $$
BEGIN
    INSERT INTO app_usage_logs (
        user_id, app_id, action, session_id, ip_address, user_agent,
        launch_method, device_info, location_info
    ) VALUES (
        p_user_id, p_app_id, p_action, p_session_id, p_ip_address, p_user_agent,
        p_context->>'launch_method',
        p_context->'device_info',
        p_context->'location_info'
    );
    
    -- Update user assignment access tracking
    UPDATE user_app_assignments SET
        last_access = CURRENT_TIMESTAMP,
        access_count = access_count + 1,
        first_access = COALESCE(first_access, CURRENT_TIMESTAMP)
    WHERE user_id = p_user_id AND app_id = p_app_id;
    
    RETURN true;
EXCEPTION WHEN OTHERS THEN
    RETURN false;
END;
$$ LANGUAGE plpgsql;

COMMENT ON TABLE applications IS 'Core applications registry with enhanced features for enterprise app management';
COMMENT ON TABLE user_app_assignments IS 'User-specific app assignments with personalization and access control';
COMMENT ON TABLE app_usage_logs IS 'Comprehensive usage analytics and audit trail';
COMMENT ON TABLE app_categories IS 'Hierarchical categorization for app organization';
COMMENT ON TABLE app_collections IS 'User-defined and smart collections for app grouping';
COMMENT ON TABLE sso_providers IS 'SSO provider configurations for seamless authentication';
COMMENT ON TABLE app_sso_configs IS 'App-specific SSO integration settings';
