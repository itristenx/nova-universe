-- Add mailroom packages, delivery events, and proxy authorizations tables

CREATE TABLE "mailroom_packages" (
  "id" SERIAL NOT NULL,
  "tracking_number" TEXT,
  "carrier" TEXT,
  "sender" TEXT,
  "recipient_id" TEXT NOT NULL,
  "department" TEXT,
  "package_type" TEXT,
  "status" TEXT NOT NULL DEFAULT 'inbound',
  "assigned_location" TEXT,
  "linked_ticket_id" INTEGER,
  "linked_asset_id" INTEGER,
  "flags" JSONB,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "mailroom_packages_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "delivery_events" (
  "id" SERIAL NOT NULL,
  "package_id" INTEGER NOT NULL,
  "event_type" TEXT NOT NULL,
  "performed_by" TEXT,
  "location" TEXT,
  "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "photo_url" TEXT,
  "signature_blob" BYTEA,
  CONSTRAINT "delivery_events_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "delivery_events_package_id_fkey" FOREIGN KEY ("package_id") REFERENCES "mailroom_packages"("id") ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE TABLE "proxy_authorizations" (
  "id" SERIAL NOT NULL,
  "recipient_id" TEXT NOT NULL,
  "proxy_id" TEXT NOT NULL,
  "package_id" INTEGER NOT NULL,
  "expiration" TIMESTAMP(3) NOT NULL,
  "status" TEXT NOT NULL,
  CONSTRAINT "proxy_authorizations_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "proxy_authorizations_package_id_fkey" FOREIGN KEY ("package_id") REFERENCES "mailroom_packages"("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- Indexes for faster lookups
CREATE INDEX "mailroom_packages_recipient_idx" ON "mailroom_packages"("recipient_id");
CREATE INDEX "delivery_events_package_idx" ON "delivery_events"("package_id");
CREATE INDEX "proxy_authorizations_package_idx" ON "proxy_authorizations"("package_id");
