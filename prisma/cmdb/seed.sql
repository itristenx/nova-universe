-- CMDB Seed Data - Initial CI Types and Relationship Types
-- This script populates the CMDB with standard ITIL CI types and relationship types

-- ============================================================================
-- CI TYPES (Following ITIL Standards)
-- ============================================================================

-- Hardware CI Types
INSERT INTO ci_types (id, name, display_name, description, category, icon, color, default_status, allowed_statuses, is_active, attribute_schema) VALUES
('hw-computer', 'computer', 'Computer', 'Desktop computers, laptops, and workstations', 'Hardware', 'monitor', '#3B82F6', 'Active', ARRAY['Active', 'Inactive', 'Retired', 'Under Maintenance'], true, '{"processor": {"type": "string"}, "memory": {"type": "string"}, "storage": {"type": "string"}, "operatingSystem": {"type": "string"}}'),
('hw-server', 'server', 'Server', 'Physical and virtual servers', 'Hardware', 'server', '#059669', 'Active', ARRAY['Active', 'Inactive', 'Retired', 'Under Maintenance'], true, '{"processor": {"type": "string"}, "memory": {"type": "string"}, "storage": {"type": "string"}, "rackUnit": {"type": "integer"}}'),
('hw-network', 'network-device', 'Network Device', 'Routers, switches, firewalls, and other network equipment', 'Hardware', 'globe', '#7C3AED', 'Active', ARRAY['Active', 'Inactive', 'Retired', 'Under Maintenance'], true, '{"ports": {"type": "integer"}, "firmware": {"type": "string"}, "managementIp": {"type": "string"}}'),
('hw-storage', 'storage-device', 'Storage Device', 'SAN, NAS, and other storage systems', 'Hardware', 'database', '#DC2626', 'Active', ARRAY['Active', 'Inactive', 'Retired', 'Under Maintenance'], true, '{"capacity": {"type": "string"}, "raidLevel": {"type": "string"}, "connectionType": {"type": "string"}}'),
('hw-printer', 'printer', 'Printer', 'Printers and multifunction devices', 'Hardware', 'printer', '#9333EA', 'Active', ARRAY['Active', 'Inactive', 'Retired', 'Under Maintenance'], true, '{"model": {"type": "string"}, "networkEnabled": {"type": "boolean"}, "location": {"type": "string"}}'),
('hw-mobile', 'mobile-device', 'Mobile Device', 'Smartphones, tablets, and other mobile devices', 'Hardware', 'smartphone', '#F59E0B', 'Active', ARRAY['Active', 'Inactive', 'Retired', 'Lost'], true, '{"imei": {"type": "string"}, "carrier": {"type": "string"}, "plan": {"type": "string"}}');

-- Software CI Types
INSERT INTO ci_types (id, name, display_name, description, category, icon, color, default_status, allowed_statuses, is_active, attribute_schema) VALUES
('sw-application', 'application', 'Application', 'Business applications and software', 'Software', 'app-window', '#10B981', 'Active', ARRAY['Active', 'Inactive', 'Retired', 'Development', 'Testing'], true, '{"version": {"type": "string"}, "vendor": {"type": "string"}, "licenseType": {"type": "string"}, "supportLevel": {"type": "string"}}'),
('sw-operating-system', 'operating-system', 'Operating System', 'Windows, Linux, macOS, and other operating systems', 'Software', 'terminal', '#6366F1', 'Active', ARRAY['Active', 'Inactive', 'Retired', 'End of Life'], true, '{"version": {"type": "string"}, "architecture": {"type": "string"}, "servicePackLevel": {"type": "string"}}'),
('sw-database', 'database', 'Database', 'Database management systems', 'Software', 'database', '#EF4444', 'Active', ARRAY['Active', 'Inactive', 'Retired', 'Maintenance'], true, '{"engine": {"type": "string"}, "version": {"type": "string"}, "port": {"type": "integer"}, "size": {"type": "string"}}'),
('sw-middleware', 'middleware', 'Middleware', 'Application servers, message queues, and integration software', 'Software', 'layers', '#8B5CF6', 'Active', ARRAY['Active', 'Inactive', 'Retired', 'Maintenance'], true, '{"type": {"type": "string"}, "version": {"type": "string"}, "port": {"type": "integer"}}');

-- Service CI Types  
INSERT INTO ci_types (id, name, display_name, description, category, icon, color, default_status, allowed_statuses, is_active, attribute_schema) VALUES
('svc-business', 'business-service', 'Business Service', 'Services provided to business users', 'Service', 'briefcase', '#059669', 'Active', ARRAY['Active', 'Inactive', 'Retired', 'Under Development'], true, '{"businessOwner": {"type": "string"}, "criticality": {"type": "string"}, "slaTarget": {"type": "string"}}'),
('svc-technical', 'technical-service', 'Technical Service', 'Infrastructure and technical services', 'Service', 'cog', '#7C3AED', 'Active', ARRAY['Active', 'Inactive', 'Retired', 'Maintenance'], true, '{"technicalOwner": {"type": "string"}, "serviceHours": {"type": "string"}, "monitoringEnabled": {"type": "boolean"}}'),
('svc-cloud', 'cloud-service', 'Cloud Service', 'Cloud-based services and resources', 'Service', 'cloud', '#0EA5E9', 'Active', ARRAY['Active', 'Inactive', 'Retired', 'Migrating'], true, '{"provider": {"type": "string"}, "region": {"type": "string"}, "serviceType": {"type": "string"}}');

-- Virtual CI Types
INSERT INTO ci_types (id, name, display_name, description, category, icon, color, default_status, allowed_statuses, is_active, attribute_schema) VALUES
('vt-virtual-machine', 'virtual-machine', 'Virtual Machine', 'Virtual machines and containers', 'Virtual', 'box', '#06B6D4', 'Active', ARRAY['Active', 'Inactive', 'Retired', 'Suspended'], true, '{"hypervisor": {"type": "string"}, "allocatedMemory": {"type": "string"}, "allocatedCpu": {"type": "integer"}, "allocatedStorage": {"type": "string"}}'),
('vt-container', 'container', 'Container', 'Docker containers and Kubernetes pods', 'Virtual', 'package', '#84CC16', 'Active', ARRAY['Active', 'Inactive', 'Retired', 'Stopped'], true, '{"image": {"type": "string"}, "orchestrator": {"type": "string"}, "namespace": {"type": "string"}}');

-- Facility CI Types
INSERT INTO ci_types (id, name, display_name, description, category, icon, color, default_status, allowed_statuses, is_active, attribute_schema) VALUES
('fc-datacenter', 'datacenter', 'Data Center', 'Data centers and server rooms', 'Facility', 'building', '#6B7280', 'Active', ARRAY['Active', 'Inactive', 'Under Construction', 'Decommissioned'], true, '{"address": {"type": "string"}, "powerCapacity": {"type": "string"}, "coolingCapacity": {"type": "string"}}'),
('fc-office', 'office', 'Office', 'Office buildings and locations', 'Facility', 'home', '#9CA3AF', 'Active', ARRAY['Active', 'Inactive', 'Under Construction', 'Closed'], true, '{"address": {"type": "string"}, "capacity": {"type": "integer"}, "securityLevel": {"type": "string"}}');

-- Documentation CI Types
INSERT INTO ci_types (id, name, display_name, description, category, icon, color, default_status, allowed_statuses, is_active, attribute_schema) VALUES
('doc-procedure', 'procedure', 'Procedure', 'Standard operating procedures and workflows', 'Documentation', 'file-text', '#F59E0B', 'Active', ARRAY['Active', 'Draft', 'Under Review', 'Archived'], true, '{"documentType": {"type": "string"}, "reviewer": {"type": "string"}, "nextReviewDate": {"type": "string"}}'),
('doc-policy', 'policy', 'Policy', 'IT policies and governance documents', 'Documentation', 'shield', '#EF4444', 'Active', ARRAY['Active', 'Draft', 'Under Review', 'Archived'], true, '{"policyType": {"type": "string"}, "approver": {"type": "string"}, "effectiveDate": {"type": "string"}}');

-- ============================================================================
-- CI RELATIONSHIP TYPES (Following ITIL Standards)
-- ============================================================================

-- Dependencies
INSERT INTO ci_relationship_types (id, name, display_name, description, is_directional, category) VALUES
('rel-depends-on', 'depends-on', 'Depends On', 'Source CI depends on target CI for operation', true, 'Dependency'),
('rel-supports', 'supports', 'Supports', 'Source CI supports the operation of target CI', true, 'Dependency'),
('rel-uses', 'uses', 'Uses', 'Source CI uses target CI', true, 'Dependency'),
('rel-requires', 'requires', 'Requires', 'Source CI requires target CI to function', true, 'Dependency');

-- Containment
INSERT INTO ci_relationship_types (id, name, display_name, description, is_directional, category) VALUES
('rel-contains', 'contains', 'Contains', 'Source CI physically or logically contains target CI', true, 'Containment'),
('rel-hosted-on', 'hosted-on', 'Hosted On', 'Source CI is hosted on target CI', true, 'Containment'),
('rel-installed-on', 'installed-on', 'Installed On', 'Source CI is installed on target CI', true, 'Containment'),
('rel-runs-on', 'runs-on', 'Runs On', 'Source CI runs on target CI', true, 'Containment');

-- Connectivity
INSERT INTO ci_relationship_types (id, name, display_name, description, is_directional, category) VALUES
('rel-connected-to', 'connected-to', 'Connected To', 'Source CI is physically or logically connected to target CI', false, 'Connection'),
('rel-communicates-with', 'communicates-with', 'Communicates With', 'Source CI communicates with target CI', false, 'Connection'),
('rel-backed-up-by', 'backed-up-by', 'Backed Up By', 'Source CI is backed up by target CI', true, 'Connection');

-- Service Relationships
INSERT INTO ci_relationship_types (id, name, display_name, description, is_directional, category) VALUES
('rel-provides-service', 'provides-service', 'Provides Service', 'Source CI provides service to target CI', true, 'Service'),
('rel-consumes-service', 'consumes-service', 'Consumes Service', 'Source CI consumes service from target CI', true, 'Service'),
('rel-monitors', 'monitors', 'Monitors', 'Source CI monitors target CI', true, 'Service');

-- Logical Relationships
INSERT INTO ci_relationship_types (id, name, display_name, description, is_directional, category) VALUES
('rel-member-of', 'member-of', 'Member Of', 'Source CI is a member of target CI group/cluster', true, 'Logical'),
('rel-redundant-with', 'redundant-with', 'Redundant With', 'Source CI provides redundancy for target CI', false, 'Logical'),
('rel-fail-over-to', 'fail-over-to', 'Fail Over To', 'Source CI fails over to target CI', true, 'Logical');

-- ============================================================================
-- SAMPLE BUSINESS SERVICES
-- ============================================================================

INSERT INTO business_services (id, name, description, business_owner, technical_owner, criticality, availability_target) VALUES
('bs-email', 'Email Service', 'Corporate email and messaging service', 'IT Director', 'Email Administrator', 'Critical', 99.9),
('bs-erp', 'ERP System', 'Enterprise Resource Planning system', 'CFO', 'ERP Administrator', 'Critical', 99.5),
('bs-helpdesk', 'Help Desk', 'IT support and service desk', 'IT Manager', 'Help Desk Manager', 'High', 99.0),
('bs-website', 'Corporate Website', 'Public-facing corporate website', 'Marketing Director', 'Web Administrator', 'Medium', 98.0),
('bs-backup', 'Backup Service', 'Data backup and recovery service', 'IT Director', 'Backup Administrator', 'Critical', 99.9);

-- ============================================================================
-- INITIAL DISCOVERY SCHEDULES (Templates)
-- ============================================================================

INSERT INTO discovery_schedules (id, name, description, is_active, cron_expression, discovery_type, scope_configuration, next_run_date) VALUES
('ds-network-daily', 'Daily Network Discovery', 'Daily discovery of network devices and connectivity', false, '0 2 * * *', 'Network', '{"ipRange": "10.0.0.0/16", "scanPorts": [22, 80, 443, 161]}', NOW() + INTERVAL '1 day'),
('ds-windows-weekly', 'Weekly Windows Discovery', 'Weekly discovery of Windows computers and servers', false, '0 3 * * 0', 'Windows', '{"domains": ["corp.local"], "scanType": "full"}', NOW() + INTERVAL '7 days'),
('ds-linux-weekly', 'Weekly Linux Discovery', 'Weekly discovery of Linux servers and services', false, '0 4 * * 0', 'Linux', '{"sshKeyPath": "/etc/ssh/discovery_key", "scanType": "full"}', NOW() + INTERVAL '7 days'),
('ds-cloud-hourly', 'Hourly Cloud Discovery', 'Hourly discovery of cloud resources', false, '0 * * * *', 'Cloud', '{"providers": ["aws", "azure"], "regions": ["us-east-1", "eastus"]}', NOW() + INTERVAL '1 hour');

-- ============================================================================
-- SAMPLE DATA FOR DEMO
-- ============================================================================

-- Note: This would be populated by actual discovery or manual entry
-- For now, we'll create some basic sample CIs to demonstrate the system

-- Create some sample hardware CIs
INSERT INTO configuration_items (id, ci_id, name, display_name, description, ci_type, ci_status, environment, criticality, location, owner, technical_owner, serial_number, asset_tag, manufacturer, model, created_by, attributes) VALUES
('ci-srv001', 'CI100001', 'WEB-SERVER-01', 'Web Server 01', 'Primary web server for corporate website', 'hw-server', 'Active', 'Production', 'Critical', 'Datacenter-A-Rack-12', 'IT Director', 'Server Administrator', 'DL360G10-12345', 'SRV001', 'HPE', 'ProLiant DL360 Gen10', 'system', '{"processor": "Intel Xeon", "memory": "64GB", "storage": "1TB SSD"}'),
('ci-srv002', 'CI100002', 'DB-SERVER-01', 'Database Server 01', 'Primary database server', 'hw-server', 'Active', 'Production', 'Critical', 'Datacenter-A-Rack-13', 'IT Director', 'Database Administrator', 'DL380G10-67890', 'SRV002', 'HPE', 'ProLiant DL380 Gen10', 'system', '{"processor": "Intel Xeon", "memory": "128GB", "storage": "2TB SSD"}');

-- Create software CIs
INSERT INTO configuration_items (id, ci_id, name, display_name, description, ci_type, ci_status, environment, criticality, owner, technical_owner, created_by, attributes) VALUES
('ci-app001', 'CI200001', 'nova-universe-web', 'Nova Universe Web Application', 'Main Nova Universe web application', 'sw-application', 'Active', 'Production', 'Critical', 'IT Director', 'Development Team', 'system', '{"version": "2.0.0", "vendor": "Nova Corp", "technology": "Node.js"}'),
('ci-db001', 'CI200002', 'postgresql-main', 'PostgreSQL Main Database', 'Primary PostgreSQL database instance', 'sw-database', 'Active', 'Production', 'Critical', 'IT Director', 'Database Administrator', 'system', '{"engine": "PostgreSQL", "version": "14.8", "port": 5432}');

-- Create some relationships
INSERT INTO ci_relationships (id, source_ci_id, target_ci_id, relationship_type_id, description, criticality, created_by) VALUES
('rel-001', 'ci-app001', 'ci-srv001', 'rel-hosted-on', 'Web application hosted on web server', 'Critical', 'system'),
('rel-002', 'ci-db001', 'ci-srv002', 'rel-hosted-on', 'Database hosted on database server', 'Critical', 'system'),
('rel-003', 'ci-app001', 'ci-db001', 'rel-depends-on', 'Web application depends on database', 'Critical', 'system');

-- Map CIs to business services
INSERT INTO ci_business_services (ci_id, business_service_id, relationship_type, criticality) VALUES
('ci-srv001', 'bs-website', 'Supports', 'Critical'),
('ci-srv002', 'bs-website', 'Supports', 'Critical'),
('ci-app001', 'bs-website', 'Provides', 'Critical'),
('ci-db001', 'bs-website', 'Supports', 'Critical');
