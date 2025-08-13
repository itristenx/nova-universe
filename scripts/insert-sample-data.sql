-- Enhanced sample data for ticket management system
-- Based on industry standards like ServiceNow, Jira Service Management

-- Insert sample queue data with enhanced metrics
INSERT INTO "Queue" (id, name, "displayName", description, "isActive", priority, "maxAgents", "autoAssign", "createdAt", "updatedAt")
VALUES 
    (gen_random_uuid()::text, 'hr', 'Human Resources', 'HR-related requests including onboarding, benefits, payroll', true, 1, 8, true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    (gen_random_uuid()::text, 'it', 'Information Technology', 'IT support including hardware, software, network issues', true, 2, 12, true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    (gen_random_uuid()::text, 'operations', 'Operations', 'Facilities, procurement, and general operations support', true, 1, 6, true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    (gen_random_uuid()::text, 'cyber', 'Cybersecurity', 'Security incidents, access requests, compliance issues', true, 3, 4, true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
ON CONFLICT (name) DO NOTHING;

-- Insert enhanced queue metrics with realistic data
INSERT INTO "QueueMetrics" (id, "queueName", "totalAgents", "availableAgents", "busyAgents", "pendingTickets", "avgResponseTime", "capacityUtilization", "alertLevel", "lastCalculated", "createdAt", "updatedAt")
VALUES 
    (gen_random_uuid()::text, 'hr', 8, 5, 3, 12, 145.5, 0.65, 'normal', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    (gen_random_uuid()::text, 'it', 12, 7, 5, 28, 95.2, 0.75, 'warning', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    (gen_random_uuid()::text, 'operations', 6, 4, 2, 8, 180.8, 0.45, 'normal', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    (gen_random_uuid()::text, 'cyber', 4, 2, 2, 15, 65.3, 0.85, 'critical', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
ON CONFLICT ("queueName") DO UPDATE SET
    "totalAgents" = EXCLUDED."totalAgents",
    "availableAgents" = EXCLUDED."availableAgents", 
    "busyAgents" = EXCLUDED."busyAgents",
    "pendingTickets" = EXCLUDED."pendingTickets",
    "avgResponseTime" = EXCLUDED."avgResponseTime",
    "capacityUtilization" = EXCLUDED."capacityUtilization",
    "alertLevel" = EXCLUDED."alertLevel",
    "lastCalculated" = CURRENT_TIMESTAMP,
    "updatedAt" = CURRENT_TIMESTAMP;

-- Insert sample tickets with diverse scenarios
INSERT INTO tickets (
    id, ticket_id, title, description, priority, status, category, subcategory,
    location, requested_by_id, requested_by_name, requested_by_email,
    assigned_to_id, assigned_to_name, assigned_to_email,
    created_at, updated_at, due_date, vip_weight
) VALUES 
-- Critical Security Incident
(gen_random_uuid()::text, 'SEC-2025-001', 'Suspicious Login Activity Detected', 
 'Multiple failed login attempts detected from foreign IP addresses on executive accounts. Immediate investigation required.', 
 'critical', 'in_progress', 'security', 'incident_response', 'remote', 
 'user-001', 'John Smith', 'john.smith@company.com',
 'agent-sec-001', 'Sarah Chen', 'sarah.chen@company.com',
 CURRENT_TIMESTAMP - INTERVAL '2 hours', CURRENT_TIMESTAMP - INTERVAL '30 minutes', 
 CURRENT_TIMESTAMP + INTERVAL '2 hours', 1),

-- VIP User Request
(gen_random_uuid()::text, 'HR-2025-002', 'CEO Onboarding New Assistant', 
 'Urgent setup required for new executive assistant starting Monday. Need laptop, phone, office access, and system permissions.', 
 'high', 'open', 'hr', 'onboarding', 'headquarters', 
 'ceo-office', 'Executive Office', 'ceo.office@company.com',
 'agent-hr-001', 'Maria Rodriguez', 'maria.rodriguez@company.com',
 CURRENT_TIMESTAMP - INTERVAL '1 hour', CURRENT_TIMESTAMP - INTERVAL '15 minutes', 
 CURRENT_TIMESTAMP + INTERVAL '1 day', 2),

-- Standard IT Request
(gen_random_uuid()::text, 'IT-2025-003', 'Software Installation Request', 
 'Need Adobe Creative Suite installed on workstation for marketing department project. Standard business license.', 
 'medium', 'in_progress', 'it', 'software', 'floor_3', 
 'user-003', 'Mike Johnson', 'mike.johnson@company.com',
 'agent-it-001', 'David Park', 'david.park@company.com',
 CURRENT_TIMESTAMP - INTERVAL '3 hours', CURRENT_TIMESTAMP - INTERVAL '45 minutes', 
 CURRENT_TIMESTAMP + INTERVAL '2 days', NULL),

-- Hardware Failure
(gen_random_uuid()::text, 'IT-2025-004', 'Printer Not Working - Finance Dept', 
 'Main printer in finance department showing error codes. Unable to print invoices and reports. Backup printer also low on toner.', 
 'high', 'open', 'it', 'hardware', 'floor_2', 
 'user-004', 'Lisa Wong', 'lisa.wong@company.com',
 NULL, NULL, NULL,
 CURRENT_TIMESTAMP - INTERVAL '45 minutes', CURRENT_TIMESTAMP - INTERVAL '10 minutes', 
 CURRENT_TIMESTAMP + INTERVAL '4 hours', NULL),

-- Facilities Request
(gen_random_uuid()::text, 'OPS-2025-005', 'Conference Room AV Setup', 
 'Need AV equipment setup for board meeting tomorrow. Projector, microphones, and video conferencing capability required.', 
 'medium', 'assigned', 'operations', 'facilities', 'conference_room_a', 
 'user-005', 'Robert Taylor', 'robert.taylor@company.com',
 'agent-ops-001', 'Jennifer Liu', 'jennifer.liu@company.com',
 CURRENT_TIMESTAMP - INTERVAL '6 hours', CURRENT_TIMESTAMP - INTERVAL '2 hours', 
 CURRENT_TIMESTAMP + INTERVAL '18 hours', NULL),

-- Password Reset (Low Priority)
(gen_random_uuid()::text, 'IT-2025-006', 'Password Reset Request', 
 'Forgot password for company portal. Need reset to access timesheet and benefits portal.', 
 'low', 'resolved', 'it', 'access', 'remote', 
 'user-006', 'Amanda Davis', 'amanda.davis@company.com',
 'agent-it-002', 'Kevin Zhang', 'kevin.zhang@company.com',
 CURRENT_TIMESTAMP - INTERVAL '1 day', CURRENT_TIMESTAMP - INTERVAL '20 hours', 
 CURRENT_TIMESTAMP - INTERVAL '19 hours', NULL),

-- System Outage
(gen_random_uuid()::text, 'IT-2025-007', 'Email Server Performance Issues', 
 'Email delivery delays reported company-wide. Some emails taking 15+ minutes to send/receive. Affecting business operations.', 
 'critical', 'in_progress', 'it', 'infrastructure', 'data_center', 
 'system-monitor', 'System Monitor', 'system@company.com',
 'agent-it-003', 'Thomas Anderson', 'thomas.anderson@company.com',
 CURRENT_TIMESTAMP - INTERVAL '4 hours', CURRENT_TIMESTAMP - INTERVAL '1 hour', 
 CURRENT_TIMESTAMP + INTERVAL '1 hour', NULL),

-- HR Benefits Question
(gen_random_uuid()::text, 'HR-2025-008', 'Health Insurance Coverage Question', 
 'Need clarification on dental coverage for family members. Planning orthodontic treatment and want to verify benefits.', 
 'low', 'open', 'hr', 'benefits', 'remote', 
 'user-008', 'Carol White', 'carol.white@company.com',
 'agent-hr-002', 'Steven Kim', 'steven.kim@company.com',
 CURRENT_TIMESTAMP - INTERVAL '2 hours', CURRENT_TIMESTAMP - INTERVAL '1 hour', 
 CURRENT_TIMESTAMP + INTERVAL '3 days', NULL),

-- Access Request
(gen_random_uuid()::text, 'SEC-2025-009', 'Database Access Request', 
 'Need read access to customer database for quarterly reporting. Manager approval attached. Temporary access for 2 weeks.', 
 'medium', 'pending_approval', 'security', 'access_control', 'remote', 
 'user-009', 'Brian Lee', 'brian.lee@company.com',
 'agent-sec-002', 'Emma Thompson', 'emma.thompson@company.com',
 CURRENT_TIMESTAMP - INTERVAL '1 day', CURRENT_TIMESTAMP - INTERVAL '4 hours', 
 CURRENT_TIMESTAMP + INTERVAL '2 days', NULL),

-- VIP Equipment Request
(gen_random_uuid()::text, 'IT-2025-010', 'Executive Laptop Replacement', 
 'CFO laptop showing blue screen errors. Need immediate replacement with same specifications and data migration. Critical for board presentation.', 
 'critical', 'assigned', 'it', 'hardware', 'executive_floor', 
 'cfo-office', 'CFO Office', 'cfo.office@company.com',
 'agent-it-004', 'Rachel Green', 'rachel.green@company.com',
 CURRENT_TIMESTAMP - INTERVAL '3 hours', CURRENT_TIMESTAMP - INTERVAL '2 hours', 
 CURRENT_TIMESTAMP + INTERVAL '3 hours', 3);

-- Insert sample ticket history/logs
INSERT INTO ticket_logs (id, ticket_id, user_id, user_name, action, details, timestamp)
VALUES 
(gen_random_uuid()::text, 'SEC-2025-001', 'agent-sec-001', 'Sarah Chen', 'assigned', 'Ticket assigned to security team', CURRENT_TIMESTAMP - INTERVAL '2 hours'),
(gen_random_uuid()::text, 'SEC-2025-001', 'agent-sec-001', 'Sarah Chen', 'investigation_started', 'Reviewing login logs and IP geolocation', CURRENT_TIMESTAMP - INTERVAL '90 minutes'),
(gen_random_uuid()::text, 'SEC-2025-001', 'agent-sec-001', 'Sarah Chen', 'escalated', 'Escalated to incident response team', CURRENT_TIMESTAMP - INTERVAL '45 minutes'),
(gen_random_uuid()::text, 'SEC-2025-001', 'agent-sec-001', 'Sarah Chen', 'work_note', 'Confirmed malicious activity. Implementing account lockdown.', CURRENT_TIMESTAMP - INTERVAL '30 minutes'),

(gen_random_uuid()::text, 'IT-2025-006', 'agent-it-002', 'Kevin Zhang', 'assigned', 'Processing password reset request', CURRENT_TIMESTAMP - INTERVAL '24 hours'),
(gen_random_uuid()::text, 'IT-2025-006', 'agent-it-002', 'Kevin Zhang', 'work_note', 'Verified identity via security questions', CURRENT_TIMESTAMP - INTERVAL '20 hours'),
(gen_random_uuid()::text, 'IT-2025-006', 'agent-it-002', 'Kevin Zhang', 'resolved', 'Password reset completed. User can now access portal.', CURRENT_TIMESTAMP - INTERVAL '19 hours'),

(gen_random_uuid()::text, 'IT-2025-007', 'agent-it-003', 'Thomas Anderson', 'assigned', 'Investigating email server performance', CURRENT_TIMESTAMP - INTERVAL '4 hours'),
(gen_random_uuid()::text, 'IT-2025-007', 'agent-it-003', 'Thomas Anderson', 'work_note', 'Identified bottleneck in mail queue processing', CURRENT_TIMESTAMP - INTERVAL '2 hours'),
(gen_random_uuid()::text, 'IT-2025-007', 'agent-it-003', 'Thomas Anderson', 'work_note', 'Applied configuration changes. Monitoring improvement.', CURRENT_TIMESTAMP - INTERVAL '1 hour');

-- Insert sample assets for linking
INSERT INTO assets (id, name, asset_tag, type, model, serial_number, location, assigned_to, status, created_at, updated_at)
VALUES 
(gen_random_uuid()::text, 'Executive Laptop - CFO', 'LAP-001', 'laptop', 'ThinkPad X1 Carbon', 'ABC123DEF456', 'executive_floor', 'cfo-office', 'in_use', CURRENT_TIMESTAMP - INTERVAL '6 months', CURRENT_TIMESTAMP),
(gen_random_uuid()::text, 'Finance Printer Main', 'PRT-001', 'printer', 'Canon ImageRunner', 'PRT789XYZ', 'floor_2', 'finance', 'broken', CURRENT_TIMESTAMP - INTERVAL '2 years', CURRENT_TIMESTAMP - INTERVAL '45 minutes'),
(gen_random_uuid()::text, 'Conference Room A Projector', 'PROJ-001', 'projector', 'Epson PowerLite', 'PROJ456ABC', 'conference_room_a', 'facilities', 'active', CURRENT_TIMESTAMP - INTERVAL '1 year', CURRENT_TIMESTAMP),
(gen_random_uuid()::text, 'Marketing Workstation', 'WS-001', 'workstation', 'Dell Precision 5820', 'WS123456789', 'floor_3', 'user-003', 'active', CURRENT_TIMESTAMP - INTERVAL '8 months', CURRENT_TIMESTAMP);

-- Insert knowledge base articles for AI suggestions
INSERT INTO knowledge_articles (id, title, content, category, tags, created_at, updated_at, view_count)
VALUES 
(gen_random_uuid()::text, 'Password Reset Procedure', 'Step-by-step guide for resetting user passwords in Active Directory...', 'it', ARRAY['password', 'reset', 'authentication'], CURRENT_TIMESTAMP - INTERVAL '3 months', CURRENT_TIMESTAMP, 245),
(gen_random_uuid()::text, 'Printer Troubleshooting Guide', 'Common printer issues and their resolutions. Covers error codes, paper jams, and connectivity...', 'it', ARRAY['printer', 'hardware', 'troubleshooting'], CURRENT_TIMESTAMP - INTERVAL '6 months', CURRENT_TIMESTAMP, 189),
(gen_random_uuid()::text, 'Security Incident Response Playbook', 'Procedures for handling security incidents including account compromises, malware, and data breaches...', 'security', ARRAY['incident', 'response', 'security'], CURRENT_TIMESTAMP - INTERVAL '1 month', CURRENT_TIMESTAMP, 67),
(gen_random_uuid()::text, 'Software Installation Requests', 'Standard procedure for requesting and installing business software...', 'it', ARRAY['software', 'installation', 'procurement'], CURRENT_TIMESTAMP - INTERVAL '4 months', CURRENT_TIMESTAMP, 156);

-- Insert agent performance data
INSERT INTO agent_performance (id, agent_id, agent_name, date, tickets_resolved, avg_resolution_time, customer_satisfaction, first_call_resolution_rate)
VALUES 
(gen_random_uuid()::text, 'agent-it-001', 'David Park', CURRENT_DATE, 8, 145, 4.2, 0.75),
(gen_random_uuid()::text, 'agent-it-002', 'Kevin Zhang', CURRENT_DATE, 12, 95, 4.5, 0.85),
(gen_random_uuid()::text, 'agent-sec-001', 'Sarah Chen', CURRENT_DATE, 4, 180, 4.3, 0.70),
(gen_random_uuid()::text, 'agent-hr-001', 'Maria Rodriguez', CURRENT_DATE, 6, 120, 4.6, 0.80),
(gen_random_uuid()::text, 'agent-ops-001', 'Jennifer Liu', CURRENT_DATE, 5, 160, 4.1, 0.72);

-- Insert SLA definitions for different ticket types
INSERT INTO sla_definitions (id, name, priority, category, response_time_hours, resolution_time_hours, business_hours_only)
VALUES 
(gen_random_uuid()::text, 'Critical Security', 'critical', 'security', 0.25, 4, false),
(gen_random_uuid()::text, 'Critical IT Infrastructure', 'critical', 'it', 0.5, 6, false),
(gen_random_uuid()::text, 'High Priority General', 'high', '%', 2, 24, true),
(gen_random_uuid()::text, 'Medium Priority General', 'medium', '%', 4, 72, true),
(gen_random_uuid()::text, 'Low Priority General', 'low', '%', 24, 168, true);

-- Update existing tickets with proper SLA due dates
UPDATE tickets SET due_date = CASE 
    WHEN priority = 'critical' AND category = 'security' THEN created_at + INTERVAL '4 hours'
    WHEN priority = 'critical' THEN created_at + INTERVAL '6 hours'
    WHEN priority = 'high' THEN created_at + INTERVAL '1 day'
    WHEN priority = 'medium' THEN created_at + INTERVAL '3 days'
    WHEN priority = 'low' THEN created_at + INTERVAL '7 days'
END
WHERE due_date IS NOT NULL;
