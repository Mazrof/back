/*
  Warnings:

  - A unique constraint covering the columns `[group_id]` on the table `admingroupfilters` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[invitationLink]` on the table `groups` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `invitationLink` to the `groups` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "groups" ADD COLUMN     "invitationLink" TEXT NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "admingroupfilters_group_id_key" ON "admingroupfilters"("group_id");

-- CreateIndex
CREATE UNIQUE INDEX "groups_invitationLink_key" ON "groups"("invitationLink");

-- CreateIndex
CREATE INDEX "messages_participant_id_idx" ON "messages"("participant_id");
