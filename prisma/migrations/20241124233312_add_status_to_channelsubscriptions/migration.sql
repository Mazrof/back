/*
  Warnings:

  - The values [deleted] on the enum `MessageStatus` will be removed. If these variants are still used in the database, this will fail.
  - You are about to drop the column `attachment` on the `messages` table. All the data in the column will be lost.
  - You are about to drop the column `expire_at` on the `messages` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[group_id]` on the table `admingroupfilters` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[invitationLink]` on the table `groups` will be added. If there are existing duplicate values, this will fail.
  - Made the column `community_id` on table `channels` required. This step will fail if there are existing NULL values in that column.
  - Added the required column `invitationLink` to the `groups` table without a default value. This is not possible if the table is not empty.
  - Made the column `community_id` on table `groups` required. This step will fail if there are existing NULL values in that column.
  - Added the required column `public_key` to the `users` table without a default value. This is not possible if the table is not empty.

*/
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
ALTER TABLE "channels" ALTER COLUMN "community_id" SET NOT NULL;

-- AlterTable
ALTER TABLE "channelsubscriptions" ADD COLUMN     "status" BOOLEAN NOT NULL DEFAULT true;

-- AlterTable
ALTER TABLE "groupmemberships" ADD COLUMN     "status" BOOLEAN DEFAULT true;

-- AlterTable
ALTER TABLE "groups" ADD COLUMN     "invitationLink" TEXT NOT NULL,
ALTER COLUMN "community_id" SET NOT NULL;

-- AlterTable
ALTER TABLE "messages" DROP COLUMN "attachment",
DROP COLUMN "expire_at";

-- AlterTable
ALTER TABLE "users" ADD COLUMN     "private_key" TEXT,
ADD COLUMN     "public_key" TEXT NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "admingroupfilters_group_id_key" ON "admingroupfilters"("group_id");

-- CreateIndex
CREATE UNIQUE INDEX "groups_invitationLink_key" ON "groups"("invitationLink");

-- CreateIndex
CREATE INDEX "messages_participant_id_idx" ON "messages"("participant_id");
