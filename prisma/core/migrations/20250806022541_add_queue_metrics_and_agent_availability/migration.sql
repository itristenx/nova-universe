/*
  Warnings:

  - Made the column `is_public` on table `config` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "config" ADD COLUMN     "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "default_value" TEXT,
ADD COLUMN     "display_order" INTEGER,
ADD COLUMN     "help_text" TEXT,
ADD COLUMN     "is_advanced" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "is_required" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "is_ui_editable" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "subcategory" TEXT,
ADD COLUMN     "updated_by" TEXT,
ADD COLUMN     "validation_rules" JSONB,
ALTER COLUMN "is_public" SET NOT NULL,
ALTER COLUMN "updated_at" DROP DEFAULT;

-- CreateTable
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

-- CreateTable
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

-- CreateTable
CREATE TABLE "helix_sync_failures" (
    "id" SERIAL NOT NULL,
    "kiosk_id" TEXT NOT NULL,
    "asset_id" INTEGER NOT NULL,
    "error_message" TEXT NOT NULL,
    "metadata" JSONB,
    "retry_count" INTEGER NOT NULL DEFAULT 0,
    "next_retry_at" TIMESTAMP(3) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "helix_sync_failures_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "kiosk_organization_assignments" (
    "id" SERIAL NOT NULL,
    "kiosk_id" TEXT NOT NULL,
    "organization_id" INTEGER NOT NULL,
    "department" VARCHAR(100),
    "floor" VARCHAR(50),
    "room" VARCHAR(50),
    "building" VARCHAR(100),
    "assigned_by" TEXT,
    "assignment_metadata" JSONB NOT NULL DEFAULT '{}',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "kiosk_organization_assignments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "kiosk_metadata_logs" (
    "id" SERIAL NOT NULL,
    "kiosk_id" TEXT NOT NULL,
    "metadata_type" VARCHAR(50) NOT NULL,
    "encrypted_metadata" TEXT,
    "collection_timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "kiosk_metadata_logs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "agent_availability" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "queue_name" TEXT NOT NULL,
    "is_available" BOOLEAN NOT NULL DEFAULT true,
    "max_capacity" INTEGER NOT NULL DEFAULT 10,
    "current_load" INTEGER NOT NULL DEFAULT 0,
    "status" TEXT NOT NULL DEFAULT 'active',
    "last_updated" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "agent_availability_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "queue_metrics" (
    "id" TEXT NOT NULL,
    "queue_name" TEXT NOT NULL,
    "total_agents" INTEGER NOT NULL DEFAULT 0,
    "available_agents" INTEGER NOT NULL DEFAULT 0,
    "total_tickets" INTEGER NOT NULL DEFAULT 0,
    "open_tickets" INTEGER NOT NULL DEFAULT 0,
    "avg_response_time" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "avg_resolution_time" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "sla_breaches" INTEGER NOT NULL DEFAULT 0,
    "high_priority_tickets" INTEGER NOT NULL DEFAULT 0,
    "capacity_utilization" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "average_wait_time" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "threshold_warning" BOOLEAN NOT NULL DEFAULT false,
    "threshold_critical" BOOLEAN NOT NULL DEFAULT false,
    "last_calculated" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "queue_metrics_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "queue_alerts" (
    "id" TEXT NOT NULL,
    "queue_name" TEXT NOT NULL,
    "alert_type" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "alerted_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "resolved_at" TIMESTAMP(3),
    "notified_users" TEXT[],

    CONSTRAINT "queue_alerts_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "config_templates_name_key" ON "config_templates"("name");

-- CreateIndex
CREATE UNIQUE INDEX "helix_sync_failures_kiosk_id_asset_id_key" ON "helix_sync_failures"("kiosk_id", "asset_id");

-- CreateIndex
CREATE UNIQUE INDEX "kiosk_organization_assignments_kiosk_id_key" ON "kiosk_organization_assignments"("kiosk_id");

-- CreateIndex
CREATE UNIQUE INDEX "agent_availability_user_id_queue_name_key" ON "agent_availability"("user_id", "queue_name");

-- CreateIndex
CREATE UNIQUE INDEX "queue_metrics_queue_name_key" ON "queue_metrics"("queue_name");

-- AddForeignKey
ALTER TABLE "config_history" ADD CONSTRAINT "config_history_config_key_fkey" FOREIGN KEY ("config_key") REFERENCES "config"("key") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "helix_sync_failures" ADD CONSTRAINT "helix_sync_failures_kiosk_id_fkey" FOREIGN KEY ("kiosk_id") REFERENCES "kiosks"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "helix_sync_failures" ADD CONSTRAINT "helix_sync_failures_asset_id_fkey" FOREIGN KEY ("asset_id") REFERENCES "inventory_assets"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "kiosk_organization_assignments" ADD CONSTRAINT "kiosk_organization_assignments_kiosk_id_fkey" FOREIGN KEY ("kiosk_id") REFERENCES "kiosks"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "kiosk_metadata_logs" ADD CONSTRAINT "kiosk_metadata_logs_kiosk_id_fkey" FOREIGN KEY ("kiosk_id") REFERENCES "kiosks"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "agent_availability" ADD CONSTRAINT "agent_availability_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
