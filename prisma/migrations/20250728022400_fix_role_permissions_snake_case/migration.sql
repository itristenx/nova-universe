/*
  Warnings:

  - You are about to drop the column `globalPin` on the `admin_pins` table. All the data in the column will be lost.
  - You are about to drop the column `kioskPins` on the `admin_pins` table. All the data in the column will be lost.
  - You are about to drop the column `updatedAt` on the `admin_pins` table. All the data in the column will be lost.
  - You are about to drop the column `mimeType` on the `assets` table. All the data in the column will be lost.
  - You are about to drop the column `sizeBytes` on the `assets` table. All the data in the column will be lost.
  - You are about to drop the column `uploadedAt` on the `assets` table. All the data in the column will be lost.
  - You are about to drop the column `updatedAt` on the `config` table. All the data in the column will be lost.
  - You are about to drop the column `userId` on the `feedback` table. All the data in the column will be lost.
  - You are about to drop the column `createdAt` on the `kiosk_activations` table. All the data in the column will be lost.
  - You are about to drop the column `expiresAt` on the `kiosk_activations` table. All the data in the column will be lost.
  - You are about to drop the column `kioskId` on the `kiosk_activations` table. All the data in the column will be lost.
  - You are about to drop the column `qrCode` on the `kiosk_activations` table. All the data in the column will be lost.
  - You are about to drop the column `usedAt` on the `kiosk_activations` table. All the data in the column will be lost.
  - You are about to drop the column `bgUrl` on the `kiosks` table. All the data in the column will be lost.
  - You are about to drop the column `brbMsg` on the `kiosks` table. All the data in the column will be lost.
  - You are about to drop the column `closedMsg` on the `kiosks` table. All the data in the column will be lost.
  - You are about to drop the column `createdAt` on the `kiosks` table. All the data in the column will be lost.
  - You are about to drop the column `currentStatus` on the `kiosks` table. All the data in the column will be lost.
  - You are about to drop the column `errorMsg` on the `kiosks` table. All the data in the column will be lost.
  - You are about to drop the column `lastSeen` on the `kiosks` table. All the data in the column will be lost.
  - You are about to drop the column `logoUrl` on the `kiosks` table. All the data in the column will be lost.
  - You are about to drop the column `lunchMsg` on the `kiosks` table. All the data in the column will be lost.
  - You are about to drop the column `meetingMsg` on the `kiosks` table. All the data in the column will be lost.
  - You are about to drop the column `openMsg` on the `kiosks` table. All the data in the column will be lost.
  - You are about to drop the column `statusEnabled` on the `kiosks` table. All the data in the column will be lost.
  - You are about to drop the column `unavailableMsg` on the `kiosks` table. All the data in the column will be lost.
  - You are about to drop the column `updatedAt` on the `kiosks` table. All the data in the column will be lost.
  - You are about to drop the column `createdAt` on the `knowledge_base_articles` table. All the data in the column will be lost.
  - You are about to drop the column `updatedAt` on the `knowledge_base_articles` table. All the data in the column will be lost.
  - You are about to drop the column `emailStatus` on the `logs` table. All the data in the column will be lost.
  - You are about to drop the column `servicenowId` on the `logs` table. All the data in the column will be lost.
  - You are about to drop the column `ticketId` on the `logs` table. All the data in the column will be lost.
  - You are about to drop the column `userId` on the `logs` table. All the data in the column will be lost.
  - You are about to drop the column `createdAt` on the `notifications` table. All the data in the column will be lost.
  - You are about to drop the column `updatedAt` on the `notifications` table. All the data in the column will be lost.
  - You are about to drop the column `backedUp` on the `passkeys` table. All the data in the column will be lost.
  - You are about to drop the column `createdAt` on the `passkeys` table. All the data in the column will be lost.
  - You are about to drop the column `credentialId` on the `passkeys` table. All the data in the column will be lost.
  - You are about to drop the column `deviceType` on the `passkeys` table. All the data in the column will be lost.
  - You are about to drop the column `lastUsed` on the `passkeys` table. All the data in the column will be lost.
  - You are about to drop the column `publicKey` on the `passkeys` table. All the data in the column will be lost.
  - You are about to drop the column `userId` on the `passkeys` table. All the data in the column will be lost.
  - You are about to drop the column `createdAt` on the `permissions` table. All the data in the column will be lost.
  - The primary key for the `role_permissions` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `assignedAt` on the `role_permissions` table. All the data in the column will be lost.
  - You are about to drop the column `permissionId` on the `role_permissions` table. All the data in the column will be lost.
  - You are about to drop the column `roleId` on the `role_permissions` table. All the data in the column will be lost.
  - You are about to drop the column `createdAt` on the `roles` table. All the data in the column will be lost.
  - You are about to drop the column `updatedAt` on the `sso_configurations` table. All the data in the column will be lost.
  - You are about to drop the column `assigneeId` on the `support_tickets` table. All the data in the column will be lost.
  - You are about to drop the column `createdAt` on the `support_tickets` table. All the data in the column will be lost.
  - You are about to drop the column `updatedAt` on the `support_tickets` table. All the data in the column will be lost.
  - You are about to drop the column `userId` on the `support_tickets` table. All the data in the column will be lost.
  - You are about to drop the column `assignedAt` on the `user_roles` table. All the data in the column will be lost.
  - You are about to drop the column `lastLogin` on the `users` table. All the data in the column will be lost.
  - You are about to drop the column `lastSamlLogin` on the `users` table. All the data in the column will be lost.
  - You are about to drop the column `samlNameId` on the `users` table. All the data in the column will be lost.
  - You are about to drop the column `samlSessionIndex` on the `users` table. All the data in the column will be lost.
  - You are about to drop the column `twoFactorBackupCodes` on the `users` table. All the data in the column will be lost.
  - You are about to drop the column `twoFactorEnabled` on the `users` table. All the data in the column will be lost.
  - You are about to drop the column `twoFactorSecret` on the `users` table. All the data in the column will be lost.
  - You are about to drop the column `twoFactorVerified` on the `users` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[credential_id]` on the table `passkeys` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[saml_name_id]` on the table `users` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `expires_at` to the `kiosk_activations` table without a default value. This is not possible if the table is not empty.
  - Added the required column `qr_code` to the `kiosk_activations` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updated_at` to the `kiosks` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updated_at` to the `notifications` table without a default value. This is not possible if the table is not empty.
  - Added the required column `credential_id` to the `passkeys` table without a default value. This is not possible if the table is not empty.
  - Added the required column `public_key` to the `passkeys` table without a default value. This is not possible if the table is not empty.
  - Added the required column `user_id` to the `passkeys` table without a default value. This is not possible if the table is not empty.
  - Added the required column `permission_id` to the `role_permissions` table without a default value. This is not possible if the table is not empty.
  - Added the required column `role_id` to the `role_permissions` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updated_at` to the `roles` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "feedback" DROP CONSTRAINT "feedback_userId_fkey";

-- DropForeignKey
ALTER TABLE "kiosk_activations" DROP CONSTRAINT "kiosk_activations_kioskId_fkey";

-- DropForeignKey
ALTER TABLE "logs" DROP CONSTRAINT "logs_userId_fkey";

-- DropForeignKey
ALTER TABLE "passkeys" DROP CONSTRAINT "passkeys_userId_fkey";

-- DropForeignKey
ALTER TABLE "role_permissions" DROP CONSTRAINT "role_permissions_permissionId_fkey";

-- DropForeignKey
ALTER TABLE "role_permissions" DROP CONSTRAINT "role_permissions_roleId_fkey";

-- DropForeignKey
ALTER TABLE "support_tickets" DROP CONSTRAINT "support_tickets_assigneeId_fkey";

-- DropForeignKey
ALTER TABLE "support_tickets" DROP CONSTRAINT "support_tickets_userId_fkey";

-- DropIndex
DROP INDEX "passkeys_credentialId_key";

-- DropIndex
DROP INDEX "users_samlNameId_key";

-- AlterTable
ALTER TABLE "admin_pins" DROP COLUMN "globalPin",
DROP COLUMN "kioskPins",
DROP COLUMN "updatedAt",
ADD COLUMN     "global_pin" TEXT,
ADD COLUMN     "kiosk_pins" JSONB,
ADD COLUMN     "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- AlterTable
ALTER TABLE "assets" DROP COLUMN "mimeType",
DROP COLUMN "sizeBytes",
DROP COLUMN "uploadedAt",
ADD COLUMN     "mime_type" TEXT,
ADD COLUMN     "size_bytes" INTEGER,
ADD COLUMN     "uploaded_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- AlterTable
ALTER TABLE "config" DROP COLUMN "updatedAt",
ADD COLUMN     "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- AlterTable
ALTER TABLE "feedback" DROP COLUMN "userId",
ADD COLUMN     "user_id" TEXT;

-- AlterTable
ALTER TABLE "kiosk_activations" DROP COLUMN "createdAt",
DROP COLUMN "expiresAt",
DROP COLUMN "kioskId",
DROP COLUMN "qrCode",
DROP COLUMN "usedAt",
ADD COLUMN     "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "expires_at" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "kiosk_id" TEXT,
ADD COLUMN     "qr_code" TEXT NOT NULL,
ADD COLUMN     "used_at" TIMESTAMP(3);

-- AlterTable
ALTER TABLE "kiosks" DROP COLUMN "bgUrl",
DROP COLUMN "brbMsg",
DROP COLUMN "closedMsg",
DROP COLUMN "createdAt",
DROP COLUMN "currentStatus",
DROP COLUMN "errorMsg",
DROP COLUMN "lastSeen",
DROP COLUMN "logoUrl",
DROP COLUMN "lunchMsg",
DROP COLUMN "meetingMsg",
DROP COLUMN "openMsg",
DROP COLUMN "statusEnabled",
DROP COLUMN "unavailableMsg",
DROP COLUMN "updatedAt",
ADD COLUMN     "bg_url" TEXT,
ADD COLUMN     "brb_msg" TEXT,
ADD COLUMN     "closed_msg" TEXT,
ADD COLUMN     "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "current_status" TEXT,
ADD COLUMN     "error_msg" TEXT,
ADD COLUMN     "last_seen" TIMESTAMP(3),
ADD COLUMN     "logo_url" TEXT,
ADD COLUMN     "lunch_msg" TEXT,
ADD COLUMN     "meeting_msg" TEXT,
ADD COLUMN     "open_msg" TEXT,
ADD COLUMN     "status_enabled" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "unavailable_msg" TEXT,
ADD COLUMN     "updated_at" TIMESTAMP(3) NOT NULL;

-- AlterTable
ALTER TABLE "knowledge_base_articles" DROP COLUMN "createdAt",
DROP COLUMN "updatedAt",
ADD COLUMN     "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- AlterTable
ALTER TABLE "logs" DROP COLUMN "emailStatus",
DROP COLUMN "servicenowId",
DROP COLUMN "ticketId",
DROP COLUMN "userId",
ADD COLUMN     "email_status" TEXT,
ADD COLUMN     "servicenow_id" TEXT,
ADD COLUMN     "ticket_id" TEXT,
ADD COLUMN     "user_id" TEXT;

-- AlterTable
ALTER TABLE "notifications" DROP COLUMN "createdAt",
DROP COLUMN "updatedAt",
ADD COLUMN     "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "updated_at" TIMESTAMP(3) NOT NULL;

-- AlterTable
ALTER TABLE "passkeys" DROP COLUMN "backedUp",
DROP COLUMN "createdAt",
DROP COLUMN "credentialId",
DROP COLUMN "deviceType",
DROP COLUMN "lastUsed",
DROP COLUMN "publicKey",
DROP COLUMN "userId",
ADD COLUMN     "backed_up" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "credential_id" TEXT NOT NULL,
ADD COLUMN     "device_type" TEXT,
ADD COLUMN     "last_used" TIMESTAMP(3),
ADD COLUMN     "public_key" TEXT NOT NULL,
ADD COLUMN     "user_id" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "permissions" DROP COLUMN "createdAt",
ADD COLUMN     "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- AlterTable
ALTER TABLE "role_permissions" DROP CONSTRAINT "role_permissions_pkey",
DROP COLUMN "assignedAt",
DROP COLUMN "permissionId",
DROP COLUMN "roleId",
ADD COLUMN     "assigned_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "permission_id" INTEGER NOT NULL,
ADD COLUMN     "role_id" INTEGER NOT NULL,
ADD CONSTRAINT "role_permissions_pkey" PRIMARY KEY ("role_id", "permission_id");

-- AlterTable
ALTER TABLE "roles" DROP COLUMN "createdAt",
ADD COLUMN     "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "updated_at" TIMESTAMP(3) NOT NULL;

-- Before making updated_at NOT NULL, set it for all existing rows
UPDATE "roles" SET "updated_at" = CURRENT_TIMESTAMP WHERE "updated_at" IS NULL;

-- AlterTable
ALTER TABLE "sso_configurations" DROP COLUMN "updatedAt",
ADD COLUMN     "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- AlterTable
ALTER TABLE "support_tickets" DROP COLUMN "assigneeId",
DROP COLUMN "createdAt",
DROP COLUMN "updatedAt",
DROP COLUMN "userId",
ADD COLUMN     "assignee_id" TEXT,
ADD COLUMN     "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "user_id" TEXT;

-- AlterTable
ALTER TABLE "user_roles" DROP COLUMN "assignedAt",
ADD COLUMN     "assigned_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- AlterTable
ALTER TABLE "users" DROP COLUMN "lastLogin",
DROP COLUMN "lastSamlLogin",
DROP COLUMN "samlNameId",
DROP COLUMN "samlSessionIndex",
DROP COLUMN "twoFactorBackupCodes",
DROP COLUMN "twoFactorEnabled",
DROP COLUMN "twoFactorSecret",
DROP COLUMN "twoFactorVerified",
ADD COLUMN     "last_login" TIMESTAMP(3),
ADD COLUMN     "last_saml_login" TIMESTAMP(3),
ADD COLUMN     "saml_name_id" TEXT,
ADD COLUMN     "saml_session_index" TEXT,
ADD COLUMN     "two_factor_backup_codes" JSONB,
ADD COLUMN     "two_factor_enabled" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "two_factor_secret" TEXT,
ADD COLUMN     "two_factor_verified" BOOLEAN NOT NULL DEFAULT false;

-- CreateIndex
CREATE UNIQUE INDEX "passkeys_credential_id_key" ON "passkeys"("credential_id");

-- CreateIndex
CREATE UNIQUE INDEX "users_saml_name_id_key" ON "users"("saml_name_id");

-- RenameForeignKey
ALTER TABLE "user_roles" RENAME CONSTRAINT "user_roles_roleId_fkey" TO "user_roles_role_id_fkey";

-- RenameForeignKey
ALTER TABLE "user_roles" RENAME CONSTRAINT "user_roles_userId_fkey" TO "user_roles_user_id_fkey";

-- AddForeignKey
ALTER TABLE "role_permissions" ADD CONSTRAINT "role_permissions_permission_id_fkey" FOREIGN KEY ("permission_id") REFERENCES "permissions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "role_permissions" ADD CONSTRAINT "role_permissions_role_id_fkey" FOREIGN KEY ("role_id") REFERENCES "roles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "passkeys" ADD CONSTRAINT "passkeys_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "logs" ADD CONSTRAINT "logs_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "feedback" ADD CONSTRAINT "feedback_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "kiosk_activations" ADD CONSTRAINT "kiosk_activations_kiosk_id_fkey" FOREIGN KEY ("kiosk_id") REFERENCES "kiosks"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "support_tickets" ADD CONSTRAINT "support_tickets_assignee_id_fkey" FOREIGN KEY ("assignee_id") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "support_tickets" ADD CONSTRAINT "support_tickets_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;
