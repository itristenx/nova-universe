-- Add VIP delegation proxy and SLA history tables
CREATE TABLE IF NOT EXISTS "vip_proxies" (
    "id" SERIAL PRIMARY KEY,
    "vip_id" TEXT NOT NULL REFERENCES "users"(id) ON DELETE CASCADE,
    "proxy_id" TEXT NOT NULL REFERENCES "users"(id) ON DELETE CASCADE,
    "created_at" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    "expires_at" TIMESTAMP
);

CREATE TABLE IF NOT EXISTS "vip_sla_history" (
    "id" SERIAL PRIMARY KEY,
    "user_id" TEXT NOT NULL REFERENCES "users"(id) ON DELETE CASCADE,
    "sla" JSONB NOT NULL,
    "effective_at" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    "ended_at" TIMESTAMP
);
