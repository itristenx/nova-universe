-- Database Schema for Nova-Universe Platform

-- Users Table
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(50) NOT NULL UNIQUE,
    passwordHash VARCHAR(255) NOT NULL,
    role VARCHAR(20) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    "isDefault" BOOLEAN DEFAULT false,
    is_vip BOOLEAN DEFAULT false,
    vip_level VARCHAR(50),
    vip_sla_override JSON
);

-- Tickets Table
CREATE TABLE tickets (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    status VARCHAR(20) DEFAULT 'open',
    priority VARCHAR(20) DEFAULT 'medium',
    created_by INT REFERENCES users(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    vip_priority_score INT DEFAULT 0,
    vip_trigger_source VARCHAR(20)
);

-- Audit Logs Table
CREATE TABLE audit_logs (
    id SERIAL PRIMARY KEY,
    action VARCHAR(50) NOT NULL,
    user_id INT REFERENCES users(id),
    ticket_id INT REFERENCES tickets(id),
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- XP Events Table
CREATE TABLE xp_events (
    id SERIAL PRIMARY KEY,
    user_id TEXT REFERENCES users(id) ON DELETE CASCADE ON UPDATE CASCADE,
    amount INT NOT NULL,
    reason TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Leaderboard Table
CREATE TABLE leaderboard (
    user_id TEXT PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE ON UPDATE CASCADE,
    xp_total INT NOT NULL DEFAULT 0
);

-- Request Catalog Items Table
CREATE TABLE request_catalog_items (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    form_schema JSON,
    workflow_id INT
);

-- RITMs Table
CREATE TABLE ritms (
    id SERIAL PRIMARY KEY,
    req_id INT REFERENCES SupportTicket(id),
    catalog_item_id INT REFERENCES request_catalog_items(id),
    status VARCHAR(20) DEFAULT 'open'
);

-- VIP Proxy Delegation Table
CREATE TABLE vip_proxies (
    id SERIAL PRIMARY KEY,
    vip_id TEXT REFERENCES users(id) ON DELETE CASCADE,
    proxy_id TEXT REFERENCES users(id) ON DELETE CASCADE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    expires_at TIMESTAMP
);

-- VIP SLA History Table
CREATE TABLE vip_sla_history (
    id SERIAL PRIMARY KEY,
    user_id TEXT REFERENCES users(id) ON DELETE CASCADE,
    sla JSONB NOT NULL,
    effective_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    ended_at TIMESTAMP
);
