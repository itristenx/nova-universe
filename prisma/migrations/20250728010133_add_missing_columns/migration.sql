/*
  Warnings:

  - You are about to drop the column `createdAt` on the `directory_integrations` table. All the data in the column will be lost.
  - You are about to drop the column `updatedAt` on the `directory_integrations` table. All the data in the column will be lost.
  - Added the required column `updated_at` to the `directory_integrations` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "config" ADD COLUMN     "category" TEXT,
ADD COLUMN     "description" TEXT,
ADD COLUMN     "is_public" BOOLEAN DEFAULT false,
ADD COLUMN     "value_type" TEXT;

-- AlterTable
ALTER TABLE "directory_integrations" DROP COLUMN "createdAt",
DROP COLUMN "updatedAt",
ADD COLUMN     "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "updated_at" TIMESTAMP(3) NOT NULL;

-- AlterTable
ALTER TABLE "permissions" ADD COLUMN     "action" TEXT,
ADD COLUMN     "resource" TEXT;
