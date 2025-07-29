-- Add VIP SLA and ticket priority columns
ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "vip_sla_override" JSONB;
ALTER TABLE "support_tickets" ADD COLUMN IF NOT EXISTS "vip_priority_score" INTEGER;
ALTER TABLE "support_tickets" ADD COLUMN IF NOT EXISTS "vip_trigger_source" TEXT;
