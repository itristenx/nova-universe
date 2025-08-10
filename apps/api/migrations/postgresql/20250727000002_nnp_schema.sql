-- Nova Notification Platform (NNP) core schema
-- Creates event store, delivery logs, and preference metadata

CREATE TABLE IF NOT EXISTS nova_notification_events (
  id TEXT PRIMARY KEY,
  module TEXT NOT NULL,
  type TEXT NOT NULL,
  priority TEXT NOT NULL DEFAULT 'normal' CHECK (priority IN ('low','normal','high','critical')),
  title TEXT NOT NULL,
  message TEXT,
  timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  recipient_roles TEXT[] DEFAULT ARRAY[]::TEXT[],
  recipient_users TEXT[] DEFAULT ARRAY[]::TEXT[],
  actions JSONB DEFAULT '[]',
  metadata JSONB DEFAULT '{}'
);

CREATE INDEX IF NOT EXISTS idx_nnp_events_timestamp ON nova_notification_events(timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_nnp_events_module_type ON nova_notification_events(module, type);

CREATE TABLE IF NOT EXISTS nova_notification_deliveries (
  id BIGSERIAL PRIMARY KEY,
  event_id TEXT NOT NULL REFERENCES nova_notification_events(id) ON DELETE CASCADE,
  user_id TEXT,
  channel TEXT NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('sent','failed','queued')),
  error TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_nnp_deliveries_event ON nova_notification_deliveries(event_id);
CREATE INDEX IF NOT EXISTS idx_nnp_deliveries_user ON nova_notification_deliveries(user_id);
CREATE INDEX IF NOT EXISTS idx_nnp_deliveries_created_at ON nova_notification_deliveries(created_at DESC);

-- Optional: per-tenant channel registry (lightweight placeholder)
CREATE TABLE IF NOT EXISTS nova_notification_channels (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  name TEXT NOT NULL,
  type TEXT NOT NULL,
  config JSONB DEFAULT '{}',
  tenant_id TEXT,
  is_active BOOLEAN DEFAULT TRUE,
  is_default BOOLEAN DEFAULT FALSE,
  created_by TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_nnp_channels_tenant ON nova_notification_channels(tenant_id);