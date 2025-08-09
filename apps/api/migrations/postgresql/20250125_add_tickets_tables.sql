-- Nova Universe Ticketing System Tables
-- Created: 2025-01-25
-- Core tables for ITSM ticketing functionality

-- Ticket categories
CREATE TABLE IF NOT EXISTS ticket_categories (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    description TEXT,
    parent_id INTEGER REFERENCES ticket_categories(id),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Core tickets table
CREATE TABLE IF NOT EXISTS tickets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    ticket_id VARCHAR(50) UNIQUE NOT NULL, -- Human-readable ID like TKT-12345
    title VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    status VARCHAR(50) DEFAULT 'open' CHECK (status IN ('open', 'in_progress', 'resolved', 'closed', 'cancelled')),
    priority VARCHAR(20) DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'critical')),
    category VARCHAR(100),
    subcategory VARCHAR(100),
    location VARCHAR(255),
    
    -- User relationships
    requested_by_id TEXT REFERENCES users(id),
    assigned_to_id TEXT REFERENCES users(id),
    
    -- Contact information
    contact_method VARCHAR(50) CHECK (contact_method IN ('email', 'phone', 'in_person', 'portal')),
    contact_info VARCHAR(255),
    
    -- VIP and priority handling
    is_vip BOOLEAN DEFAULT false,
    vip_level VARCHAR(20),
    vip_priority_score INTEGER DEFAULT 0,
    
    -- Timing and SLA
    due_date TIMESTAMP WITH TIME ZONE,
    resolved_at TIMESTAMP WITH TIME ZONE,
    first_response_at TIMESTAMP WITH TIME ZONE,
    last_activity_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    
    -- Resolution information
    resolution TEXT,
    resolution_time_minutes INTEGER,
    
    -- Metadata
    metadata JSONB,
    tags TEXT[],
    
    -- Audit fields
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP WITH TIME ZONE NULL
);

-- Ticket comments/updates
CREATE TABLE IF NOT EXISTS ticket_comments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    ticket_id UUID NOT NULL REFERENCES tickets(id) ON DELETE CASCADE,
    user_id TEXT REFERENCES users(id),
    comment TEXT NOT NULL,
    comment_type VARCHAR(50) DEFAULT 'comment' CHECK (comment_type IN ('comment', 'status_change', 'assignment', 'resolution', 'escalation')),
    is_internal BOOLEAN DEFAULT false,
    
    -- File attachments
    attachments JSONB,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Ticket attachments
CREATE TABLE IF NOT EXISTS ticket_attachments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    ticket_id UUID NOT NULL REFERENCES tickets(id) ON DELETE CASCADE,
    comment_id UUID REFERENCES ticket_comments(id) ON DELETE CASCADE,
    filename VARCHAR(255) NOT NULL,
    original_filename VARCHAR(255) NOT NULL,
    file_path TEXT NOT NULL,
    file_size INTEGER,
    mime_type VARCHAR(100),
    uploaded_by TEXT REFERENCES users(id),
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Ticket history/audit trail
CREATE TABLE IF NOT EXISTS ticket_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    ticket_id UUID NOT NULL REFERENCES tickets(id) ON DELETE CASCADE,
    user_id TEXT REFERENCES users(id),
    action VARCHAR(100) NOT NULL,
    field_name VARCHAR(100),
    old_value TEXT,
    new_value TEXT,
    description TEXT,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- AI analysis results
CREATE TABLE IF NOT EXISTS ai_analyses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    ticket_id VARCHAR(50) NOT NULL, -- References ticket_id field
    analysis_type VARCHAR(100) NOT NULL,
    results JSONB NOT NULL,
    confidence DECIMAL(3,2),
    model_version VARCHAR(50),
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Knowledge base articles (for Nova Lore integration)
CREATE TABLE IF NOT EXISTS knowledge_articles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title VARCHAR(255) NOT NULL,
    content TEXT NOT NULL,
    summary TEXT,
    category VARCHAR(100),
    tags TEXT[],
    is_published BOOLEAN DEFAULT false,
    view_count INTEGER DEFAULT 0,
    helpful_count INTEGER DEFAULT 0,
    not_helpful_count INTEGER DEFAULT 0,
    
    created_by TEXT REFERENCES users(id),
    updated_by TEXT REFERENCES users(id),
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP WITH TIME ZONE NULL
);

-- Asset inventory (basic structure for inventory management)
CREATE TABLE IF NOT EXISTS inventory_assets (
    id SERIAL PRIMARY KEY,
    asset_tag VARCHAR(100) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    asset_type VARCHAR(100),
    model VARCHAR(100),
    serial_number VARCHAR(100),
    location VARCHAR(255),
    status VARCHAR(50) DEFAULT 'active' CHECK (status IN ('active', 'maintenance', 'retired', 'lost')),
    assigned_to TEXT REFERENCES users(id),
    purchase_date DATE,
    warranty_expiry DATE,
    metadata JSONB,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP WITH TIME ZONE NULL
);

-- Asset-ticket relationships
CREATE TABLE IF NOT EXISTS asset_ticket_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    asset_id INTEGER NOT NULL REFERENCES inventory_assets(id),
    ticket_id UUID NOT NULL REFERENCES tickets(id),
    relationship_type VARCHAR(50) NOT NULL CHECK (relationship_type IN ('assigned_to', 'related_to', 'repair_for', 'replacement_for')),
    created_by TEXT REFERENCES users(id),
    notes TEXT,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_tickets_ticket_id ON tickets(ticket_id);
CREATE INDEX IF NOT EXISTS idx_tickets_status ON tickets(status);
CREATE INDEX IF NOT EXISTS idx_tickets_priority ON tickets(priority);
CREATE INDEX IF NOT EXISTS idx_tickets_assigned_to ON tickets(assigned_to_id);
CREATE INDEX IF NOT EXISTS idx_tickets_requested_by ON tickets(requested_by_id);
CREATE INDEX IF NOT EXISTS idx_tickets_category ON tickets(category);
CREATE INDEX IF NOT EXISTS idx_tickets_due_date ON tickets(due_date);
CREATE INDEX IF NOT EXISTS idx_tickets_created_at ON tickets(created_at);
CREATE INDEX IF NOT EXISTS idx_tickets_vip ON tickets(is_vip, vip_priority_score);
CREATE INDEX IF NOT EXISTS idx_tickets_deleted ON tickets(deleted_at);

CREATE INDEX IF NOT EXISTS idx_ticket_comments_ticket ON ticket_comments(ticket_id);
CREATE INDEX IF NOT EXISTS idx_ticket_comments_user ON ticket_comments(user_id);
CREATE INDEX IF NOT EXISTS idx_ticket_comments_type ON ticket_comments(comment_type);

CREATE INDEX IF NOT EXISTS idx_ticket_attachments_ticket ON ticket_attachments(ticket_id);
CREATE INDEX IF NOT EXISTS idx_ticket_attachments_comment ON ticket_attachments(comment_id);

CREATE INDEX IF NOT EXISTS idx_ticket_history_ticket ON ticket_history(ticket_id);
CREATE INDEX IF NOT EXISTS idx_ticket_history_user ON ticket_history(user_id);
CREATE INDEX IF NOT EXISTS idx_ticket_history_action ON ticket_history(action);

CREATE INDEX IF NOT EXISTS idx_ai_analyses_ticket ON ai_analyses(ticket_id);
CREATE INDEX IF NOT EXISTS idx_ai_analyses_type ON ai_analyses(analysis_type);

CREATE INDEX IF NOT EXISTS idx_knowledge_articles_category ON knowledge_articles(category);
CREATE INDEX IF NOT EXISTS idx_knowledge_articles_published ON knowledge_articles(is_published);
CREATE INDEX IF NOT EXISTS idx_knowledge_articles_tags ON knowledge_articles USING GIN(tags);

CREATE INDEX IF NOT EXISTS idx_inventory_assets_tag ON inventory_assets(asset_tag);
CREATE INDEX IF NOT EXISTS idx_inventory_assets_type ON inventory_assets(asset_type);
CREATE INDEX IF NOT EXISTS idx_inventory_assets_location ON inventory_assets(location);
CREATE INDEX IF NOT EXISTS idx_inventory_assets_status ON inventory_assets(status);
CREATE INDEX IF NOT EXISTS idx_inventory_assets_assigned ON inventory_assets(assigned_to);

CREATE INDEX IF NOT EXISTS idx_asset_ticket_history_asset ON asset_ticket_history(asset_id);
CREATE INDEX IF NOT EXISTS idx_asset_ticket_history_ticket ON asset_ticket_history(ticket_id);

-- Updated at triggers
CREATE TRIGGER update_tickets_updated_at 
    BEFORE UPDATE ON tickets 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_ticket_categories_updated_at 
    BEFORE UPDATE ON ticket_categories 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_ticket_comments_updated_at 
    BEFORE UPDATE ON ticket_comments 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_knowledge_articles_updated_at 
    BEFORE UPDATE ON knowledge_articles 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_inventory_assets_updated_at 
    BEFORE UPDATE ON inventory_assets 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Insert default ticket categories
INSERT INTO ticket_categories (name, description) VALUES
('Hardware', 'Hardware-related issues and requests'),
('Software', 'Software applications and system issues'),
('Network', 'Network connectivity and infrastructure'),
('Security', 'Security incidents and access requests'),
('Account', 'User account and access management'),
('General', 'General IT support requests')
ON CONFLICT (name) DO NOTHING;