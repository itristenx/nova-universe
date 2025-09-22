-- Create missing tables for Nova Universe ITSM

-- Service Catalog Items table
CREATE TABLE IF NOT EXISTS service_catalog_items (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    category VARCHAR(100),
    active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Knowledge Base Articles table
CREATE TABLE IF NOT EXISTS kb_articles (
    id SERIAL PRIMARY KEY,
    slug VARCHAR(255) UNIQUE NOT NULL,
    title VARCHAR(500) NOT NULL,
    content TEXT,
    is_published BOOLEAN DEFAULT false,
    category VARCHAR(100),
    tags TEXT[],
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    author_id INTEGER
);

-- Enhanced Support Tickets table
CREATE TABLE IF NOT EXISTS enhanced_support_tickets (
    id SERIAL PRIMARY KEY,
    ticket_number VARCHAR(50) UNIQUE NOT NULL,
    title VARCHAR(500) NOT NULL,
    description TEXT,
    status VARCHAR(50) DEFAULT 'open',
    priority VARCHAR(20) DEFAULT 'medium',
    category VARCHAR(100),
    subcategory VARCHAR(100),
    assigned_to INTEGER,
    created_by INTEGER,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    resolved_at TIMESTAMP
);

-- Conversation Sessions table (for Prisma user360)
CREATE TABLE IF NOT EXISTS conversation_sessions (
    id SERIAL PRIMARY KEY,
    user_id VARCHAR(100),
    session_type VARCHAR(50) DEFAULT 'support',
    channel VARCHAR(50) DEFAULT 'web',
    external_id VARCHAR(255),
    subject VARCHAR(500),
    status VARCHAR(50) DEFAULT 'active',
    priority VARCHAR(20) DEFAULT 'medium',
    participant_ids TEXT[],
    assigned_agent_id INTEGER,
    escalation_level INTEGER DEFAULT 0,
    context JSONB,
    tags TEXT[],
    category VARCHAR(100),
    subcategory VARCHAR(100),
    total_interactions INTEGER DEFAULT 0,
    avg_response_time INTEGER,
    first_response_time INTEGER,
    resolution_time INTEGER,
    started_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    last_activity_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    ended_at TIMESTAMP,
    satisfaction_score INTEGER,
    quality_score INTEGER,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create enum types if they don't exist
DO $$ BEGIN
    CREATE TYPE "SessionStatus" AS ENUM ('active', 'idle', 'ended', 'transferred');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Configuration table
CREATE TABLE IF NOT EXISTS configurations (
    id SERIAL PRIMARY KEY,
    key VARCHAR(255) UNIQUE NOT NULL,
    value TEXT,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Insert some sample data
INSERT INTO service_catalog_items (name, description, category) VALUES
('Password Reset', 'Request a password reset for your account', 'Identity Management'),
('Software Installation', 'Request software installation on your workstation', 'Software'),
('Hardware Request', 'Request new hardware or replacement', 'Hardware')
ON CONFLICT DO NOTHING;

INSERT INTO kb_articles (slug, title, content, is_published, category) VALUES
('password-reset-guide', 'How to Reset Your Password', 'Step-by-step guide to reset your password...', true, 'Identity Management'),
('vpn-setup', 'VPN Setup Instructions', 'Instructions for setting up VPN access...', true, 'Network'),
('software-installation', 'Software Installation Process', 'How to request and install approved software...', true, 'Software')
ON CONFLICT (slug) DO NOTHING;

INSERT INTO configurations (key, value, description) VALUES
('app.name', 'Nova Universe ITSM', 'Application name'),
('app.version', '1.0.0', 'Application version'),
('auth.enabled', 'true', 'Authentication enabled flag')
ON CONFLICT (key) DO NOTHING;

-- Update permissions on tables
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO nova_admin;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO nova_admin;