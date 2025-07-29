-- Migration: Add email_accounts table for M365 integration
CREATE TABLE IF NOT EXISTS email_accounts (
    id SERIAL PRIMARY KEY,
    queue VARCHAR(16) NOT NULL CHECK (queue IN ('IT', 'HR', 'OPS', 'CYBER')),
    address VARCHAR(255) NOT NULL UNIQUE,
    display_name VARCHAR(255),
    enabled BOOLEAN DEFAULT TRUE,
    graph_impersonation BOOLEAN DEFAULT FALSE,
    auto_create_tickets BOOLEAN DEFAULT TRUE,
    webhook_mode BOOLEAN DEFAULT FALSE,
    last_synced TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Index for quick lookup by address
CREATE INDEX IF NOT EXISTS idx_email_accounts_address ON email_accounts(address);

-- Index for queue
CREATE INDEX IF NOT EXISTS idx_email_accounts_queue ON email_accounts(queue);
