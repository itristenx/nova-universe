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
    vip_level VARCHAR(50)
);

-- Tickets Table
CREATE TABLE tickets (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    status VARCHAR(20) DEFAULT 'open',
    priority VARCHAR(20) DEFAULT 'medium',
    created_by INT REFERENCES users(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
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
    user_id TEXT REFERENCES users(id),
    amount INT NOT NULL,
    reason TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Leaderboard Table
CREATE TABLE leaderboard (
    user_id TEXT PRIMARY KEY REFERENCES users(id),
    xp_total INT NOT NULL DEFAULT 0
);
