-- ITSM Ticket Management - Complete Production Schema
-- Phase 1: Missing database tables and schema completion

-- ====================
-- SLA MANAGEMENT TABLES
-- ====================

-- SLA Breach Tracking
CREATE TABLE IF NOT EXISTS sla_breaches (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    ticket_id UUID NOT NULL REFERENCES enhanced_support_tickets(id) ON DELETE CASCADE,
    sla_id UUID NOT NULL REFERENCES sla_definitions(id),
    breach_type VARCHAR(20) NOT NULL CHECK (breach_type IN ('RESPONSE_TIME', 'RESOLUTION_TIME')),
    target_time INTEGER NOT NULL, -- in minutes
    actual_time INTEGER NOT NULL, -- in minutes
    breach_duration INTEGER NOT NULL, -- in minutes (how long overdue)
    breach_detected_at TIMESTAMP WITH TIME ZONE NOT NULL,
    is_resolved BOOLEAN DEFAULT FALSE,
    resolved_at TIMESTAMP WITH TIME ZONE,
    notification_sent BOOLEAN DEFAULT FALSE,
    escalation_triggered BOOLEAN DEFAULT FALSE,
    metadata JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_sla_breaches_ticket ON sla_breaches(ticket_id);
CREATE INDEX idx_sla_breaches_sla ON sla_breaches(sla_id);
CREATE INDEX idx_sla_breaches_type ON sla_breaches(breach_type);
CREATE INDEX idx_sla_breaches_detected ON sla_breaches(breach_detected_at);

-- SLA Policy Rules
CREATE TABLE IF NOT EXISTS sla_policy_rules (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    sla_id UUID NOT NULL REFERENCES sla_definitions(id) ON DELETE CASCADE,
    rule_type VARCHAR(20) NOT NULL CHECK (rule_type IN ('PRIORITY', 'CATEGORY', 'VIP', 'LOCATION', 'TIME')),
    rule_condition JSONB NOT NULL, -- flexible condition storage
    rule_value TEXT NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    priority_order INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ========================
-- TICKET WORKFLOW TABLES
-- ========================

-- Workflow Definitions
CREATE TABLE IF NOT EXISTS workflows (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    trigger_type VARCHAR(50) NOT NULL CHECK (trigger_type IN ('TICKET_CREATED', 'STATUS_CHANGED', 'PRIORITY_CHANGED', 'ASSIGNED', 'ESCALATED', 'MANUAL')),
    trigger_conditions JSONB,
    is_active BOOLEAN DEFAULT TRUE,
    version INTEGER DEFAULT 1,
    created_by UUID REFERENCES users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Workflow Steps
CREATE TABLE IF NOT EXISTS workflow_steps (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    workflow_id UUID NOT NULL REFERENCES workflows(id) ON DELETE CASCADE,
    step_name VARCHAR(255) NOT NULL,
    step_type VARCHAR(50) NOT NULL CHECK (step_type IN ('APPROVAL', 'ASSIGNMENT', 'NOTIFICATION', 'AUTOMATION', 'CONDITION', 'DELAY')),
    step_order INTEGER NOT NULL,
    step_config JSONB NOT NULL,
    timeout_minutes INTEGER,
    is_required BOOLEAN DEFAULT TRUE,
    on_success_action VARCHAR(50) DEFAULT 'CONTINUE',
    on_failure_action VARCHAR(50) DEFAULT 'STOP',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Workflow Instances (Active workflow executions)
CREATE TABLE IF NOT EXISTS workflow_instances (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    workflow_id UUID NOT NULL REFERENCES workflows(id),
    ticket_id UUID NOT NULL REFERENCES enhanced_support_tickets(id) ON DELETE CASCADE,
    current_step_id UUID REFERENCES workflow_steps(id),
    status VARCHAR(20) DEFAULT 'ACTIVE' CHECK (status IN ('ACTIVE', 'COMPLETED', 'FAILED', 'CANCELLED', 'PAUSED')),
    started_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    completed_at TIMESTAMP WITH TIME ZONE,
    context_data JSONB,
    error_message TEXT
);

-- Workflow Step Instances (Individual step executions)
CREATE TABLE IF NOT EXISTS workflow_step_instances (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    workflow_instance_id UUID NOT NULL REFERENCES workflow_instances(id) ON DELETE CASCADE,
    workflow_step_id UUID NOT NULL REFERENCES workflow_steps(id),
    status VARCHAR(20) DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'IN_PROGRESS', 'COMPLETED', 'FAILED', 'SKIPPED', 'TIMEOUT')),
    assigned_to UUID REFERENCES users(id),
    started_at TIMESTAMP WITH TIME ZONE,
    completed_at TIMESTAMP WITH TIME ZONE,
    timeout_at TIMESTAMP WITH TIME ZONE,
    result_data JSONB,
    error_message TEXT
);

-- ============================
-- ATTACHMENT STORAGE TABLES
-- ============================

-- Ticket Attachments
CREATE TABLE IF NOT EXISTS ticket_attachments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    ticket_id UUID NOT NULL REFERENCES enhanced_support_tickets(id) ON DELETE CASCADE,
    comment_id UUID REFERENCES ticket_comments(id) ON DELETE CASCADE,
    uploaded_by UUID NOT NULL REFERENCES users(id),
    file_name VARCHAR(255) NOT NULL,
    original_name VARCHAR(255) NOT NULL,
    file_size BIGINT NOT NULL,
    mime_type VARCHAR(100) NOT NULL,
    storage_path TEXT NOT NULL,
    storage_provider VARCHAR(50) DEFAULT 'local' CHECK (storage_provider IN ('local', 's3', 'azure', 'gcs')),
    virus_scan_status VARCHAR(20) DEFAULT 'pending' CHECK (virus_scan_status IN ('pending', 'clean', 'infected', 'error')),
    is_public BOOLEAN DEFAULT FALSE,
    download_count INTEGER DEFAULT 0,
    metadata JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_ticket_attachments_ticket ON ticket_attachments(ticket_id);
CREATE INDEX idx_ticket_attachments_comment ON ticket_attachments(comment_id);
CREATE INDEX idx_ticket_attachments_uploader ON ticket_attachments(uploaded_by);

-- =======================
-- ENHANCED AUDIT TABLES
-- =======================

-- Comprehensive Ticket History
CREATE TABLE IF NOT EXISTS ticket_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    ticket_id UUID NOT NULL REFERENCES enhanced_support_tickets(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id),
    action_type VARCHAR(50) NOT NULL,
    field_changed VARCHAR(100),
    old_value TEXT,
    new_value TEXT,
    change_reason TEXT,
    ip_address INET,
    user_agent TEXT,
    session_id VARCHAR(255),
    automation_source VARCHAR(100), -- for automated changes
    metadata JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_ticket_history_ticket ON ticket_history(ticket_id);
CREATE INDEX idx_ticket_history_user ON ticket_history(user_id);
CREATE INDEX idx_ticket_history_action ON ticket_history(action_type);
CREATE INDEX idx_ticket_history_created ON ticket_history(created_at);

-- System Audit Trail
CREATE TABLE IF NOT EXISTS system_audit_log (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    event_type VARCHAR(100) NOT NULL,
    entity_type VARCHAR(50) NOT NULL,
    entity_id UUID,
    user_id UUID REFERENCES users(id),
    details JSONB NOT NULL,
    risk_level VARCHAR(20) DEFAULT 'LOW' CHECK (risk_level IN ('LOW', 'MEDIUM', 'HIGH', 'CRITICAL')),
    ip_address INET,
    user_agent TEXT,
    request_id VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_system_audit_event ON system_audit_log(event_type);
CREATE INDEX idx_system_audit_entity ON system_audit_log(entity_type, entity_id);
CREATE INDEX idx_system_audit_user ON system_audit_log(user_id);
CREATE INDEX idx_system_audit_risk ON system_audit_log(risk_level);
CREATE INDEX idx_system_audit_created ON system_audit_log(created_at);

-- ===========================
-- KNOWLEDGE BASE INTEGRATION
-- ===========================

-- Knowledge Articles
CREATE TABLE IF NOT EXISTS knowledge_articles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title VARCHAR(500) NOT NULL,
    content TEXT NOT NULL,
    summary TEXT,
    article_number VARCHAR(50) UNIQUE NOT NULL,
    category VARCHAR(100),
    subcategory VARCHAR(100),
    tags TEXT[],
    status VARCHAR(20) DEFAULT 'DRAFT' CHECK (status IN ('DRAFT', 'PUBLISHED', 'ARCHIVED', 'RETIRED')),
    visibility VARCHAR(20) DEFAULT 'INTERNAL' CHECK (visibility IN ('PUBLIC', 'INTERNAL', 'RESTRICTED')),
    author_id UUID NOT NULL REFERENCES users(id),
    reviewer_id UUID REFERENCES users(id),
    approved_by UUID REFERENCES users(id),
    view_count INTEGER DEFAULT 0,
    helpful_votes INTEGER DEFAULT 0,
    unhelpful_votes INTEGER DEFAULT 0,
    search_keywords TEXT,
    related_products TEXT[],
    difficulty_level VARCHAR(20) DEFAULT 'BEGINNER',
    estimated_read_time INTEGER, -- in minutes
    last_reviewed_at TIMESTAMP WITH TIME ZONE,
    published_at TIMESTAMP WITH TIME ZONE,
    archived_at TIMESTAMP WITH TIME ZONE,
    metadata JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_knowledge_articles_number ON knowledge_articles(article_number);
CREATE INDEX idx_knowledge_articles_category ON knowledge_articles(category, subcategory);
CREATE INDEX idx_knowledge_articles_status ON knowledge_articles(status);
CREATE INDEX idx_knowledge_articles_author ON knowledge_articles(author_id);
CREATE INDEX idx_knowledge_articles_tags ON knowledge_articles USING GIN(tags);
CREATE INDEX idx_knowledge_articles_keywords ON knowledge_articles USING GIN(to_tsvector('english', search_keywords));

-- Knowledge Article Attachments
CREATE TABLE IF NOT EXISTS knowledge_article_attachments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    article_id UUID NOT NULL REFERENCES knowledge_articles(id) ON DELETE CASCADE,
    file_name VARCHAR(255) NOT NULL,
    original_name VARCHAR(255) NOT NULL,
    file_size BIGINT NOT NULL,
    mime_type VARCHAR(100) NOT NULL,
    storage_path TEXT NOT NULL,
    is_inline BOOLEAN DEFAULT FALSE,
    alt_text TEXT,
    uploaded_by UUID NOT NULL REFERENCES users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Ticket-Knowledge Article Links
CREATE TABLE IF NOT EXISTS ticket_knowledge_links (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    ticket_id UUID NOT NULL REFERENCES enhanced_support_tickets(id) ON DELETE CASCADE,
    article_id UUID NOT NULL REFERENCES knowledge_articles(id) ON DELETE CASCADE,
    link_type VARCHAR(20) DEFAULT 'SUGGESTED' CHECK (link_type IN ('SUGGESTED', 'REFERENCED', 'RESOLVED_BY')),
    suggested_by VARCHAR(20) DEFAULT 'MANUAL' CHECK (suggested_by IN ('MANUAL', 'AI', 'WORKFLOW')),
    relevance_score DECIMAL(3,2), -- 0.00 to 1.00
    was_helpful BOOLEAN,
    created_by UUID REFERENCES users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(ticket_id, article_id)
);

-- =========================
-- TICKET TEMPLATE SYSTEM
-- =========================

-- Ticket Templates
CREATE TABLE IF NOT EXISTS ticket_templates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    category VARCHAR(100),
    subcategory VARCHAR(100),
    template_type VARCHAR(50) DEFAULT 'STANDARD' CHECK (template_type IN ('STANDARD', 'SERVICE_REQUEST', 'INCIDENT', 'CHANGE', 'PROBLEM')),
    title_template TEXT NOT NULL,
    description_template TEXT NOT NULL,
    default_priority VARCHAR(20) DEFAULT 'MEDIUM',
    default_urgency VARCHAR(20) DEFAULT 'MEDIUM',
    default_impact VARCHAR(20) DEFAULT 'MEDIUM',
    default_category VARCHAR(100),
    default_subcategory VARCHAR(100),
    required_fields TEXT[], -- array of field names that must be filled
    form_schema JSONB, -- JSON schema for custom fields
    workflow_id UUID REFERENCES workflows(id),
    sla_id UUID REFERENCES sla_definitions(id),
    is_active BOOLEAN DEFAULT TRUE,
    is_public BOOLEAN DEFAULT TRUE,
    usage_count INTEGER DEFAULT 0,
    created_by UUID NOT NULL REFERENCES users(id),
    updated_by UUID REFERENCES users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_ticket_templates_category ON ticket_templates(category, subcategory);
CREATE INDEX idx_ticket_templates_type ON ticket_templates(template_type);
CREATE INDEX idx_ticket_templates_active ON ticket_templates(is_active);

-- ============================
-- ESCALATION & NOTIFICATION
-- ============================

-- Escalation Rules
CREATE TABLE IF NOT EXISTS escalation_rules (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    trigger_condition JSONB NOT NULL, -- conditions that trigger escalation
    escalation_levels JSONB NOT NULL, -- array of escalation levels with timing and targets
    is_active BOOLEAN DEFAULT TRUE,
    priority INTEGER DEFAULT 0,
    applies_to_ticket_types TEXT[],
    applies_to_categories TEXT[],
    business_hours_only BOOLEAN DEFAULT TRUE,
    created_by UUID NOT NULL REFERENCES users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Notification Rules
CREATE TABLE IF NOT EXISTS notification_rules (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    event_type VARCHAR(100) NOT NULL,
    conditions JSONB,
    notification_channels TEXT[] NOT NULL, -- ['email', 'slack', 'teams', 'webhook']
    recipients JSONB NOT NULL, -- flexible recipient definition
    template_id UUID,
    is_active BOOLEAN DEFAULT TRUE,
    send_immediately BOOLEAN DEFAULT TRUE,
    batch_delay_minutes INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Notification History
CREATE TABLE IF NOT EXISTS notification_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    notification_rule_id UUID REFERENCES notification_rules(id),
    ticket_id UUID REFERENCES enhanced_support_tickets(id),
    recipient_id UUID REFERENCES users(id),
    recipient_email VARCHAR(255),
    channel VARCHAR(50) NOT NULL,
    subject TEXT,
    content TEXT,
    status VARCHAR(20) DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'SENT', 'FAILED', 'BOUNCED')),
    attempts INTEGER DEFAULT 0,
    last_attempt_at TIMESTAMP WITH TIME ZONE,
    sent_at TIMESTAMP WITH TIME ZONE,
    error_message TEXT,
    metadata JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ==================
-- REPORTING TABLES
-- ==================

-- Ticket Metrics Snapshot (for performance)
CREATE TABLE IF NOT EXISTS ticket_metrics_daily (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    metric_date DATE NOT NULL,
    total_tickets INTEGER DEFAULT 0,
    new_tickets INTEGER DEFAULT 0,
    resolved_tickets INTEGER DEFAULT 0,
    closed_tickets INTEGER DEFAULT 0,
    escalated_tickets INTEGER DEFAULT 0,
    sla_breached_tickets INTEGER DEFAULT 0,
    avg_resolution_time INTEGER, -- in minutes
    avg_response_time INTEGER, -- in minutes
    tickets_by_priority JSONB,
    tickets_by_category JSONB,
    tickets_by_source JSONB,
    agent_workload JSONB,
    customer_satisfaction_avg DECIMAL(3,2),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(metric_date)
);

CREATE INDEX idx_ticket_metrics_date ON ticket_metrics_daily(metric_date);

-- ====================
-- DATA RETENTION POLICY
-- ====================

-- Data Retention Rules
CREATE TABLE IF NOT EXISTS data_retention_policies (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    entity_type VARCHAR(100) NOT NULL,
    retention_period_days INTEGER NOT NULL,
    action_after_retention VARCHAR(20) DEFAULT 'ARCHIVE' CHECK (action_after_retention IN ('ARCHIVE', 'DELETE', 'ANONYMIZE')),
    conditions JSONB,
    is_active BOOLEAN DEFAULT TRUE,
    created_by UUID NOT NULL REFERENCES users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Archive Log
CREATE TABLE IF NOT EXISTS archive_log (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    entity_type VARCHAR(100) NOT NULL,
    entity_id UUID NOT NULL,
    original_table VARCHAR(100) NOT NULL,
    action_taken VARCHAR(20) NOT NULL,
    retention_policy_id UUID REFERENCES data_retention_policies(id),
    archived_data JSONB,
    archived_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    scheduled_deletion_at TIMESTAMP WITH TIME ZONE
);

CREATE INDEX idx_archive_log_entity ON archive_log(entity_type, entity_id);
CREATE INDEX idx_archive_log_archived ON archive_log(archived_at);

-- ===============================
-- ADDITIONAL UTILITY FUNCTIONS
-- ===============================

-- Function to generate ticket numbers with type prefix
CREATE OR REPLACE FUNCTION generate_ticket_number(ticket_type VARCHAR)
RETURNS VARCHAR AS $$
DECLARE
    prefix VARCHAR(3);
    next_number INTEGER;
    formatted_number VARCHAR(10);
BEGIN
    -- Determine prefix based on ticket type
    prefix := CASE ticket_type
        WHEN 'INCIDENT' THEN 'INC'
        WHEN 'REQUEST' THEN 'REQ'
        WHEN 'PROBLEM' THEN 'PRB'
        WHEN 'CHANGE' THEN 'CHG'
        WHEN 'TASK' THEN 'TSK'
        WHEN 'HR' THEN 'HR'
        WHEN 'OPS' THEN 'OPS'
        WHEN 'ISAC' THEN 'SEC'
        ELSE 'TKT'
    END;
    
    -- Get next sequence number
    SELECT COALESCE(MAX(CAST(SUBSTR(ticket_number, 4) AS INTEGER)), 0) + 1
    INTO next_number
    FROM enhanced_support_tickets
    WHERE ticket_number LIKE prefix || '%';
    
    -- Format with leading zeros
    formatted_number := prefix || LPAD(next_number::TEXT, 7, '0');
    
    RETURN formatted_number;
END;
$$ LANGUAGE plpgsql;

-- Function to calculate business hours between two timestamps
CREATE OR REPLACE FUNCTION calculate_business_minutes(start_time TIMESTAMP WITH TIME ZONE, end_time TIMESTAMP WITH TIME ZONE)
RETURNS INTEGER AS $$
DECLARE
    business_minutes INTEGER := 0;
    current_time TIMESTAMP WITH TIME ZONE := start_time;
    day_of_week INTEGER;
    hour_of_day INTEGER;
BEGIN
    WHILE current_time < end_time LOOP
        day_of_week := EXTRACT(DOW FROM current_time);
        hour_of_day := EXTRACT(HOUR FROM current_time);
        
        -- Check if it's a business hour (Monday-Friday, 9 AM to 5 PM)
        IF day_of_week BETWEEN 1 AND 5 AND hour_of_day BETWEEN 9 AND 16 THEN
            business_minutes := business_minutes + 1;
        END IF;
        
        current_time := current_time + INTERVAL '1 minute';
    END LOOP;
    
    RETURN business_minutes;
END;
$$ LANGUAGE plpgsql;

-- Triggers for updated_at timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply updated_at triggers to relevant tables
CREATE TRIGGER update_workflows_updated_at BEFORE UPDATE ON workflows FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_ticket_templates_updated_at BEFORE UPDATE ON ticket_templates FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_knowledge_articles_updated_at BEFORE UPDATE ON knowledge_articles FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_escalation_rules_updated_at BEFORE UPDATE ON escalation_rules FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_data_retention_policies_updated_at BEFORE UPDATE ON data_retention_policies FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Insert default SLA definitions if they don't exist
INSERT INTO sla_definitions (name, description, priority, response_time, resolution_time, is_default, is_active)
VALUES 
    ('Critical Priority SLA', 'SLA for critical priority tickets', 'CRITICAL', 15, 240, false, true),
    ('High Priority SLA', 'SLA for high priority tickets', 'HIGH', 60, 480, false, true),
    ('Medium Priority SLA', 'SLA for medium priority tickets', 'MEDIUM', 240, 1440, true, true),
    ('Low Priority SLA', 'SLA for low priority tickets', 'LOW', 1440, 4320, false, true)
ON CONFLICT (name) DO NOTHING;

-- Insert default data retention policies
INSERT INTO data_retention_policies (entity_type, retention_period_days, action_after_retention, is_active, created_by)
SELECT 'tickets_closed', 2555, 'ARCHIVE', true, (SELECT id FROM users WHERE email = 'system@nova.local' LIMIT 1)
WHERE NOT EXISTS (SELECT 1 FROM data_retention_policies WHERE entity_type = 'tickets_closed');

INSERT INTO data_retention_policies (entity_type, retention_period_days, action_after_retention, is_active, created_by)
SELECT 'audit_logs', 365, 'ARCHIVE', true, (SELECT id FROM users WHERE email = 'system@nova.local' LIMIT 1)
WHERE NOT EXISTS (SELECT 1 FROM data_retention_policies WHERE entity_type = 'audit_logs');

COMMIT;
