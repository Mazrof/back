/*
  Warnings:

  - The values [deleted] on the enum `MessageStatus` will be removed. If these variants are still used in the database, this will fail.
  - You are about to drop the column `current_role` on the `channelsubscriptions` table. All the data in the column will be lost.
  - You are about to drop the column `role` on the `groupmemberships` table. All the data in the column will be lost.
  - You are about to drop the column `status` on the `groups` table. All the data in the column will be lost.
  - You are about to drop the column `attachment` on the `messages` table. All the data in the column will be lost.
  - You are about to drop the column `expire_at` on the `messages` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[group_id]` on the table `admingroupfilters` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[community_id]` on the table `channels` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[invitationLink]` on the table `channels` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[community_id]` on the table `groups` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[invitationLink]` on the table `groups` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `invitationLink` to the `channels` table without a default value. This is not possible if the table is not empty.
  - Made the column `community_id` on table `channels` required. This step will fail if there are existing NULL values in that column.
  - Made the column `can_add_comments` on table `channels` required. This step will fail if there are existing NULL values in that column.
  - Made the column `has_download_permissions` on table `channelsubscriptions` required. This step will fail if there are existing NULL values in that column.
  - Made the column `privacy` on table `communities` required. This step will fail if there are existing NULL values in that column.
  - Made the column `creator_id` on table `communities` required. This step will fail if there are existing NULL values in that column.
  - Made the column `has_download_permissions` on table `groupmemberships` required. This step will fail if there are existing NULL values in that column.
  - Made the column `has_message_permissions` on table `groupmemberships` required. This step will fail if there are existing NULL values in that column.
  - Made the column `add_to_group_permission` on table `groupmemberships` required. This step will fail if there are existing NULL values in that column.
  - Added the required column `invitationLink` to the `groups` table without a default value. This is not possible if the table is not empty.
  - Made the column `community_id` on table `groups` required. This step will fail if there are existing NULL values in that column.
  - Made the column `group_size` on table `groups` required. This step will fail if there are existing NULL values in that column.

*/
-- CreateEnum
CREATE TYPE "community_role" AS ENUM ('admin', 'member');

-- AlterEnum
BEGIN;
CREATE TYPE "MessageStatus_new" AS ENUM ('usual', 'pinned', 'drafted');
ALTER TABLE "messages" ALTER COLUMN "status" DROP DEFAULT;
ALTER TABLE "messages" ALTER COLUMN "status" TYPE "MessageStatus_new" USING ("status"::text::"MessageStatus_new");
ALTER TYPE "MessageStatus" RENAME TO "MessageStatus_old";
ALTER TYPE "MessageStatus_new" RENAME TO "MessageStatus";
DROP TYPE "MessageStatus_old";
ALTER TABLE "messages" ALTER COLUMN "status" SET DEFAULT 'usual';
COMMIT;

-- AlterTable
ALTER TABLE "channels" ADD COLUMN     "invitationLink" TEXT NOT NULL,
ALTER COLUMN "community_id" SET NOT NULL,
ALTER COLUMN "can_add_comments" SET NOT NULL,
ALTER COLUMN "can_add_comments" SET DEFAULT false;

-- AlterTable
ALTER TABLE "channelsubscriptions" DROP COLUMN "current_role",
ADD COLUMN     "active" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "community_role" "community_role" NOT NULL DEFAULT 'member',
ALTER COLUMN "has_download_permissions" SET NOT NULL;

-- AlterTable
ALTER TABLE "communities" ADD COLUMN     "active" BOOLEAN NOT NULL DEFAULT true,
ALTER COLUMN "privacy" SET NOT NULL,
ALTER COLUMN "creator_id" SET NOT NULL;

-- AlterTable
ALTER TABLE "groupmemberships" DROP COLUMN "role",
ADD COLUMN     "active" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "community_role" "community_role" NOT NULL DEFAULT 'member',
ALTER COLUMN "has_download_permissions" SET NOT NULL,
ALTER COLUMN "has_message_permissions" SET NOT NULL,
ALTER COLUMN "add_to_group_permission" SET NOT NULL;

-- AlterTable
ALTER TABLE "groups" DROP COLUMN "status",
ADD COLUMN     "invitationLink" TEXT NOT NULL,
ALTER COLUMN "community_id" SET NOT NULL,
ALTER COLUMN "group_size" SET NOT NULL;

-- AlterTable
ALTER TABLE "messages" DROP COLUMN "attachment",
DROP COLUMN "expire_at";

-- AlterTable
ALTER TABLE "users" ADD COLUMN     "is_email_verified" BOOLEAN DEFAULT false,
ADD COLUMN     "is_phone_verified" BOOLEAN DEFAULT false,
ADD COLUMN     "private_key" TEXT,
ADD COLUMN     "public_key" TEXT,
ALTER COLUMN "provider_id" SET DATA TYPE TEXT;

-- DropEnum
DROP TYPE "channel_role";

-- CreateIndex
CREATE UNIQUE INDEX "admingroupfilters_group_id_key" ON "admingroupfilters"("group_id");

-- CreateIndex
CREATE UNIQUE INDEX "channels_community_id_key" ON "channels"("community_id");

-- CreateIndex
CREATE UNIQUE INDEX "channels_invitationLink_key" ON "channels"("invitationLink");

-- CreateIndex
CREATE UNIQUE INDEX "groups_community_id_key" ON "groups"("community_id");

-- CreateIndex
CREATE UNIQUE INDEX "groups_invitationLink_key" ON "groups"("invitationLink");

-- CreateIndex
CREATE INDEX "messages_participant_id_idx" ON "messages"("participant_id");
