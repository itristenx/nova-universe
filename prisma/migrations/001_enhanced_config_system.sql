-- CreateTable - Enhanced Configuration System Migration
-- This migration enhances the existing config table and adds supporting tables

-- Add new columns to existing config table
ALTER TABLE "config" ADD COLUMN "subcategory" TEXT;
ALTER TABLE "config" ADD COLUMN "is_ui_editable" BOOLEAN NOT NULL DEFAULT true;
ALTER TABLE "config" ADD COLUMN "is_required" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "config" ADD COLUMN "default_value" TEXT;
ALTER TABLE "config" ADD COLUMN "validation_rules" JSONB;
ALTER TABLE "config" ADD COLUMN "display_order" INTEGER;
ALTER TABLE "config" ADD COLUMN "help_text" TEXT;
ALTER TABLE "config" ADD COLUMN "is_advanced" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "config" ADD COLUMN "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;
ALTER TABLE "config" ADD COLUMN "updated_by" TEXT;

-- Update existing is_public column to have proper default
ALTER TABLE "config" ALTER COLUMN "is_public" SET NOT NULL;
ALTER TABLE "config" ALTER COLUMN "is_public" SET DEFAULT false;

-- CreateTable - Config History
CREATE TABLE "config_history" (
    "id" SERIAL NOT NULL,
    "config_key" TEXT NOT NULL,
    "old_value" TEXT,
    "new_value" TEXT,
    "changed_by" TEXT,
    "change_reason" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "config_history_pkey" PRIMARY KEY ("id")
);

-- CreateTable - Config Templates
CREATE TABLE "config_templates" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "category" TEXT NOT NULL,
    "template" JSONB NOT NULL,
    "is_default" BOOLEAN NOT NULL DEFAULT false,
    "created_by" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "config_templates_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "config_templates_name_key" ON "config_templates"("name");

-- AddForeignKey
ALTER TABLE "config_history" ADD CONSTRAINT "config_history_config_key_fkey" FOREIGN KEY ("config_key") REFERENCES "config"("key") ON DELETE CASCADE ON UPDATE CASCADE;

-- Insert default configuration values
INSERT INTO "config" (
    "key", "value", "value_type", "description", "category", "subcategory", 
    "is_ui_editable", "is_required", "default_value", "display_order", "help_text"
) VALUES
-- Branding Configuration
('organization.name', 'Nova Universe', 'string', 'Organization display name', 'branding', 'identity', true, false, 'Nova Universe', 1, 'The name of your organization as displayed throughout the application'),
('organization.logo_url', '/logo.png', 'string', 'Organization logo URL', 'branding', 'identity', true, false, '/logo.png', 2, 'URL or path to your organization logo. Recommended size: 200x50px'),
('organization.favicon_url', '/vite.svg', 'string', 'Browser favicon URL', 'branding', 'identity', true, false, '/vite.svg', 3, 'URL or path to your favicon. Must be .ico, .png, or .svg format'),
('organization.primary_color', '#3b82f6', 'string', 'Primary brand color', 'branding', 'colors', true, false, '#3b82f6', 4, 'Primary color used throughout the application (hex format)'),
('organization.secondary_color', '#64748b', 'string', 'Secondary brand color', 'branding', 'colors', true, false, '#64748b', 5, 'Secondary color used for accents and highlights (hex format)'),

-- Application Messages
('messages.welcome', 'Welcome to the Help Desk', 'string', 'Main welcome message', 'branding', 'messages', true, false, 'Welcome to the Help Desk', 6, 'Welcome message displayed on the main page'),
('messages.help', 'Need to report an issue?', 'string', 'Help prompt message', 'branding', 'messages', true, false, 'Need to report an issue?', 7, 'Help text displayed to guide users'),

-- Status Messages
('status.open', 'Open', 'string', 'Open status message', 'branding', 'status', true, false, 'Open', 8, 'Message displayed when help desk is open'),
('status.closed', 'Closed', 'string', 'Closed status message', 'branding', 'status', true, false, 'Closed', 9, 'Message displayed when help desk is closed'),
('status.error', 'Error', 'string', 'Error status message', 'branding', 'status', true, false, 'Error', 10, 'Message displayed when there is a system error'),
('status.meeting', 'In a Meeting - Back Soon', 'string', 'Meeting status message', 'branding', 'status', true, false, 'In a Meeting - Back Soon', 11, 'Message displayed when staff is in a meeting'),
('status.brb', 'Be Right Back', 'string', 'BRB status message', 'branding', 'status', true, false, 'Be Right Back', 12, 'Message displayed for short breaks'),
('status.lunch', 'Out to Lunch - Back in 1 Hour', 'string', 'Lunch status message', 'branding', 'status', true, false, 'Out to Lunch - Back in 1 Hour', 13, 'Message displayed during lunch breaks'),
('status.unavailable', 'Status Unavailable', 'string', 'Unavailable status message', 'branding', 'status', true, false, 'Status Unavailable', 14, 'Message displayed when status cannot be determined'),

-- Security Policies
('security.min_pin_length', '4', 'number', 'Minimum PIN length', 'security', 'policies', true, false, '4', 15, 'Minimum number of digits required for PIN codes'),
('security.max_pin_length', '8', 'number', 'Maximum PIN length', 'security', 'policies', true, false, '8', 'Maximum number of digits allowed for PIN codes'),

-- Rate Limiting
('security.rate_limit_window', '900000', 'number', 'Rate limit window (ms)', 'security', 'rate_limiting', true, false, '900000', 16, 'Time window for rate limiting in milliseconds (15 minutes default)'),
('security.rate_limit_max', '100', 'number', 'Maximum requests per window', 'security', 'rate_limiting', true, false, '100', 17, 'Maximum number of requests allowed per rate limit window'),
('security.submit_ticket_limit', '10', 'number', 'Ticket submission limit', 'security', 'rate_limiting', true, false, '10', 18, 'Maximum ticket submissions per rate limit window'),
('security.api_login_limit', '5', 'number', 'API login attempt limit', 'security', 'rate_limiting', true, false, '5', 19, 'Maximum login attempts per rate limit window'),

-- Feature Toggles
('features.directory_enabled', 'false', 'boolean', 'Enable directory integration', 'features', 'integrations', true, false, 'false', 20, 'Enable LDAP/Active Directory integration for user management'),
('features.cosmo_enabled', 'true', 'boolean', 'Enable Cosmo AI assistant', 'features', 'ai', true, false, 'true', 21, 'Enable the Cosmo AI assistant for enhanced user support'),
('features.ai_ticket_processing', 'true', 'boolean', 'Enable AI ticket processing', 'features', 'ai', true, false, 'true', 22, 'Enable automatic AI processing and classification of support tickets'),
('features.sentiment_analysis', 'true', 'boolean', 'Enable sentiment analysis', 'features', 'ai', true, false, 'true', 23, 'Enable AI-powered sentiment analysis of tickets and communications'),

-- Integration Settings
('integrations.directory_provider', 'mock', 'string', 'Directory provider type', 'integrations', 'directory', true, false, 'mock', 24, 'Type of directory provider (mock, ldap, azure_ad, okta)'),
('integrations.cosmo_model_provider', 'openai', 'string', 'AI model provider', 'integrations', 'ai', true, false, 'openai', 25, 'AI model provider for Cosmo assistant (openai, anthropic, azure)'),
('integrations.cosmo_personality', 'friendly_professional', 'string', 'Cosmo personality type', 'integrations', 'ai', true, false, 'friendly_professional', 26, 'Personality type for the Cosmo AI assistant')

ON CONFLICT (key) DO UPDATE SET
    value_type = EXCLUDED.value_type,
    description = EXCLUDED.description,
    category = EXCLUDED.category,
    subcategory = EXCLUDED.subcategory,
    is_ui_editable = EXCLUDED.is_ui_editable,
    is_required = EXCLUDED.is_required,
    default_value = EXCLUDED.default_value,
    display_order = EXCLUDED.display_order,
    help_text = EXCLUDED.help_text;

-- Insert default config templates
INSERT INTO "config_templates" ("name", "description", "category", "template", "is_default") VALUES
('Default Branding', 'Default branding configuration for new installations', 'branding', '{
  "organization.name": "Your Organization",
  "organization.logo_url": "/logo.png",
  "organization.favicon_url": "/vite.svg",
  "organization.primary_color": "#3b82f6",
  "organization.secondary_color": "#64748b",
  "messages.welcome": "Welcome to the Help Desk",
  "messages.help": "Need to report an issue?"
}', true),

('Security Baseline', 'Recommended security configuration', 'security', '{
  "security.min_pin_length": "6",
  "security.max_pin_length": "12",
  "security.rate_limit_window": "900000",
  "security.rate_limit_max": "100",
  "security.submit_ticket_limit": "5",
  "security.api_login_limit": "3"
}', true),

('AI Features Enabled', 'Full AI feature set enabled', 'features', '{
  "features.cosmo_enabled": "true",
  "features.ai_ticket_processing": "true",
  "features.sentiment_analysis": "true",
  "integrations.cosmo_model_provider": "openai",
  "integrations.cosmo_personality": "friendly_professional"
}', false);
