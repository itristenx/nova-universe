-- Add email_accounts table for M365 integration
CREATE TYPE IF NOT EXISTS "QueueType" AS ENUM ('IT','HR','OPS','CYBER');

CREATE TABLE IF NOT EXISTS email_accounts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    queue "QueueType" NOT NULL,
    address VARCHAR(255) UNIQUE NOT NULL,
    display_name VARCHAR(255),
    enabled BOOLEAN NOT NULL DEFAULT TRUE,
    graph_impersonation BOOLEAN NOT NULL DEFAULT FALSE,
    auto_create_tickets BOOLEAN NOT NULL DEFAULT TRUE,
    webhook_mode BOOLEAN NOT NULL DEFAULT FALSE,
    last_synced TIMESTAMP
);
