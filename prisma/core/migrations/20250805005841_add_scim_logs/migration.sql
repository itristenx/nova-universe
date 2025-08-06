-- CreateTable
CREATE TABLE "public"."users" (
    "id" TEXT NOT NULL,
    "name" TEXT,
    "email" TEXT NOT NULL,
    "password_hash" TEXT,
    "disabled" BOOLEAN NOT NULL DEFAULT false,
    "is_default" BOOLEAN NOT NULL DEFAULT false,
    "last_login" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "two_factor_enabled" BOOLEAN NOT NULL DEFAULT false,
    "two_factor_secret" TEXT,
    "two_factor_backup_codes" JSONB,
    "two_factor_verified" BOOLEAN NOT NULL DEFAULT false,
    "saml_name_id" TEXT,
    "saml_session_index" TEXT,
    "scim_external_id" TEXT,
    "department" TEXT,
    "last_saml_login" TIMESTAMP(3),
    "is_vip" BOOLEAN NOT NULL DEFAULT false,
    "vip_level" TEXT,
    "vip_sla_override" JSONB,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."roles" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "roles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."permissions" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "resource" TEXT,
    "action" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "permissions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."user_roles" (
    "user_id" TEXT NOT NULL,
    "role_id" INTEGER NOT NULL,
    "assigned_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "user_roles_pkey" PRIMARY KEY ("user_id","role_id")
);

-- CreateTable
CREATE TABLE "public"."role_permissions" (
    "role_id" INTEGER NOT NULL,
    "permission_id" INTEGER NOT NULL,
    "assigned_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "role_permissions_pkey" PRIMARY KEY ("role_id","permission_id")
);

-- CreateTable
CREATE TABLE "public"."passkeys" (
    "id" SERIAL NOT NULL,
    "user_id" TEXT NOT NULL,
    "credential_id" TEXT NOT NULL,
    "public_key" TEXT NOT NULL,
    "counter" INTEGER NOT NULL DEFAULT 0,
    "transports" TEXT,
    "device_type" TEXT,
    "backed_up" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "last_used" TIMESTAMP(3),

    CONSTRAINT "passkeys_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."logs" (
    "id" SERIAL NOT NULL,
    "ticket_id" TEXT,
    "name" TEXT,
    "email" TEXT,
    "title" TEXT,
    "system" TEXT,
    "urgency" TEXT,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "email_status" TEXT,
    "user_id" TEXT,

    CONSTRAINT "logs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."config" (
    "key" TEXT NOT NULL,
    "value" TEXT,
    "value_type" TEXT,
    "description" TEXT,
    "is_public" BOOLEAN DEFAULT false,
    "category" TEXT,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "config_pkey" PRIMARY KEY ("key")
);

-- CreateTable
CREATE TABLE "public"."kiosks" (
    "id" TEXT NOT NULL,
    "last_seen" TIMESTAMP(3),
    "version" TEXT,
    "active" BOOLEAN NOT NULL DEFAULT false,
    "logo_url" TEXT,
    "bg_url" TEXT,
    "status_enabled" BOOLEAN NOT NULL DEFAULT false,
    "current_status" TEXT,
    "open_msg" TEXT,
    "closed_msg" TEXT,
    "error_msg" TEXT,
    "meeting_msg" TEXT,
    "brb_msg" TEXT,
    "lunch_msg" TEXT,
    "unavailable_msg" TEXT,
    "schedule" JSONB,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "kiosks_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."feedback" (
    "id" SERIAL NOT NULL,
    "name" TEXT,
    "message" TEXT,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "user_id" TEXT,

    CONSTRAINT "feedback_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."notifications" (
    "id" SERIAL NOT NULL,
    "message" TEXT NOT NULL,
    "level" TEXT NOT NULL DEFAULT 'info',
    "active" BOOLEAN NOT NULL DEFAULT true,
    "type" TEXT NOT NULL DEFAULT 'system',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "notifications_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."directory_integrations" (
    "id" SERIAL NOT NULL,
    "provider" TEXT NOT NULL,
    "settings" JSONB,
    "enabled" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "directory_integrations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."assets" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "filename" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "size_bytes" INTEGER,
    "mime_type" TEXT,
    "uploaded_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "assets_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."kiosk_activations" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "qr_code" TEXT NOT NULL,
    "expires_at" TIMESTAMP(3) NOT NULL,
    "used" BOOLEAN NOT NULL DEFAULT false,
    "used_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "kiosk_id" TEXT,

    CONSTRAINT "kiosk_activations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."sso_configurations" (
    "id" SERIAL NOT NULL,
    "provider" TEXT NOT NULL,
    "enabled" BOOLEAN NOT NULL DEFAULT false,
    "configuration" JSONB,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "sso_configurations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."admin_pins" (
    "id" SERIAL NOT NULL,
    "global_pin" TEXT,
    "kiosk_pins" JSONB,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "admin_pins_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."kb_articles" (
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
CREATE TABLE "public"."kb_article_versions" (
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
CREATE TABLE "public"."kb_article_comments" (
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
CREATE TABLE "public"."support_tickets" (
    "id" SERIAL NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'open',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "user_id" TEXT,
    "assignee_id" TEXT,
    "vip_priority_score" INTEGER,
    "vip_trigger_source" TEXT,

    CONSTRAINT "support_tickets_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."inventory_assets" (
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
    "serial_number_enc" TEXT,
    "warranty_info_enc" TEXT,
    "purchase_info_enc" TEXT,
    "maintenance_notes_enc" TEXT,
    "warranty_alert_days" INTEGER DEFAULT 30,
    "warranty_alert_enabled" BOOLEAN NOT NULL DEFAULT true,
    "last_warranty_alert_sent" TIMESTAMP(3),
    "import_batch_id" TEXT,
    "import_source" TEXT,
    "import_validated" BOOLEAN NOT NULL DEFAULT false,
    "validation_errors" TEXT,

    CONSTRAINT "inventory_assets_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."asset_status_logs" (
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
CREATE TABLE "public"."asset_assignments" (
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
CREATE TABLE "public"."asset_ticket_history" (
    "id" SERIAL NOT NULL,
    "asset_id" INTEGER NOT NULL,
    "ticket_id" INTEGER NOT NULL,
    "relationship_type" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "ended_at" TIMESTAMP(3),
    "created_by" TEXT,
    "notes" TEXT,

    CONSTRAINT "asset_ticket_history_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."asset_warranty_alerts" (
    "id" SERIAL NOT NULL,
    "asset_id" INTEGER NOT NULL,
    "alert_type" TEXT NOT NULL,
    "alert_date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expiry_date" TIMESTAMP(3) NOT NULL,
    "days_remaining" INTEGER NOT NULL,
    "notification_sent" BOOLEAN NOT NULL DEFAULT false,
    "notification_sent_at" TIMESTAMP(3),
    "dismissed" BOOLEAN NOT NULL DEFAULT false,
    "dismissed_by" TEXT,
    "dismissed_at" TIMESTAMP(3),

    CONSTRAINT "asset_warranty_alerts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."asset_import_batches" (
    "id" TEXT NOT NULL,
    "filename" TEXT NOT NULL,
    "imported_by" TEXT NOT NULL,
    "import_date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "total_records" INTEGER NOT NULL DEFAULT 0,
    "successful_records" INTEGER NOT NULL DEFAULT 0,
    "failed_records" INTEGER NOT NULL DEFAULT 0,
    "validation_status" TEXT NOT NULL DEFAULT 'pending',
    "validation_errors" TEXT,
    "rollback_date" TIMESTAMP(3),
    "rollback_by" TEXT,

    CONSTRAINT "asset_import_batches_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."asset_validation_logs" (
    "id" SERIAL NOT NULL,
    "batch_id" TEXT NOT NULL,
    "asset_id" INTEGER,
    "row_number" INTEGER NOT NULL,
    "validation_level" TEXT NOT NULL,
    "field_name" TEXT,
    "message" TEXT NOT NULL,
    "raw_data" JSONB,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "asset_validation_logs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."kiosk_asset_registry" (
    "id" SERIAL NOT NULL,
    "kiosk_id" TEXT NOT NULL,
    "asset_id" INTEGER NOT NULL,
    "registration_date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "last_check_in" TIMESTAMP(3),
    "status" TEXT NOT NULL DEFAULT 'active',
    "helix_sync_status" TEXT NOT NULL DEFAULT 'pending',
    "helix_last_sync" TIMESTAMP(3),
    "helix_error_message" TEXT,
    "encrypted_metadata" TEXT,
    "created_by" TEXT,
    "updated_by" TEXT,

    CONSTRAINT "kiosk_asset_registry_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."xp_events" (
    "id" SERIAL NOT NULL,
    "user_id" TEXT NOT NULL,
    "amount" INTEGER NOT NULL,
    "reason" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "xp_events_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."leaderboard" (
    "user_id" TEXT NOT NULL,
    "xp_total" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "leaderboard_pkey" PRIMARY KEY ("user_id")
);

-- CreateTable
CREATE TABLE "public"."scim_mappings" (
    "id" TEXT NOT NULL,
    "external_id" TEXT,
    "user_id" TEXT NOT NULL,
    "provider" TEXT,
    "sync_time" TIMESTAMP(3),

    CONSTRAINT "scim_mappings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."scim_logs" (
    "id" TEXT NOT NULL,
    "operation" TEXT NOT NULL,
    "entity_type" TEXT NOT NULL,
    "entity_id" TEXT,
    "status_code" INTEGER NOT NULL,
    "message" TEXT,
    "request_body" JSONB,
    "response_body" JSONB,
    "user_agent" TEXT,
    "ip_address" TEXT,
    "duration" INTEGER,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "scim_logs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."mailroom_packages" (
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
CREATE TABLE "public"."delivery_events" (
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
CREATE TABLE "public"."proxy_authorizations" (
    "id" SERIAL NOT NULL,
    "recipient_id" TEXT NOT NULL,
    "proxy_id" TEXT NOT NULL,
    "package_id" INTEGER NOT NULL,
    "expiration" TIMESTAMP(3),
    "status" TEXT NOT NULL,

    CONSTRAINT "proxy_authorizations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."request_catalog_items" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "form_schema" JSONB,
    "workflow_id" INTEGER,

    CONSTRAINT "request_catalog_items_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."ritms" (
    "id" SERIAL NOT NULL,
    "req_id" INTEGER NOT NULL,
    "catalog_item_id" INTEGER NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'open',

    CONSTRAINT "ritms_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."vip_proxies" (
    "id" SERIAL NOT NULL,
    "vip_id" TEXT NOT NULL,
    "proxy_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expires_at" TIMESTAMP(3),

    CONSTRAINT "vip_proxies_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."vip_sla_history" (
    "id" SERIAL NOT NULL,
    "user_id" TEXT NOT NULL,
    "sla" JSONB NOT NULL,
    "effective_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "ended_at" TIMESTAMP(3),

    CONSTRAINT "vip_sla_history_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "public"."users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "users_saml_name_id_key" ON "public"."users"("saml_name_id");

-- CreateIndex
CREATE UNIQUE INDEX "roles_name_key" ON "public"."roles"("name");

-- CreateIndex
CREATE UNIQUE INDEX "permissions_name_key" ON "public"."permissions"("name");

-- CreateIndex
CREATE UNIQUE INDEX "passkeys_credential_id_key" ON "public"."passkeys"("credential_id");

-- CreateIndex
CREATE UNIQUE INDEX "kb_articles_slug_key" ON "public"."kb_articles"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "kb_article_versions_article_id_version_key" ON "public"."kb_article_versions"("article_id", "version");

-- CreateIndex
CREATE UNIQUE INDEX "kiosk_asset_registry_kiosk_id_asset_id_key" ON "public"."kiosk_asset_registry"("kiosk_id", "asset_id");

-- AddForeignKey
ALTER TABLE "public"."user_roles" ADD CONSTRAINT "user_roles_role_id_fkey" FOREIGN KEY ("role_id") REFERENCES "public"."roles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."user_roles" ADD CONSTRAINT "user_roles_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."role_permissions" ADD CONSTRAINT "role_permissions_permission_id_fkey" FOREIGN KEY ("permission_id") REFERENCES "public"."permissions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."role_permissions" ADD CONSTRAINT "role_permissions_role_id_fkey" FOREIGN KEY ("role_id") REFERENCES "public"."roles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."passkeys" ADD CONSTRAINT "passkeys_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."logs" ADD CONSTRAINT "logs_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."feedback" ADD CONSTRAINT "feedback_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."kiosk_activations" ADD CONSTRAINT "kiosk_activations_kiosk_id_fkey" FOREIGN KEY ("kiosk_id") REFERENCES "public"."kiosks"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."kb_articles" ADD CONSTRAINT "kb_articles_author_id_fkey" FOREIGN KEY ("author_id") REFERENCES "public"."users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."kb_articles" ADD CONSTRAINT "kb_articles_current_version_id_fkey" FOREIGN KEY ("current_version_id") REFERENCES "public"."kb_article_versions"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."kb_article_versions" ADD CONSTRAINT "kb_article_versions_article_id_fkey" FOREIGN KEY ("article_id") REFERENCES "public"."kb_articles"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."kb_article_versions" ADD CONSTRAINT "kb_article_versions_author_id_fkey" FOREIGN KEY ("author_id") REFERENCES "public"."users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."kb_article_comments" ADD CONSTRAINT "kb_article_comments_article_id_fkey" FOREIGN KEY ("article_id") REFERENCES "public"."kb_articles"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."kb_article_comments" ADD CONSTRAINT "kb_article_comments_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."support_tickets" ADD CONSTRAINT "support_tickets_assignee_id_fkey" FOREIGN KEY ("assignee_id") REFERENCES "public"."users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "public"."support_tickets" ADD CONSTRAINT "support_tickets_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "public"."inventory_assets" ADD CONSTRAINT "inventory_assets_import_batch_id_fkey" FOREIGN KEY ("import_batch_id") REFERENCES "public"."asset_import_batches"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."asset_status_logs" ADD CONSTRAINT "asset_status_logs_asset_id_fkey" FOREIGN KEY ("asset_id") REFERENCES "public"."inventory_assets"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."asset_assignments" ADD CONSTRAINT "asset_assignments_asset_id_fkey" FOREIGN KEY ("asset_id") REFERENCES "public"."inventory_assets"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."asset_ticket_history" ADD CONSTRAINT "asset_ticket_history_asset_id_fkey" FOREIGN KEY ("asset_id") REFERENCES "public"."inventory_assets"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."asset_ticket_history" ADD CONSTRAINT "asset_ticket_history_ticket_id_fkey" FOREIGN KEY ("ticket_id") REFERENCES "public"."support_tickets"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."asset_warranty_alerts" ADD CONSTRAINT "asset_warranty_alerts_asset_id_fkey" FOREIGN KEY ("asset_id") REFERENCES "public"."inventory_assets"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."asset_validation_logs" ADD CONSTRAINT "asset_validation_logs_batch_id_fkey" FOREIGN KEY ("batch_id") REFERENCES "public"."asset_import_batches"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."asset_validation_logs" ADD CONSTRAINT "asset_validation_logs_asset_id_fkey" FOREIGN KEY ("asset_id") REFERENCES "public"."inventory_assets"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."kiosk_asset_registry" ADD CONSTRAINT "kiosk_asset_registry_kiosk_id_fkey" FOREIGN KEY ("kiosk_id") REFERENCES "public"."kiosks"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."kiosk_asset_registry" ADD CONSTRAINT "kiosk_asset_registry_asset_id_fkey" FOREIGN KEY ("asset_id") REFERENCES "public"."inventory_assets"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."xp_events" ADD CONSTRAINT "xp_events_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."leaderboard" ADD CONSTRAINT "leaderboard_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."scim_mappings" ADD CONSTRAINT "scim_mappings_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."mailroom_packages" ADD CONSTRAINT "mailroom_packages_recipient_id_fkey" FOREIGN KEY ("recipient_id") REFERENCES "public"."users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."mailroom_packages" ADD CONSTRAINT "mailroom_packages_linked_ticket_id_fkey" FOREIGN KEY ("linked_ticket_id") REFERENCES "public"."support_tickets"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."mailroom_packages" ADD CONSTRAINT "mailroom_packages_linked_asset_id_fkey" FOREIGN KEY ("linked_asset_id") REFERENCES "public"."inventory_assets"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."delivery_events" ADD CONSTRAINT "delivery_events_package_id_fkey" FOREIGN KEY ("package_id") REFERENCES "public"."mailroom_packages"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."delivery_events" ADD CONSTRAINT "delivery_events_performed_by_fkey" FOREIGN KEY ("performed_by") REFERENCES "public"."users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."proxy_authorizations" ADD CONSTRAINT "proxy_authorizations_recipient_id_fkey" FOREIGN KEY ("recipient_id") REFERENCES "public"."users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."proxy_authorizations" ADD CONSTRAINT "proxy_authorizations_proxy_id_fkey" FOREIGN KEY ("proxy_id") REFERENCES "public"."users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."proxy_authorizations" ADD CONSTRAINT "proxy_authorizations_package_id_fkey" FOREIGN KEY ("package_id") REFERENCES "public"."mailroom_packages"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."ritms" ADD CONSTRAINT "ritms_req_id_fkey" FOREIGN KEY ("req_id") REFERENCES "public"."support_tickets"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."ritms" ADD CONSTRAINT "ritms_catalog_item_id_fkey" FOREIGN KEY ("catalog_item_id") REFERENCES "public"."request_catalog_items"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."vip_proxies" ADD CONSTRAINT "vip_proxies_vip_id_fkey" FOREIGN KEY ("vip_id") REFERENCES "public"."users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."vip_proxies" ADD CONSTRAINT "vip_proxies_proxy_id_fkey" FOREIGN KEY ("proxy_id") REFERENCES "public"."users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."vip_sla_history" ADD CONSTRAINT "vip_sla_history_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
