-- Default seed data for Nova Universe PostgreSQL database
-- Created: 2025-01-24

-- Insert default roles
INSERT INTO roles (id, name, description) VALUES 
(1, 'superadmin', 'Super Administrator - Full System Access'),
(2, 'admin', 'Administrator - User Management Access'),
(3, 'user', 'Regular User - No Admin Access'),
(4, 'kiosk_operator', 'Kiosk Operator - Limited Kiosk Management')
ON CONFLICT (id) DO NOTHING;

-- Insert default permissions
INSERT INTO permissions (id, name, description, resource, action) VALUES 
(1, 'manage_users', 'Create, update, and delete users', 'users', 'manage'),
(2, 'manage_roles', 'Create, update, and delete roles', 'roles', 'manage'),
(3, 'manage_integrations', 'Configure system integrations', 'integrations', 'manage'),
(4, 'manage_system', 'System administration and configuration', 'system', 'manage'),
(5, 'view_admin_ui', 'Access to administrative interface', 'admin', 'view'),
(6, 'manage_admins', 'Create and manage administrator accounts', 'admins', 'manage'),
(7, 'manage_kiosks', 'Create, update, and delete kiosks', 'kiosks', 'manage'),
(8, 'view_logs', 'View system and ticket logs', 'logs', 'view'),
(9, 'manage_logs', 'Delete and modify logs', 'logs', 'manage'),
(10, 'manage_assets', 'Upload and manage system assets', 'assets', 'manage'),
(11, 'view_analytics', 'View system analytics and reports', 'analytics', 'view'),
(12, 'manage_notifications', 'Create and manage system notifications', 'notifications', 'manage')
ON CONFLICT (id) DO NOTHING;

-- Assign permissions to roles

-- Superadmin gets all permissions
INSERT INTO role_permissions (role_id, permission_id) VALUES 
(1, 1), (1, 2), (1, 3), (1, 4), (1, 5), (1, 6), 
(1, 7), (1, 8), (1, 9), (1, 10), (1, 11), (1, 12)
ON CONFLICT DO NOTHING;

-- Admin gets limited permissions
INSERT INTO role_permissions (role_id, permission_id) VALUES 
(2, 1), (2, 5), (2, 7), (2, 8), (2, 10), (2, 11), (2, 12)
ON CONFLICT DO NOTHING;

-- Regular users get no admin permissions
-- Kiosk operators get kiosk-specific permissions
INSERT INTO role_permissions (role_id, permission_id) VALUES 
(4, 7), (4, 8)
ON CONFLICT DO NOTHING;

-- Insert default configuration
INSERT INTO config (key, value, value_type, description, is_public, category) VALUES 
('organization_name', COALESCE(NULLIF(current_setting('app.organization_name', true), ''), 'Your Organization'), 'string', 'Organization name displayed throughout the application', true, 'general'),
('logo_url', COALESCE(NULLIF(current_setting('app.logo_url', true), ''), '/logo.png'), 'string', 'URL to organization logo', true, 'branding'),
('favicon_url', COALESCE(NULLIF(current_setting('app.favicon_url', true), ''), '/vite.svg'), 'string', 'URL to site favicon', true, 'branding'),
('welcome_message', 'Welcome to the Help Desk', 'string', 'Welcome message displayed on kiosks', true, 'kiosk'),
('help_message', 'Need to report an issue?', 'string', 'Help message displayed on kiosks', true, 'kiosk'),
('status_open_msg', 'Open', 'string', 'Message displayed when status is open', true, 'kiosk'),
('status_closed_msg', 'Closed', 'string', 'Message displayed when status is closed', true, 'kiosk'),
('status_error_msg', 'Error', 'string', 'Message displayed when status is error', true, 'kiosk'),
('status_meeting_msg', 'In a Meeting - Back Soon', 'string', 'Message displayed when in meeting', true, 'kiosk'),
('status_brb_msg', 'Be Right Back', 'string', 'Message displayed when temporarily away', true, 'kiosk'),
('status_lunch_msg', 'Out to Lunch - Back in 1 Hour', 'string', 'Message displayed during lunch', true, 'kiosk'),
('status_unavailable_msg', 'Status Unavailable', 'string', 'Message displayed when status unavailable', true, 'kiosk'),
('min_pin_length', COALESCE(NULLIF(current_setting('app.min_pin_length', true), ''), '4'), 'number', 'Minimum PIN length for kiosk access', false, 'security'),
('max_pin_length', COALESCE(NULLIF(current_setting('app.max_pin_length', true), ''), '8'), 'number', 'Maximum PIN length for kiosk access', false, 'security'),
('session_timeout', '3600', 'number', 'Session timeout in seconds', false, 'security'),
('max_login_attempts', '5', 'number', 'Maximum login attempts before account lockout', false, 'security'),
('lockout_duration', '900', 'number', 'Account lockout duration in seconds', false, 'security'),
('password_min_length', '8', 'number', 'Minimum password length', false, 'security'),
('password_require_special', 'true', 'boolean', 'Require special characters in passwords', false, 'security'),
('password_require_numbers', 'true', 'boolean', 'Require numbers in passwords', false, 'security'),
('password_require_uppercase', 'true', 'boolean', 'Require uppercase letters in passwords', false, 'security'),
('log_retention_days', '90', 'number', 'Days to retain logs before automatic deletion', false, 'maintenance'),
('backup_enabled', 'true', 'boolean', 'Enable automatic database backups', false, 'maintenance'),
('backup_interval_hours', '24', 'number', 'Hours between automatic backups', false, 'maintenance'),
('directory_enabled', 'false', 'boolean', 'Enable directory integration', false, 'directory'),
('directory_provider', 'mock', 'string', 'Directory service provider', false, 'directory'),
('directory_url', '', 'string', 'Directory service URL', false, 'directory'),
('directory_sync_interval', '3600', 'number', 'Directory sync interval in seconds', false, 'directory'),
('email_enabled', 'true', 'boolean', 'Enable email notifications', false, 'email'),
('email_from_address', 'noreply@localhost', 'string', 'From address for email notifications', false, 'email'),
('email_from_name', 'Nova Universe Support', 'string', 'From name for email notifications', false, 'email')
ON CONFLICT (key) DO NOTHING;

-- Insert default SMTP integration configuration
INSERT INTO config (key, value, value_type, description, is_public, category) VALUES 
('integration_smtp', '{"enabled": true, "config": {"host": "", "port": 587, "secure": false, "username": "", "password": ""}, "updatedAt": "' || CURRENT_TIMESTAMP || '"}', 'json', 'SMTP email integration configuration', false, 'integrations')
ON CONFLICT (key) DO NOTHING;

-- Insert default directory integration
INSERT INTO directory_integrations (id, provider, enabled, settings) VALUES 
(1, 'mock', false, '{"description": "Mock directory for testing"}')
ON CONFLICT (id) DO NOTHING;

-- Insert default admin PIN configuration
INSERT INTO admin_pins (id, global_pin, kiosk_pins) VALUES 
(1, NULL, '{}')
ON CONFLICT (id) DO NOTHING;

-- Reset sequences to ensure proper auto-increment
SELECT setval('roles_id_seq', COALESCE((SELECT MAX(id) FROM roles), 0) + 1, false);
SELECT setval('permissions_id_seq', COALESCE((SELECT MAX(id) FROM permissions), 0) + 1, false);
SELECT setval('directory_integrations_id_seq', COALESCE((SELECT MAX(id) FROM directory_integrations), 0) + 1, false);
