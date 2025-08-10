-- AI audit and governance tables
CREATE TABLE IF NOT EXISTS ai_audit_events (
  id uuid PRIMARY KEY,
  event_type text NOT NULL,
  actor_type text NOT NULL,
  actor_id text,
  tenant_id text,
  provider text NOT NULL,
  model text,
  request_payload jsonb,
  response_metadata jsonb,
  pii_redacted boolean DEFAULT true,
  tokens_in integer DEFAULT 0,
  tokens_out integer DEFAULT 0,
  cost_usd numeric(12,6) DEFAULT 0,
  success boolean DEFAULT true,
  error_message text,
  created_at timestamptz NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_ai_audit_created_at ON ai_audit_events (created_at DESC);
CREATE INDEX IF NOT EXISTS idx_ai_audit_actor ON ai_audit_events (actor_id);
CREATE INDEX IF NOT EXISTS idx_ai_audit_tenant ON ai_audit_events (tenant_id);
CREATE INDEX IF NOT EXISTS idx_ai_audit_provider ON ai_audit_events (provider);

-- Policy table for runtime guardrails
CREATE TABLE IF NOT EXISTS ai_policies (
  id uuid PRIMARY KEY,
  name text NOT NULL,
  description text,
  config jsonb NOT NULL,
  enabled boolean DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at timestamptz NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Feedback table for RLHF-like signal collection
CREATE TABLE IF NOT EXISTS ai_feedback (
  id uuid PRIMARY KEY,
  actor_id text,
  tenant_id text,
  provider text,
  model text,
  message_id text,
  rating integer CHECK (rating BETWEEN 1 AND 5),
  feedback text,
  created_at timestamptz NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_ai_feedback_actor ON ai_feedback (actor_id);
CREATE INDEX IF NOT EXISTS idx_ai_feedback_tenant ON ai_feedback (tenant_id);