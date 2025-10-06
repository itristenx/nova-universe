-- Comprehensive Audit Logging Schema
-- Tracks all security-relevant events and user actions

-- Create audit logs table
CREATE TABLE IF NOT EXISTS audit_logs (
  id BIGSERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
  action VARCHAR(100) NOT NULL,
  resource_type VARCHAR(50),
  resource_id VARCHAR(100),
  ip_address INET,
  user_agent TEXT,
  request_method VARCHAR(10),
  request_path TEXT,
  status_code INTEGER,
  error_message TEXT,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  session_id VARCHAR(255),
  tenant_id UUID REFERENCES tenants(id) ON DELETE SET NULL
);

-- Create indexes for common queries
CREATE INDEX IF NOT EXISTS idx_audit_logs_user_id ON audit_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_action ON audit_logs(action);
CREATE INDEX IF NOT EXISTS idx_audit_logs_created_at ON audit_logs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_audit_logs_resource ON audit_logs(resource_type, resource_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_ip_address ON audit_logs(ip_address);
CREATE INDEX IF NOT EXISTS idx_audit_logs_tenant_id ON audit_logs(tenant_id);

-- Create GIN index for JSONB metadata searches
CREATE INDEX IF NOT EXISTS idx_audit_logs_metadata ON audit_logs USING gin(metadata);

-- Create security events table for critical security events
CREATE TABLE IF NOT EXISTS security_events (
  id BIGSERIAL PRIMARY KEY,
  event_type VARCHAR(50) NOT NULL,
  severity VARCHAR(20) NOT NULL CHECK (severity IN ('low', 'medium', 'high', 'critical')),
  user_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
  ip_address INET,
  details JSONB DEFAULT '{}',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  resolved BOOLEAN DEFAULT FALSE,
  resolved_at TIMESTAMP,
  resolved_by INTEGER REFERENCES users(id) ON DELETE SET NULL
);

-- Create indexes for security events
CREATE INDEX IF NOT EXISTS idx_security_events_type ON security_events(event_type);
CREATE INDEX IF NOT EXISTS idx_security_events_severity ON security_events(severity);
CREATE INDEX IF NOT EXISTS idx_security_events_created_at ON security_events(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_security_events_resolved ON security_events(resolved);
CREATE INDEX IF NOT EXISTS idx_security_events_user_id ON security_events(user_id);

-- Add comments
COMMENT ON TABLE audit_logs IS 'Comprehensive audit trail of all user actions and API requests';
COMMENT ON TABLE security_events IS 'Critical security events requiring attention';
COMMENT ON COLUMN audit_logs.action IS 'The action performed (e.g., login, logout, create_ticket, delete_user)';
COMMENT ON COLUMN audit_logs.resource_type IS 'Type of resource affected (e.g., ticket, user, asset)';
COMMENT ON COLUMN audit_logs.resource_id IS 'ID of the affected resource';
COMMENT ON COLUMN audit_logs.metadata IS 'Additional context and details about the action';
COMMENT ON COLUMN security_events.severity IS 'Severity level: low, medium, high, or critical';

-- Create function to automatically clean old audit logs (retention policy)
CREATE OR REPLACE FUNCTION clean_old_audit_logs()
RETURNS void AS $$
BEGIN
  -- Delete audit logs older than 1 year (adjust as needed)
  DELETE FROM audit_logs 
  WHERE created_at < NOW() - INTERVAL '1 year';
  
  -- Delete resolved security events older than 90 days
  DELETE FROM security_events 
  WHERE resolved = TRUE 
    AND resolved_at < NOW() - INTERVAL '90 days';
END;
$$ LANGUAGE plpgsql;

-- Create view for recent security events
CREATE OR REPLACE VIEW recent_security_events AS
SELECT 
  se.*,
  u.email as user_email,
  u.name as user_name,
  rb.email as resolved_by_email,
  rb.name as resolved_by_name
FROM security_events se
LEFT JOIN users u ON se.user_id = u.id
LEFT JOIN users rb ON se.resolved_by = rb.id
WHERE se.created_at > NOW() - INTERVAL '30 days'
ORDER BY se.created_at DESC;

-- Create view for user activity summary
CREATE OR REPLACE VIEW user_activity_summary AS
SELECT 
  u.id as user_id,
  u.email,
  u.name,
  COUNT(*) as total_actions,
  COUNT(CASE WHEN al.action LIKE '%login%' THEN 1 END) as login_count,
  COUNT(CASE WHEN al.action LIKE '%failed%' THEN 1 END) as failed_actions,
  MAX(al.created_at) as last_activity,
  COUNT(DISTINCT al.ip_address) as unique_ips
FROM users u
LEFT JOIN audit_logs al ON u.id = al.user_id
WHERE al.created_at > NOW() - INTERVAL '30 days'
GROUP BY u.id, u.email, u.name;
