-- Add email verification fields to users table
-- Migration: 20250110000001_add_email_verification.sql

-- Add columns for email verification
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS email_verified BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS email_verification_token TEXT,
ADD COLUMN IF NOT EXISTS email_verification_expires_at TIMESTAMP;

-- Create index for performance on email verification lookups
CREATE INDEX IF NOT EXISTS idx_users_email_verification_token ON users(email_verification_token) WHERE email_verification_token IS NOT NULL;

-- Create index for performance on email verification status
CREATE INDEX IF NOT EXISTS idx_users_email_verified ON users(email_verified);

-- Update existing users to have verified emails (backward compatibility)
UPDATE users SET email_verified = TRUE WHERE email_verification_token IS NULL;