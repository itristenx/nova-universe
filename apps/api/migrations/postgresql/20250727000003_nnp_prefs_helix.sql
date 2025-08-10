-- Helix user data expansion for NNP preferences (stubbed minimal viable)
-- In a real deployment, this would live in the auth/Helix schema. Here we store JSON in users.metadata

ALTER TABLE IF EXISTS users
  ADD COLUMN IF NOT EXISTS metadata JSONB DEFAULT '{}'::jsonb;

-- Optionally, create a materialized view or table to cache per-user notification prefs
CREATE TABLE IF NOT EXISTS nova_user_notification_prefs (
  user_id TEXT PRIMARY KEY,
  prefs JSONB NOT NULL DEFAULT '{}',
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_nnp_user_prefs_updated ON nova_user_notification_prefs(updated_at DESC);