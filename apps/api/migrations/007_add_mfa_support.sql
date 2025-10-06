-- Multi-Factor Authentication (MFA) Database Schema
-- Adds MFA support to users table and creates backup codes table

-- Add MFA columns to users table
ALTER TABLE users ADD COLUMN IF NOT EXISTS mfa_enabled BOOLEAN DEFAULT FALSE;
ALTER TABLE users ADD COLUMN IF NOT EXISTS mfa_secret TEXT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS mfa_enabled_at TIMESTAMP;
ALTER TABLE users ADD COLUMN IF NOT EXISTS mfa_disabled_at TIMESTAMP;

-- Create MFA backup codes table
CREATE TABLE IF NOT EXISTS mfa_backup_codes (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  code_hash TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  used_at TIMESTAMP,
  CONSTRAINT fk_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_mfa_backup_codes_user_id ON mfa_backup_codes(user_id);
CREATE INDEX IF NOT EXISTS idx_mfa_backup_codes_used_at ON mfa_backup_codes(used_at);

-- Add comment
COMMENT ON TABLE mfa_backup_codes IS 'Stores hashed backup codes for MFA recovery';
COMMENT ON COLUMN users.mfa_enabled IS 'Whether MFA is enabled for this user';
COMMENT ON COLUMN users.mfa_secret IS 'Encrypted TOTP secret for MFA';
COMMENT ON COLUMN users.mfa_enabled_at IS 'Timestamp when MFA was enabled';
COMMENT ON COLUMN users.mfa_disabled_at IS 'Timestamp when MFA was last disabled';
