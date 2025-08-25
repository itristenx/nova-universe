-- Migration to integrate Enhanced ITSM schema with existing core schema
-- This migration extends the existing support_tickets table and adds new ITSM tables

-- First, let's backup the existing support_tickets table
CREATE TABLE support_tickets_backup AS SELECT * FROM support_tickets;

-- Create the enhanced support tickets table
CREATE TABLE enhanced_support_tickets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    ticket_number VARCHAR(50) UNIQUE NOT NULL,
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    short_description VARCHAR(255),
    
    -- Basic classification
    type VARCHAR(20) DEFAULT 'REQUEST' CHECK (type IN ('INCIDENT', 'REQUEST', 'PROBLEM', 'CHANGE', 'TASK', 'HR', 'OPS', 'ISAC', 'FEEDBACK')),
    state VARCHAR(20) DEFAULT 'NEW' CHECK (state IN ('NEW', 'ASSIGNED', 'IN_PROGRESS', 'PENDING', 'PENDING_APPROVAL', 'RESOLVED', 'CLOSED', 'REOPENED', 'CANCELLED')),
    priority VARCHAR(20) DEFAULT 'MEDIUM' CHECK (priority IN ('CRITICAL', 'HIGH', 'MEDIUM', 'LOW')),
    urgency VARCHAR(20) DEFAULT 'MEDIUM' CHECK (urgency IN ('CRITICAL', 'HIGH', 'MEDIUM', 'LOW')),
    impact VARCHAR(20) DEFAULT 'MEDIUM' CHECK (impact IN ('CRITICAL', 'HIGH', 'MEDIUM', 'LOW')),
    
    -- Categorization
    category VARCHAR(100),
    subcategory VARCHAR(100),
    business_service VARCHAR(100),
    configuration_item VARCHAR(100),
    
    -- User relationships
    user_id UUID NOT NULL REFERENCES users(id),
    assigned_to_user_id UUID REFERENCES users(id),
    assigned_to_group_id UUID,
    assigned_to_queue_id UUID,
    
    -- Source and channel
    source VARCHAR(20) DEFAULT 'PORTAL' CHECK (source IN ('PORTAL', 'EMAIL', 'PHONE', 'WALK_IN', 'CHAT', 'API', 'MONITORING', 'SELF_SERVICE')),
    channel VARCHAR(50),
    location VARCHAR(100),
    cost_center VARCHAR(50),
    business_justification TEXT,
    
    -- Resolution
    resolution TEXT,
    close_notes TEXT,
    
    -- Metadata
    tags TEXT[] DEFAULT '{}',
    custom_fields JSONB,
    is_vip BOOLEAN DEFAULT FALSE,
    is_escalated BOOLEAN DEFAULT FALSE,
    confidentiality_level VARCHAR(20) DEFAULT 'internal',
    
    -- Customer satisfaction
    satisfaction_rating INTEGER CHECK (satisfaction_rating >= 1 AND satisfaction_rating <= 5),
    satisfaction_comment TEXT,
    
    -- SLA and timing
    sla_id UUID,
    response_time_target INTEGER, -- in minutes
    resolution_time_target INTEGER, -- in minutes
    response_time_breached BOOLEAN DEFAULT FALSE,
    resolution_time_breached BOOLEAN DEFAULT FALSE,
    response_time_breached_at TIMESTAMP WITH TIME ZONE,
    resolution_time_breached_at TIMESTAMP WITH TIME ZONE,
    response_time INTEGER, -- actual time in minutes
    resolution_time INTEGER, -- actual time in minutes
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    closed_at TIMESTAMP WITH TIME ZONE,
    resolved_at TIMESTAMP WITH TIME ZONE,
    first_response_at TIMESTAMP WITH TIME ZONE,
    last_activity_at TIMESTAMP WITH TIME ZONE,
    due_date TIMESTAMP WITH TIME ZONE,
    
    -- Parent/child relationships
    parent_ticket_id UUID REFERENCES enhanced_support_tickets(id)
);

-- Create indexes for performance
CREATE INDEX idx_enhanced_tickets_state_priority_assigned ON enhanced_support_tickets(state, priority, assigned_to_user_id);
CREATE INDEX idx_enhanced_tickets_created_state ON enhanced_support_tickets(created_at, state);
CREATE INDEX idx_enhanced_tickets_number ON enhanced_support_tickets(ticket_number);
CREATE INDEX idx_enhanced_tickets_category ON enhanced_support_tickets(category, subcategory);
CREATE INDEX idx_enhanced_tickets_sla ON enhanced_support_tickets(sla_id, state);
CREATE INDEX idx_enhanced_tickets_user ON enhanced_support_tickets(user_id);
CREATE INDEX idx_enhanced_tickets_assigned ON enhanced_support_tickets(assigned_to_user_id);

-- Create ticket groups table
CREATE TABLE ticket_groups (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) UNIQUE NOT NULL,
    description TEXT,
    manager_id UUID REFERENCES users(id),
    email VARCHAR(255),
    is_active BOOLEAN DEFAULT TRUE,
    metadata JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create group members table
CREATE TABLE group_members (
    group_id UUID REFERENCES ticket_groups(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    role VARCHAR(50) DEFAULT 'member',
    joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    PRIMARY KEY (group_id, user_id)
);

-- Create ticket queues table
CREATE TABLE ticket_queues (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) UNIQUE NOT NULL,
    description TEXT,
    group_id UUID REFERENCES ticket_groups(id),
    is_active BOOLEAN DEFAULT TRUE,
    auto_assignment BOOLEAN DEFAULT FALSE,
    assignment_rules JSONB,
    max_capacity INTEGER,
    business_hours JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create email accounts table for email integration
CREATE TABLE email_accounts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    address VARCHAR(255) UNIQUE NOT NULL,
    display_name VARCHAR(255),
    provider VARCHAR(20) NOT NULL CHECK (provider IN ('microsoft', 'imap', 'pop3')),
    queue VARCHAR(20) DEFAULT 'GENERAL',
    queue_id UUID REFERENCES ticket_queues(id),
    group_id UUID REFERENCES ticket_groups(id),
    
    -- Microsoft Graph API settings
    tenant_id VARCHAR(255),
    client_id VARCHAR(255),
    client_secret TEXT,
    access_token TEXT,
    refresh_token TEXT,
    
    -- IMAP/POP3 settings
    imap_host VARCHAR(255),
    imap_port INTEGER DEFAULT 993,
    imap_tls BOOLEAN DEFAULT TRUE,
    username VARCHAR(255),
    password TEXT,
    
    -- SMTP settings for outgoing emails
    smtp_host VARCHAR(255),
    smtp_port INTEGER DEFAULT 587,
    smtp_secure BOOLEAN DEFAULT FALSE,
    smtp_username VARCHAR(255),
    smtp_password TEXT,
    
    -- Configuration
    is_active BOOLEAN DEFAULT TRUE,
    send_auto_reply BOOLEAN DEFAULT TRUE,
    auto_create_tickets BOOLEAN DEFAULT TRUE,
    webhook_mode BOOLEAN DEFAULT FALSE,
    last_processed TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Metadata
    settings JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_email_accounts_active ON email_accounts(is_active);
CREATE INDEX idx_email_accounts_provider ON email_accounts(provider);
CREATE INDEX idx_email_accounts_queue ON email_accounts(queue_id);

-- Add foreign key references after creating dependent tables
ALTER TABLE enhanced_support_tickets 
ADD CONSTRAINT fk_enhanced_tickets_group 
FOREIGN KEY (assigned_to_group_id) REFERENCES ticket_groups(id);

ALTER TABLE enhanced_support_tickets 
ADD CONSTRAINT fk_enhanced_tickets_queue 
FOREIGN KEY (assigned_to_queue_id) REFERENCES ticket_queues(id);

-- Create SLA definitions table
CREATE TABLE sla_definitions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) UNIQUE NOT NULL,
    description TEXT,
    priority VARCHAR(20) CHECK (priority IN ('CRITICAL', 'HIGH', 'MEDIUM', 'LOW')),
    category VARCHAR(100),
    subcategory VARCHAR(100),
    is_vip_only BOOLEAN DEFAULT FALSE,
    response_time INTEGER NOT NULL, -- in minutes
    resolution_time INTEGER NOT NULL, -- in minutes
    business_hours BOOLEAN DEFAULT TRUE,
    is_active BOOLEAN DEFAULT TRUE,
    is_default BOOLEAN DEFAULT FALSE,
    metadata JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add SLA foreign key reference
ALTER TABLE enhanced_support_tickets 
ADD CONSTRAINT fk_enhanced_tickets_sla 
FOREIGN KEY (sla_id) REFERENCES sla_definitions(id);

-- Create ticket comments table
CREATE TABLE ticket_comments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    ticket_id UUID NOT NULL REFERENCES enhanced_support_tickets(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id),
    content TEXT NOT NULL,
    is_internal BOOLEAN DEFAULT FALSE,
    is_system BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_ticket_comments_ticket_created ON ticket_comments(ticket_id, created_at);

-- Create ticket attachments table
CREATE TABLE ticket_attachments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    ticket_id UUID NOT NULL REFERENCES enhanced_support_tickets(id) ON DELETE CASCADE,
    uploaded_by UUID NOT NULL REFERENCES users(id),
    filename VARCHAR(255) NOT NULL,
    original_name VARCHAR(255) NOT NULL,
    mime_type VARCHAR(100) NOT NULL,
    file_size BIGINT NOT NULL,
    file_key VARCHAR(500) NOT NULL,
    is_public BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_ticket_attachments_ticket ON ticket_attachments(ticket_id);

-- Create comment attachments table
CREATE TABLE comment_attachments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    comment_id UUID NOT NULL REFERENCES ticket_comments(id) ON DELETE CASCADE,
    filename VARCHAR(255) NOT NULL,
    original_name VARCHAR(255) NOT NULL,
    mime_type VARCHAR(100) NOT NULL,
    file_size BIGINT NOT NULL,
    file_key VARCHAR(500) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create ticket watchers table
CREATE TABLE ticket_watchers (
    ticket_id UUID REFERENCES enhanced_support_tickets(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    watch_type VARCHAR(20) DEFAULT 'MANUAL' CHECK (watch_type IN ('MANUAL', 'AUTO_REQUESTER', 'AUTO_ASSIGNEE', 'AUTO_GROUP', 'AUTO_ESCALATION')),
    added_by UUID REFERENCES users(id),
    added_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    PRIMARY KEY (ticket_id, user_id)
);

-- Create ticket history table
CREATE TABLE ticket_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    ticket_id UUID NOT NULL REFERENCES enhanced_support_tickets(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id), -- null for system actions
    action VARCHAR(50) NOT NULL CHECK (action IN ('CREATED', 'UPDATED', 'ASSIGNED', 'ESCALATED', 'RESOLVED', 'CLOSED', 'REOPENED', 'CANCELLED', 'COMMENT_ADDED', 'ATTACHMENT_ADDED', 'SLA_BREACH', 'APPROVAL_REQUESTED', 'APPROVED', 'REJECTED', 'WORKFLOW_STARTED', 'WORKFLOW_COMPLETED')),
    field_changed VARCHAR(100),
    old_value TEXT,
    new_value TEXT,
    description TEXT,
    metadata JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_ticket_history_ticket_created ON ticket_history(ticket_id, created_at);
CREATE INDEX idx_ticket_history_action_created ON ticket_history(action, created_at);

-- Create ticket escalations table
CREATE TABLE ticket_escalations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    ticket_id UUID NOT NULL REFERENCES enhanced_support_tickets(id) ON DELETE CASCADE,
    escalation_level INTEGER NOT NULL,
    escalated_by UUID NOT NULL REFERENCES users(id),
    escalated_to UUID REFERENCES users(id),
    escalated_to_group UUID REFERENCES ticket_groups(id),
    reason TEXT NOT NULL,
    status VARCHAR(20) DEFAULT 'ACTIVE' CHECK (status IN ('ACTIVE', 'RESOLVED', 'CANCELLED')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    resolved_at TIMESTAMP WITH TIME ZONE
);

CREATE INDEX idx_ticket_escalations_ticket_level ON ticket_escalations(ticket_id, escalation_level);

-- Create ticket time entries table
CREATE TABLE ticket_time_entries (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    ticket_id UUID NOT NULL REFERENCES enhanced_support_tickets(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id),
    duration INTEGER NOT NULL, -- in minutes
    description TEXT,
    time_type VARCHAR(20) DEFAULT 'WORK' CHECK (time_type IN ('WORK', 'RESEARCH', 'DOCUMENTATION', 'TESTING', 'TRAVEL', 'TRAINING', 'ADMIN')),
    billable BOOLEAN DEFAULT FALSE,
    start_time TIMESTAMP WITH TIME ZONE NOT NULL,
    end_time TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_ticket_time_entries_ticket_start ON ticket_time_entries(ticket_id, start_time);
CREATE INDEX idx_ticket_time_entries_user_start ON ticket_time_entries(user_id, start_time);

-- Create ticket links table
CREATE TABLE ticket_links (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    source_ticket_id UUID NOT NULL REFERENCES enhanced_support_tickets(id) ON DELETE CASCADE,
    target_ticket_id UUID NOT NULL REFERENCES enhanced_support_tickets(id) ON DELETE CASCADE,
    relationship_type VARCHAR(30) NOT NULL CHECK (relationship_type IN ('BLOCKS', 'IS_BLOCKED_BY', 'DUPLICATES', 'IS_DUPLICATED_BY', 'RELATES_TO', 'PARENT_OF', 'CHILD_OF', 'CAUSED_BY', 'CAUSES')),
    created_by UUID NOT NULL REFERENCES users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_ticket_links_source ON ticket_links(source_ticket_id);
CREATE INDEX idx_ticket_links_target ON ticket_links(target_ticket_id);

-- Create SLA breaches table
CREATE TABLE sla_breaches (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    ticket_id UUID NOT NULL REFERENCES enhanced_support_tickets(id) ON DELETE CASCADE,
    sla_id UUID NOT NULL REFERENCES sla_definitions(id),
    breach_type VARCHAR(20) NOT NULL CHECK (breach_type IN ('RESPONSE', 'RESOLUTION')),
    target_time TIMESTAMP WITH TIME ZONE NOT NULL,
    actual_time TIMESTAMP WITH TIME ZONE NOT NULL,
    breach_duration INTEGER NOT NULL, -- in minutes
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_sla_breaches_ticket ON sla_breaches(ticket_id);
CREATE INDEX idx_sla_breaches_created_type ON sla_breaches(created_at, breach_type);

-- Create ticket approvals table
CREATE TABLE ticket_approvals (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    ticket_id UUID NOT NULL REFERENCES enhanced_support_tickets(id) ON DELETE CASCADE,
    approver_id UUID NOT NULL REFERENCES users(id),
    approval_type VARCHAR(20) NOT NULL CHECK (approval_type IN ('REQUIRED', 'OPTIONAL', 'INFORMATIONAL')),
    status VARCHAR(20) DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'APPROVED', 'REJECTED', 'CANCELLED')),
    comments TEXT,
    approved_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_ticket_approvals_ticket_status ON ticket_approvals(ticket_id, status);
CREATE INDEX idx_ticket_approvals_approver_status ON ticket_approvals(approver_id, status);

-- Create workflow definitions table
CREATE TABLE workflow_definitions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) UNIQUE NOT NULL,
    description TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    auto_start BOOLEAN DEFAULT FALSE,
    triggers JSONB, -- conditions that start this workflow
    metadata JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create workflow steps table
CREATE TABLE workflow_steps (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    workflow_id UUID NOT NULL REFERENCES workflow_definitions(id) ON DELETE CASCADE,
    step_order INTEGER NOT NULL,
    step_type VARCHAR(20) NOT NULL CHECK (step_type IN ('ASSIGN', 'APPROVE', 'NOTIFY', 'UPDATE_FIELD', 'WAIT', 'CONDITION', 'PARALLEL', 'SUBPROCESS')),
    name VARCHAR(100) NOT NULL,
    description TEXT,
    configuration JSONB NOT NULL, -- step-specific configuration
    is_required BOOLEAN DEFAULT TRUE
);

CREATE INDEX idx_workflow_steps_workflow_order ON workflow_steps(workflow_id, step_order);

-- Create workflow instances table
CREATE TABLE workflow_instances (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    ticket_id UUID NOT NULL REFERENCES enhanced_support_tickets(id) ON DELETE CASCADE,
    workflow_definition_id UUID NOT NULL REFERENCES workflow_definitions(id),
    status VARCHAR(20) DEFAULT 'ACTIVE' CHECK (status IN ('ACTIVE', 'COMPLETED', 'FAILED', 'CANCELLED', 'PAUSED')),
    current_step INTEGER DEFAULT 0,
    started_by UUID NOT NULL REFERENCES users(id),
    context JSONB, -- runtime context/variables
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    completed_at TIMESTAMP WITH TIME ZONE
);

CREATE INDEX idx_workflow_instances_ticket_status ON workflow_instances(ticket_id, status);

-- Migrate existing support tickets to enhanced format
INSERT INTO enhanced_support_tickets (
    id,
    ticket_number,
    title,
    description,
    state,
    user_id,
    assigned_to_user_id,
    created_at,
    updated_at
)
SELECT 
    gen_random_uuid(),
    'TKT-' || LPAD(id::text, 6, '0'), -- Generate ticket numbers
    title,
    description,
    CASE 
        WHEN status = 'open' THEN 'NEW'
        WHEN status = 'closed' THEN 'CLOSED'
        WHEN status = 'resolved' THEN 'RESOLVED'
        ELSE 'NEW'
    END,
    "userId",
    "assigneeId",
    "createdAt",
    "updatedAt"
FROM support_tickets;

-- Create default SLA definitions
INSERT INTO sla_definitions (name, description, response_time, resolution_time, is_default) VALUES
('Default SLA', 'Default service level agreement for all tickets', 240, 1440, true),
('Critical SLA', 'High priority SLA for critical issues', 60, 240, false),
('VIP SLA', 'Premium SLA for VIP customers', 120, 480, false);

-- Create default ticket groups
INSERT INTO ticket_groups (name, description) VALUES
('IT Support', 'General IT support team'),
('Help Desk', 'First level support team'),
('Network Team', 'Network infrastructure team'),
('Security Team', 'Information security team');

-- Create default ticket queues
INSERT INTO ticket_queues (name, description, auto_assignment) VALUES
('General Support', 'General support queue for all tickets', true),
('Hardware Issues', 'Hardware related problems', false),
('Software Issues', 'Software and application problems', false),
('Network Issues', 'Network connectivity problems', false);

-- Create trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply update trigger to relevant tables
CREATE TRIGGER update_enhanced_support_tickets_updated_at BEFORE UPDATE ON enhanced_support_tickets FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_ticket_groups_updated_at BEFORE UPDATE ON ticket_groups FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_ticket_queues_updated_at BEFORE UPDATE ON ticket_queues FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_email_accounts_updated_at BEFORE UPDATE ON email_accounts FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_sla_definitions_updated_at BEFORE UPDATE ON sla_definitions FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_workflow_definitions_updated_at BEFORE UPDATE ON workflow_definitions FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_ticket_comments_updated_at BEFORE UPDATE ON ticket_comments FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Create function to generate ticket numbers
CREATE OR REPLACE FUNCTION generate_ticket_number(ticket_type VARCHAR DEFAULT 'TKT')
RETURNS VARCHAR AS $$
DECLARE
    next_number INTEGER;
    ticket_number VARCHAR;
BEGIN
    -- Get the next sequence number for the ticket type
    SELECT COALESCE(MAX(CAST(SUBSTRING(ticket_number FROM LENGTH(ticket_type) + 2) AS INTEGER)), 0) + 1
    INTO next_number
    FROM enhanced_support_tickets
    WHERE ticket_number LIKE ticket_type || '-%';
    
    -- Format the ticket number
    ticket_number := ticket_type || '-' || LPAD(next_number::text, 6, '0');
    
    RETURN ticket_number;
END;
$$ LANGUAGE plpgsql;

-- Create function to auto-generate ticket numbers on insert
CREATE OR REPLACE FUNCTION auto_generate_ticket_number()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.ticket_number IS NULL OR NEW.ticket_number = '' THEN
        NEW.ticket_number = generate_ticket_number(
            CASE NEW.type
                WHEN 'INCIDENT' THEN 'INC'
                WHEN 'REQUEST' THEN 'REQ'
                WHEN 'PROBLEM' THEN 'PRB'
                WHEN 'CHANGE' THEN 'CHG'
                WHEN 'TASK' THEN 'TSK'
                ELSE 'TKT'
            END
        );
    END IF;
    
    -- Set last activity time
    NEW.last_activity_at = NOW();
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply ticket number generation trigger
CREATE TRIGGER auto_generate_ticket_number_trigger 
    BEFORE INSERT ON enhanced_support_tickets 
    FOR EACH ROW EXECUTE FUNCTION auto_generate_ticket_number();

-- Create function to update last activity on ticket changes
CREATE OR REPLACE FUNCTION update_ticket_activity()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE enhanced_support_tickets 
    SET last_activity_at = NOW()
    WHERE id = NEW.ticket_id;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply activity tracking triggers
CREATE TRIGGER update_activity_on_comment 
    AFTER INSERT ON ticket_comments 
    FOR EACH ROW EXECUTE FUNCTION update_ticket_activity();

CREATE TRIGGER update_activity_on_attachment 
    AFTER INSERT ON ticket_attachments 
    FOR EACH ROW EXECUTE FUNCTION update_ticket_activity();

CREATE TRIGGER update_activity_on_escalation 
    AFTER INSERT ON ticket_escalations 
    FOR EACH ROW EXECUTE FUNCTION update_ticket_activity();

-- Create views for common queries
CREATE VIEW v_active_tickets AS
SELECT 
    t.*,
    u.name as requester_name,
    u.email as requester_email,
    au.name as assignee_name,
    au.email as assignee_email,
    g.name as group_name,
    q.name as queue_name,
    s.name as sla_name,
    s.response_time as sla_response_time,
    s.resolution_time as sla_resolution_time
FROM enhanced_support_tickets t
LEFT JOIN users u ON t.user_id = u.id
LEFT JOIN users au ON t.assigned_to_user_id = au.id
LEFT JOIN ticket_groups g ON t.assigned_to_group_id = g.id
LEFT JOIN ticket_queues q ON t.assigned_to_queue_id = q.id
LEFT JOIN sla_definitions s ON t.sla_id = s.id
WHERE t.state NOT IN ('CLOSED', 'CANCELLED');

CREATE VIEW v_overdue_tickets AS
SELECT 
    t.*,
    u.name as requester_name,
    au.name as assignee_name,
    EXTRACT(EPOCH FROM (NOW() - t.due_date))/60 as overdue_minutes
FROM enhanced_support_tickets t
LEFT JOIN users u ON t.user_id = u.id
LEFT JOIN users au ON t.assigned_to_user_id = au.id
WHERE t.due_date < NOW() 
AND t.state NOT IN ('CLOSED', 'CANCELLED', 'RESOLVED');

CREATE VIEW v_sla_breached_tickets AS
SELECT 
    t.*,
    u.name as requester_name,
    au.name as assignee_name,
    s.name as sla_name
FROM enhanced_support_tickets t
LEFT JOIN users u ON t.user_id = u.id
LEFT JOIN users au ON t.assigned_to_user_id = au.id
LEFT JOIN sla_definitions s ON t.sla_id = s.id
WHERE (t.response_time_breached = true OR t.resolution_time_breached = true)
AND t.state NOT IN ('CLOSED', 'CANCELLED');

-- Grant permissions (adjust based on your user roles)
-- GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO nova_api_user;
-- GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO nova_api_user;

COMMIT;
