/*
  Warnings:

  - You are about to drop the `knowledge_base_articles` table. If the table is not empty, all the data it contains will be lost.

*/
-- AlterTable
ALTER TABLE "users" ADD COLUMN     "is_vip" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "scim_external_id" TEXT,
ADD COLUMN     "vip_level" TEXT;

-- DropTable
DROP TABLE "knowledge_base_articles";

-- CreateTable
CREATE TABLE "kb_articles" (
    "id" SERIAL NOT NULL,
    "slug" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "author_id" TEXT,
    "current_version_id" INTEGER,
    "is_published" BOOLEAN NOT NULL DEFAULT false,
    "tags" TEXT[],

    CONSTRAINT "kb_articles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "kb_article_versions" (
    "id" SERIAL NOT NULL,
    "article_id" INTEGER NOT NULL,
    "content" TEXT NOT NULL,
    "summary" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "author_id" TEXT,
    "version" INTEGER NOT NULL DEFAULT 1,
    "is_approved" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "kb_article_versions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "kb_article_comments" (
    "id" SERIAL NOT NULL,
    "article_id" INTEGER NOT NULL,
    "user_id" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "is_deleted" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "kb_article_comments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "inventory_assets" (
    "id" SERIAL NOT NULL,
    "asset_tag" TEXT NOT NULL,
    "type_id" INTEGER,
    "serial_number" TEXT,
    "model" TEXT,
    "vendor_id" INTEGER,
    "purchase_date" TIMESTAMP(3),
    "warranty_expiry" TIMESTAMP(3),
    "assigned_to_user_id" TEXT,
    "assigned_to_org_id" INTEGER,
    "assigned_to_customer_id" INTEGER,
    "department" TEXT,
    "status" TEXT,
    "location_id" INTEGER,
    "kiosk_id" TEXT,
    "custom_fields" JSONB,
    "notes" TEXT,
    "created_by" TEXT,
    "updated_by" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "inventory_assets_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "asset_status_logs" (
    "id" SERIAL NOT NULL,
    "asset_id" INTEGER NOT NULL,
    "previous_status" TEXT,
    "new_status" TEXT NOT NULL,
    "changed_by_user_id" TEXT,
    "notes" TEXT,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "asset_status_logs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "asset_assignments" (
    "id" SERIAL NOT NULL,
    "asset_id" INTEGER NOT NULL,
    "user_id" TEXT,
    "org_id" INTEGER,
    "customer_id" INTEGER,
    "assigned_by" TEXT,
    "assigned_date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expected_return" TIMESTAMP(3),
    "return_date" TIMESTAMP(3),
    "manager_id" TEXT,

    CONSTRAINT "asset_assignments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "scim_mappings" (
    "id" TEXT NOT NULL,
    "external_id" TEXT,
    "user_id" TEXT NOT NULL,
    "provider" TEXT,
    "sync_time" TIMESTAMP(3),

    CONSTRAINT "scim_mappings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "mailroom_packages" (
    "id" SERIAL NOT NULL,
    "tracking_number" TEXT NOT NULL,
    "carrier" TEXT NOT NULL,
    "sender" TEXT,
    "recipient_id" TEXT NOT NULL,
    "department" TEXT,
    "package_type" TEXT,
    "status" TEXT NOT NULL,
    "assigned_location" TEXT,
    "linked_ticket_id" INTEGER,
    "linked_asset_id" INTEGER,
    "flags" TEXT[],
    "intake_photo_url" TEXT,
    "delivery_photo_url" TEXT,
    "signature_url" TEXT,
    "intake_location" TEXT,
    "delivery_location" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "mailroom_packages_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "delivery_events" (
    "id" SERIAL NOT NULL,
    "package_id" INTEGER NOT NULL,
    "event_type" TEXT NOT NULL,
    "performed_by" TEXT NOT NULL,
    "location" TEXT,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "photo_url" TEXT,
    "signature_blob" BYTEA,

    CONSTRAINT "delivery_events_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "proxy_authorizations" (
    "id" SERIAL NOT NULL,
    "recipient_id" TEXT NOT NULL,
    "proxy_id" TEXT NOT NULL,
    "package_id" INTEGER NOT NULL,
    "expiration" TIMESTAMP(3),
    "status" TEXT NOT NULL,

    CONSTRAINT "proxy_authorizations_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "kb_articles_slug_key" ON "kb_articles"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "kb_article_versions_article_id_version_key" ON "kb_article_versions"("article_id", "version");

-- AddForeignKey
ALTER TABLE "kb_articles" ADD CONSTRAINT "kb_articles_author_id_fkey" FOREIGN KEY ("author_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "kb_articles" ADD CONSTRAINT "kb_articles_current_version_id_fkey" FOREIGN KEY ("current_version_id") REFERENCES "kb_article_versions"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "kb_article_versions" ADD CONSTRAINT "kb_article_versions_article_id_fkey" FOREIGN KEY ("article_id") REFERENCES "kb_articles"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "kb_article_versions" ADD CONSTRAINT "kb_article_versions_author_id_fkey" FOREIGN KEY ("author_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "kb_article_comments" ADD CONSTRAINT "kb_article_comments_article_id_fkey" FOREIGN KEY ("article_id") REFERENCES "kb_articles"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "kb_article_comments" ADD CONSTRAINT "kb_article_comments_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "asset_status_logs" ADD CONSTRAINT "asset_status_logs_asset_id_fkey" FOREIGN KEY ("asset_id") REFERENCES "inventory_assets"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "asset_assignments" ADD CONSTRAINT "asset_assignments_asset_id_fkey" FOREIGN KEY ("asset_id") REFERENCES "inventory_assets"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "scim_mappings" ADD CONSTRAINT "scim_mappings_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "mailroom_packages" ADD CONSTRAINT "mailroom_packages_recipient_id_fkey" FOREIGN KEY ("recipient_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "mailroom_packages" ADD CONSTRAINT "mailroom_packages_linked_ticket_id_fkey" FOREIGN KEY ("linked_ticket_id") REFERENCES "support_tickets"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "mailroom_packages" ADD CONSTRAINT "mailroom_packages_linked_asset_id_fkey" FOREIGN KEY ("linked_asset_id") REFERENCES "inventory_assets"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "delivery_events" ADD CONSTRAINT "delivery_events_package_id_fkey" FOREIGN KEY ("package_id") REFERENCES "mailroom_packages"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "delivery_events" ADD CONSTRAINT "delivery_events_performed_by_fkey" FOREIGN KEY ("performed_by") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "proxy_authorizations" ADD CONSTRAINT "proxy_authorizations_recipient_id_fkey" FOREIGN KEY ("recipient_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "proxy_authorizations" ADD CONSTRAINT "proxy_authorizations_proxy_id_fkey" FOREIGN KEY ("proxy_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "proxy_authorizations" ADD CONSTRAINT "proxy_authorizations_package_id_fkey" FOREIGN KEY ("package_id") REFERENCES "mailroom_packages"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
