-- Drop the PascalCase tables and recreate with snake_case naming

-- Drop existing tables
DROP TABLE IF EXISTS "QueueAccess";
DROP TABLE IF EXISTS "QueueAlert";
DROP TABLE IF EXISTS "AgentAvailability";
DROP TABLE IF EXISTS "QueueMetrics";
DROP TABLE IF EXISTS "Queue";

-- Create Queue table with snake_case naming
CREATE TABLE queue (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) UNIQUE NOT NULL,
    description TEXT,
    sla_minutes INTEGER DEFAULT 30,
    priority_weight DECIMAL(3,2) DEFAULT 1.0,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create QueueMetrics table with snake_case naming
CREATE TABLE queue_metrics (
    id SERIAL PRIMARY KEY,
    queue_name VARCHAR(255) NOT NULL,
    pending_count INTEGER DEFAULT 0,
    active_count INTEGER DEFAULT 0,
    resolved_count INTEGER DEFAULT 0,
    avg_wait_time_minutes DECIMAL(10,2) DEFAULT 0,
    avg_resolution_time_minutes DECIMAL(10,2) DEFAULT 0,
    sla_breach_count INTEGER DEFAULT 0,
    satisfaction_score DECIMAL(3,2),
    recorded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_queue_metrics_name FOREIGN KEY (queue_name) REFERENCES queue(name)
);

-- Create AgentAvailability table with snake_case naming
CREATE TABLE agent_availability (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL,
    queue_name VARCHAR(255) NOT NULL,
    is_available BOOLEAN DEFAULT false,
    status VARCHAR(50) DEFAULT 'offline',
    max_capacity INTEGER DEFAULT 5,
    current_load INTEGER DEFAULT 0,
    last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_agent_queue_name FOREIGN KEY (queue_name) REFERENCES queue(name)
);

-- Create QueueAccess table with snake_case naming
CREATE TABLE queue_access (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL,
    queue_name VARCHAR(255) NOT NULL,
    access_level VARCHAR(50) DEFAULT 'agent',
    granted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    granted_by INTEGER,
    CONSTRAINT fk_queue_access_name FOREIGN KEY (queue_name) REFERENCES queue(name),
    UNIQUE(user_id, queue_name)
);

-- Create QueueAlert table with snake_case naming
CREATE TABLE queue_alerts (
    id SERIAL PRIMARY KEY,
    queue_name VARCHAR(255) NOT NULL,
    alert_type VARCHAR(100) NOT NULL,
    message TEXT NOT NULL,
    severity VARCHAR(20) DEFAULT 'medium',
    is_resolved BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    resolved_at TIMESTAMP,
    resolved_by INTEGER,
    CONSTRAINT fk_queue_alerts_name FOREIGN KEY (queue_name) REFERENCES queue(name)
);

-- Insert sample data
INSERT INTO queue (name, description, sla_minutes, priority_weight, is_active) VALUES
('technical-support', 'Technical support requests', 30, 1.0, true),
('billing-inquiries', 'Billing and payment questions', 60, 0.8, true),
('general-questions', 'General customer inquiries', 120, 0.6, true),
('vip-support', 'VIP customer support', 15, 2.0, true),
('escalations', 'Escalated issues', 10, 3.0, true);

-- Insert sample queue metrics
INSERT INTO queue_metrics (queue_name, pending_count, active_count, resolved_count, avg_wait_time_minutes, avg_resolution_time_minutes, sla_breach_count, satisfaction_score) VALUES
('technical-support', 12, 5, 847, 8.5, 25.3, 2, 4.2),
('billing-inquiries', 3, 2, 234, 15.2, 45.7, 0, 4.5),
('general-questions', 18, 8, 1205, 22.1, 38.9, 5, 4.1),
('vip-support', 2, 1, 156, 2.3, 12.8, 0, 4.8),
('escalations', 1, 3, 45, 5.1, 18.4, 1, 4.0);

-- Insert sample agent availability
INSERT INTO agent_availability (user_id, queue_name, is_available, status, max_capacity, current_load) VALUES
(1, 'technical-support', true, 'online', 5, 2),
(1, 'escalations', true, 'online', 3, 1),
(2, 'billing-inquiries', true, 'online', 4, 1),
(2, 'general-questions', false, 'break', 6, 0),
(3, 'vip-support', true, 'online', 3, 1),
(3, 'technical-support', true, 'online', 4, 2);

-- Insert sample queue access permissions
INSERT INTO queue_access (user_id, queue_name, access_level, granted_by) VALUES
(1, 'technical-support', 'agent', 1),
(1, 'escalations', 'supervisor', 1),
(2, 'billing-inquiries', 'agent', 1),
(2, 'general-questions', 'agent', 1),
(3, 'vip-support', 'agent', 1),
(3, 'technical-support', 'agent', 1);

-- Insert sample queue alerts
INSERT INTO queue_alerts (queue_name, alert_type, message, severity, is_resolved) VALUES
('technical-support', 'high_wait_time', 'Average wait time exceeding SLA threshold', 'high', false),
('general-questions', 'capacity_warning', 'Queue approaching capacity limits', 'medium', false),
('escalations', 'sla_breach', 'SLA breach detected for escalated ticket', 'critical', true);
