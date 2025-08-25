-- Enhanced email communication tracking and customer activity timeline
-- Provides comprehensive email tracking with Zendesk-inspired customer activity timeline
-- Includes customer linking, RBAC support, and email delay management

-- Email Templates table for customizable email templates
CREATE TABLE IF NOT EXISTS email_templates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    key VARCHAR(100) NOT NULL,
    organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    subject TEXT NOT NULL,
    body_html TEXT NOT NULL,
    body_text TEXT NOT NULL,
    category VARCHAR(50) DEFAULT 'general',
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    
    UNIQUE(key, organization_id)
);

-- Email Delay Configuration for customizable send delays
CREATE TABLE IF NOT EXISTS email_delay_configuration (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
    template_key VARCHAR(100),
    template_category VARCHAR(50),
    delay_ms INTEGER NOT NULL DEFAULT 30000,
    priority VARCHAR(20) DEFAULT 'NORMAL',
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Pending Emails table for delayed email processing
CREATE TABLE IF NOT EXISTS pending_emails (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    ticket_id UUID NOT NULL REFERENCES support_tickets(id) ON DELETE CASCADE,
    template_key VARCHAR(100) NOT NULL,
    recipient_email VARCHAR(320) NOT NULL,
    recipient_name VARCHAR(255),
    email_data JSONB NOT NULL DEFAULT '{}',
    organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
    priority VARCHAR(20) DEFAULT 'NORMAL',
    status VARCHAR(20) DEFAULT 'PENDING', -- PENDING, SENT, FAILED, CANCELLED
    scheduled_at TIMESTAMP WITH TIME ZONE NOT NULL,
    processed_at TIMESTAMP WITH TIME ZONE,
    cancelled_at TIMESTAMP WITH TIME ZONE,
    cancel_reason TEXT,
    email_id UUID REFERENCES email_communications(id) ON DELETE SET NULL,
    error_message TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Enhanced Customers table with Nova user linking
CREATE TABLE IF NOT EXISTS customers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(320) UNIQUE NOT NULL,
    alternate_emails TEXT[] DEFAULT '{}',
    name VARCHAR(255) NOT NULL,
    phone VARCHAR(50),
    organization_id UUID REFERENCES organizations(id) ON DELETE SET NULL,
    linked_nova_user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    is_nova_user BOOLEAN DEFAULT false,
    customer_type VARCHAR(20) DEFAULT 'EXTERNAL', -- INTERNAL, EXTERNAL, PARTNER
    status VARCHAR(20) DEFAULT 'ACTIVE',
    metadata JSONB DEFAULT '{}',
    tags TEXT[] DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    last_seen_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Queue Restricted Access for RBAC
CREATE TABLE IF NOT EXISTS restricted_queue_access (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    queue_id UUID NOT NULL REFERENCES queues(id) ON DELETE CASCADE,
    granted_by UUID REFERENCES users(id) ON DELETE SET NULL,
    granted_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    expires_at TIMESTAMP WITH TIME ZONE,
    is_active BOOLEAN DEFAULT true,
    
    UNIQUE(user_id, queue_id)
);

-- Update Users table to support customer linking
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS linked_customer_id UUID REFERENCES customers(id) ON DELETE SET NULL,
ADD COLUMN IF NOT EXISTS alternate_emails TEXT[] DEFAULT '{}';

-- Update Queues table to support RBAC and end-user visibility
ALTER TABLE queues 
ADD COLUMN IF NOT EXISTS is_restricted BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS hide_from_end_user BOOLEAN DEFAULT false;
CREATE TABLE email_communications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- Email identification
    message_id VARCHAR(255) UNIQUE NOT NULL, -- External email message ID
    conversation_id VARCHAR(255), -- Threading identifier
    in_reply_to VARCHAR(255), -- Reply threading
    references TEXT[], -- Email references header
    
    -- Relationship to tickets and customers
    ticket_id UUID REFERENCES enhanced_support_tickets(id) ON DELETE SET NULL,
    customer_id UUID REFERENCES users(id) ON DELETE SET NULL,
    account_id UUID REFERENCES email_accounts(id) ON DELETE SET NULL,
    
    -- Email metadata
    direction VARCHAR(10) NOT NULL CHECK (direction IN ('INBOUND', 'OUTBOUND')),
    from_address VARCHAR(255) NOT NULL,
    to_addresses TEXT[] NOT NULL,
    cc_addresses TEXT[] DEFAULT '{}',
    bcc_addresses TEXT[] DEFAULT '{}',
    subject TEXT NOT NULL,
    
    -- Content
    body_text TEXT,
    body_html TEXT,
    content_type VARCHAR(50) DEFAULT 'text/plain',
    
    -- Processing status
    status VARCHAR(20) DEFAULT 'RECEIVED' CHECK (status IN ('RECEIVED', 'PROCESSED', 'TICKET_CREATED', 'REPLIED', 'FAILED', 'IGNORED')),
    processing_error TEXT,
    
    -- Email tracking (for outbound emails)
    delivery_status VARCHAR(20) CHECK (delivery_status IN ('SENT', 'DELIVERED', 'BOUNCED', 'FAILED')),
    opened_at TIMESTAMP WITH TIME ZONE,
    opened_count INTEGER DEFAULT 0,
    clicked_count INTEGER DEFAULT 0,
    reply_received_at TIMESTAMP WITH TIME ZONE,
    
    -- AI analysis
    sentiment_score DECIMAL(3,2), -- -1.0 to 1.0
    urgency_detected VARCHAR(20) CHECK (urgency_detected IN ('LOW', 'MEDIUM', 'HIGH', 'CRITICAL')),
    category_detected VARCHAR(100),
    intent_detected VARCHAR(100),
    language_detected VARCHAR(10),
    
    -- Metadata
    headers JSONB,
    size_bytes BIGINT,
    attachments_count INTEGER DEFAULT 0,
    is_auto_reply BOOLEAN DEFAULT FALSE,
    is_bounce BOOLEAN DEFAULT FALSE,
    is_spam BOOLEAN DEFAULT FALSE,
    confidence_score DECIMAL(3,2), -- AI confidence in processing
    
    -- Timestamps
    sent_at TIMESTAMP WITH TIME ZONE,
    received_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    processed_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX idx_email_communications_message_id ON email_communications(message_id);
CREATE INDEX idx_email_communications_conversation ON email_communications(conversation_id);
CREATE INDEX idx_email_communications_ticket ON email_communications(ticket_id);
CREATE INDEX idx_email_communications_customer ON email_communications(customer_id);
CREATE INDEX idx_email_communications_direction_status ON email_communications(direction, status);
CREATE INDEX idx_email_communications_sent_received ON email_communications(sent_at, received_at);
CREATE INDEX idx_email_communications_account_received ON email_communications(account_id, received_at);

-- Create email attachments table
CREATE TABLE email_attachments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email_id UUID NOT NULL REFERENCES email_communications(id) ON DELETE CASCADE,
    
    -- File information
    filename VARCHAR(255) NOT NULL,
    original_name VARCHAR(255) NOT NULL,
    mime_type VARCHAR(100) NOT NULL,
    file_size BIGINT NOT NULL,
    content_id VARCHAR(255), -- For inline attachments
    
    -- Storage
    file_key VARCHAR(500) NOT NULL, -- S3 key or storage identifier
    is_inline BOOLEAN DEFAULT FALSE,
    is_secure BOOLEAN DEFAULT FALSE,
    
    -- Processing
    scanned_for_malware BOOLEAN DEFAULT FALSE,
    malware_status VARCHAR(20) CHECK (malware_status IN ('CLEAN', 'INFECTED', 'SUSPICIOUS', 'SCANNING', 'ERROR')),
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_email_attachments_email ON email_attachments(email_id);

-- Create customer activity timeline table (comprehensive tracking)
CREATE TABLE customer_activity_timeline (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- Customer identification
    customer_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    
    -- Activity details
    activity_type VARCHAR(30) NOT NULL CHECK (activity_type IN (
        'EMAIL_SENT', 'EMAIL_RECEIVED', 'TICKET_CREATED', 'TICKET_UPDATED', 
        'TICKET_RESOLVED', 'TICKET_CLOSED', 'COMMENT_ADDED', 'ATTACHMENT_ADDED',
        'PHONE_CALL', 'CHAT_SESSION', 'PORTAL_LOGIN', 'FORM_SUBMITTED',
        'SURVEY_COMPLETED', 'ESCALATION', 'SLA_BREACH', 'APPROVAL_REQUESTED',
        'WORKFLOW_STARTED', 'AUTOMATED_ACTION', 'SYSTEM_NOTIFICATION'
    )),
    
    -- Related entities
    ticket_id UUID REFERENCES enhanced_support_tickets(id) ON DELETE SET NULL,
    email_id UUID REFERENCES email_communications(id) ON DELETE SET NULL,
    comment_id UUID REFERENCES ticket_comments(id) ON DELETE SET NULL,
    user_id UUID REFERENCES users(id) ON DELETE SET NULL, -- Agent who performed action
    
    -- Activity content
    title VARCHAR(255) NOT NULL,
    description TEXT,
    summary TEXT, -- Brief summary for timeline display
    
    -- Context
    source VARCHAR(50), -- 'email', 'portal', 'api', 'system', etc.
    channel VARCHAR(50), -- 'email', 'phone', 'chat', 'web', etc.
    ip_address INET,
    user_agent TEXT,
    session_id VARCHAR(255),
    
    -- Metadata
    metadata JSONB,
    tags TEXT[] DEFAULT '{}',
    is_internal BOOLEAN DEFAULT FALSE, -- Hidden from customer view
    is_system BOOLEAN DEFAULT FALSE, -- System-generated activity
    priority_level VARCHAR(20) DEFAULT 'NORMAL' CHECK (priority_level IN ('LOW', 'NORMAL', 'HIGH', 'CRITICAL')),
    
    -- Timestamps
    occurred_at TIMESTAMP WITH TIME ZONE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for timeline performance
CREATE INDEX idx_activity_timeline_customer_occurred ON customer_activity_timeline(customer_id, occurred_at DESC);
CREATE INDEX idx_activity_timeline_ticket_occurred ON customer_activity_timeline(ticket_id, occurred_at DESC);
CREATE INDEX idx_activity_timeline_type_occurred ON customer_activity_timeline(activity_type, occurred_at DESC);
CREATE INDEX idx_activity_timeline_email ON customer_activity_timeline(email_id);
CREATE INDEX idx_activity_timeline_is_internal ON customer_activity_timeline(is_internal, occurred_at DESC);

-- Create email conversation threads table
CREATE TABLE email_conversation_threads (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- Thread identification
    thread_id VARCHAR(255) UNIQUE NOT NULL, -- Unique conversation identifier
    subject_normalized VARCHAR(255) NOT NULL, -- Normalized subject for grouping
    
    -- Participants
    participants TEXT[] NOT NULL, -- All email addresses in thread
    customer_id UUID REFERENCES users(id) ON DELETE SET NULL,
    
    -- Thread metadata
    message_count INTEGER DEFAULT 0,
    attachment_count INTEGER DEFAULT 0,
    total_size_bytes BIGINT DEFAULT 0,
    
    -- Status
    status VARCHAR(20) DEFAULT 'ACTIVE' CHECK (status IN ('ACTIVE', 'RESOLVED', 'ARCHIVED', 'SPAM')),
    last_activity_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Related tickets
    primary_ticket_id UUID REFERENCES enhanced_support_tickets(id) ON DELETE SET NULL,
    related_tickets UUID[] DEFAULT '{}',
    
    -- AI insights
    sentiment_trend VARCHAR(20) CHECK (sentiment_trend IN ('IMPROVING', 'STABLE', 'DECLINING')),
    resolution_probability DECIMAL(3,2), -- 0.0 to 1.0
    escalation_risk VARCHAR(20) CHECK (escalation_risk IN ('LOW', 'MEDIUM', 'HIGH')),
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_conversation_threads_thread_id ON email_conversation_threads(thread_id);
CREATE INDEX idx_conversation_threads_customer ON email_conversation_threads(customer_id);
CREATE INDEX idx_conversation_threads_activity ON email_conversation_threads(last_activity_at DESC);
CREATE INDEX idx_conversation_threads_ticket ON email_conversation_threads(primary_ticket_id);

-- Create email tracking events table (for analytics and compliance)
CREATE TABLE email_tracking_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email_id UUID NOT NULL REFERENCES email_communications(id) ON DELETE CASCADE,
    
    -- Event details
    event_type VARCHAR(20) NOT NULL CHECK (event_type IN (
        'SENT', 'DELIVERED', 'OPENED', 'CLICKED', 'BOUNCED', 'COMPLAINED', 'UNSUBSCRIBED'
    )),
    
    -- Tracking data
    ip_address INET,
    user_agent TEXT,
    location JSONB, -- Geographic location data
    device_type VARCHAR(20), -- 'mobile', 'desktop', 'tablet'
    link_url TEXT, -- For click events
    
    -- Provider data (from email service)
    provider_event_id VARCHAR(255),
    provider_data JSONB,
    
    occurred_at TIMESTAMP WITH TIME ZONE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_email_tracking_events_email ON email_tracking_events(email_id);
CREATE INDEX idx_email_tracking_events_type_occurred ON email_tracking_events(event_type, occurred_at DESC);

-- Create email templates usage tracking
CREATE TABLE email_template_usage (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    template_name VARCHAR(100) NOT NULL,
    template_version VARCHAR(20),
    
    -- Usage context
    email_id UUID REFERENCES email_communications(id) ON DELETE SET NULL,
    ticket_id UUID REFERENCES enhanced_support_tickets(id) ON DELETE SET NULL,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    
    -- Variables used
    variables_used JSONB,
    
    -- Performance metrics
    delivery_success BOOLEAN,
    open_rate DECIMAL(5,2), -- Percentage
    click_rate DECIMAL(5,2), -- Percentage
    response_received BOOLEAN DEFAULT FALSE,
    response_time_hours INTEGER,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_email_template_usage_template ON email_template_usage(template_name);
CREATE INDEX idx_email_template_usage_user ON email_template_usage(user_id);
CREATE INDEX idx_email_template_usage_created ON email_template_usage(created_at);

-- Add update trigger to email communications
CREATE TRIGGER update_email_communications_updated_at 
    BEFORE UPDATE ON email_communications 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Add update trigger to conversation threads
CREATE TRIGGER update_conversation_threads_updated_at 
    BEFORE UPDATE ON email_conversation_threads 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to automatically create activity timeline entries for emails
CREATE OR REPLACE FUNCTION create_email_activity_timeline()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO customer_activity_timeline (
        customer_id,
        activity_type,
        ticket_id,
        email_id,
        title,
        description,
        summary,
        source,
        channel,
        occurred_at,
        metadata
    ) VALUES (
        NEW.customer_id,
        CASE 
            WHEN NEW.direction = 'INBOUND' THEN 'EMAIL_RECEIVED'
            ELSE 'EMAIL_SENT'
        END,
        NEW.ticket_id,
        NEW.id,
        CASE 
            WHEN NEW.direction = 'INBOUND' THEN 'Email received from customer'
            ELSE 'Email sent to customer'
        END,
        SUBSTRING(COALESCE(NEW.body_text, NEW.body_html, ''), 1, 500),
        'Subject: ' || NEW.subject,
        'email',
        'email',
        COALESCE(NEW.sent_at, NEW.received_at),
        jsonb_build_object(
            'from', NEW.from_address,
            'to', NEW.to_addresses,
            'subject', NEW.subject,
            'size_bytes', NEW.size_bytes,
            'attachments_count', NEW.attachments_count
        )
    );
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for email activity timeline
CREATE TRIGGER create_email_activity_timeline_trigger
    AFTER INSERT ON email_communications
    FOR EACH ROW EXECUTE FUNCTION create_email_activity_timeline();

-- Function to update conversation thread statistics
CREATE OR REPLACE FUNCTION update_conversation_thread_stats()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE email_conversation_threads 
    SET 
        message_count = (
            SELECT COUNT(*) 
            FROM email_communications 
            WHERE conversation_id = NEW.conversation_id
        ),
        attachment_count = (
            SELECT COALESCE(SUM(attachments_count), 0) 
            FROM email_communications 
            WHERE conversation_id = NEW.conversation_id
        ),
        total_size_bytes = (
            SELECT COALESCE(SUM(size_bytes), 0) 
            FROM email_communications 
            WHERE conversation_id = NEW.conversation_id
        ),
        last_activity_at = GREATEST(
            COALESCE(NEW.sent_at, NEW.received_at),
            last_activity_at
        ),
        updated_at = NOW()
    WHERE thread_id = NEW.conversation_id;
    
    -- Create thread if it doesn't exist
    INSERT INTO email_conversation_threads (
        thread_id,
        subject_normalized,
        participants,
        customer_id,
        primary_ticket_id,
        message_count,
        attachment_count,
        total_size_bytes,
        last_activity_at
    )
    SELECT 
        NEW.conversation_id,
        LOWER(REGEXP_REPLACE(NEW.subject, '^(RE:|FW:|FWD:)\s*', '', 'i')),
        ARRAY[NEW.from_address] || NEW.to_addresses,
        NEW.customer_id,
        NEW.ticket_id,
        1,
        NEW.attachments_count,
        NEW.size_bytes,
        COALESCE(NEW.sent_at, NEW.received_at)
    WHERE NOT EXISTS (
        SELECT 1 FROM email_conversation_threads 
        WHERE thread_id = NEW.conversation_id
    );
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for conversation thread updates
CREATE TRIGGER update_conversation_thread_stats_trigger
    AFTER INSERT OR UPDATE ON email_communications
    FOR EACH ROW EXECUTE FUNCTION update_conversation_thread_stats();

-- Create enhanced views for customer communication insights
CREATE VIEW v_customer_communication_summary AS
SELECT 
    c.id as customer_id,
    c.name as customer_name,
    c.email as customer_email,
    COUNT(DISTINCT ec.id) as total_emails,
    COUNT(DISTINCT CASE WHEN ec.direction = 'INBOUND' THEN ec.id END) as emails_received,
    COUNT(DISTINCT CASE WHEN ec.direction = 'OUTBOUND' THEN ec.id END) as emails_sent,
    COUNT(DISTINCT ec.ticket_id) as related_tickets,
    COUNT(DISTINCT ect.thread_id) as conversation_threads,
    MAX(ec.received_at) as last_email_received,
    MAX(ec.sent_at) as last_email_sent,
    AVG(CASE WHEN ec.sentiment_score IS NOT NULL THEN ec.sentiment_score END) as avg_sentiment,
    COUNT(CASE WHEN ec.urgency_detected = 'HIGH' OR ec.urgency_detected = 'CRITICAL' THEN 1 END) as high_urgency_emails
FROM users c
LEFT JOIN email_communications ec ON c.id = ec.customer_id
LEFT JOIN email_conversation_threads ect ON c.id = ect.customer_id
WHERE c.id IS NOT NULL
GROUP BY c.id, c.name, c.email;

CREATE VIEW v_ticket_email_timeline AS
SELECT 
    t.id as ticket_id,
    t.ticket_number,
    t.title as ticket_title,
    ec.id as email_id,
    ec.direction,
    ec.from_address,
    ec.to_addresses,
    ec.subject,
    ec.sent_at,
    ec.received_at,
    ec.status as email_status,
    ec.sentiment_score,
    ec.urgency_detected,
    u.name as customer_name
FROM enhanced_support_tickets t
LEFT JOIN email_communications ec ON t.id = ec.ticket_id
LEFT JOIN users u ON t.user_id = u.id
WHERE ec.id IS NOT NULL
ORDER BY t.id, COALESCE(ec.sent_at, ec.received_at) DESC;

-- Grant permissions
-- GRANT SELECT, INSERT, UPDATE, DELETE ON email_communications TO nova_api_user;
-- GRANT SELECT, INSERT, UPDATE, DELETE ON email_attachments TO nova_api_user;
-- GRANT SELECT, INSERT, UPDATE, DELETE ON customer_activity_timeline TO nova_api_user;
-- GRANT SELECT, INSERT, UPDATE, DELETE ON email_conversation_threads TO nova_api_user;
-- GRANT SELECT, INSERT, UPDATE, DELETE ON email_tracking_events TO nova_api_user;
-- GRANT SELECT, INSERT, UPDATE, DELETE ON email_template_usage TO nova_api_user;

COMMIT;
