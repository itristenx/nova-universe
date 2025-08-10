-- CMDB schema (inspired by ServiceNow CSDM-lite)
CREATE TABLE IF NOT EXISTS cmdb_ci_classes (
  id SERIAL PRIMARY KEY,
  key TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  description TEXT,
  icon TEXT,
  parent_id INTEGER REFERENCES cmdb_ci_classes(id) ON DELETE SET NULL,
  attribute_schema JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS cmdb_configuration_items (
  id SERIAL PRIMARY KEY,
  class_id INTEGER NOT NULL REFERENCES cmdb_ci_classes(id) ON DELETE RESTRICT,
  name TEXT NOT NULL,
  attributes JSONB DEFAULT '{}'::jsonb,
  lifecycle_state TEXT DEFAULT 'active',
  environment TEXT,
  owner_user_id TEXT,
  owner_group_id TEXT,
  business_criticality TEXT,
  status TEXT DEFAULT 'operational',
  external_ref JSONB,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS cmdb_ci_relationships (
  id SERIAL PRIMARY KEY,
  source_ci_id INTEGER NOT NULL REFERENCES cmdb_configuration_items(id) ON DELETE CASCADE,
  target_ci_id INTEGER NOT NULL REFERENCES cmdb_configuration_items(id) ON DELETE CASCADE,
  type TEXT NOT NULL,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Useful indexes
CREATE INDEX IF NOT EXISTS idx_cmdb_ci_class_key ON cmdb_ci_classes(key);
CREATE INDEX IF NOT EXISTS idx_cmdb_ci_name ON cmdb_configuration_items USING gin ((to_tsvector('simple', name)));
CREATE INDEX IF NOT EXISTS idx_cmdb_ci_attributes ON cmdb_configuration_items USING gin (attributes);
CREATE INDEX IF NOT EXISTS idx_cmdb_rel_source ON cmdb_ci_relationships(source_ci_id);
CREATE INDEX IF NOT EXISTS idx_cmdb_rel_target ON cmdb_ci_relationships(target_ci_id);

-- Seed core classes if not present
INSERT INTO cmdb_ci_classes (key, name, description)
SELECT key, name, description FROM (
  VALUES
    ('service', 'Business Service', 'Top-level business service'),
    ('application', 'Application', 'Software application/service'),
    ('server', 'Server', 'Physical or virtual compute host'),
    ('database', 'Database', 'Database instance/schema'),
    ('network', 'Network Device', 'Switch/router/firewall/WiFi'),
    ('endpoint', 'Endpoint', 'Workstation/laptop/mobile device')
) AS seed(key, name, description)
WHERE NOT EXISTS (SELECT 1 FROM cmdb_ci_classes c WHERE c.key = seed.key);