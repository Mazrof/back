/*
  Warnings:

  - A unique constraint covering the columns `[personal_chat_id]` on the table `participants` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[community_id]` on the table `participants` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateEnum
CREATE TYPE "ParticipiantTypes" AS ENUM ('personalChat', 'community');

-- DropIndex
DROP INDEX "personalchat_user2id_user1id_key";

-- AlterTable
ALTER TABLE "participants" ADD COLUMN     "type" "ParticipiantTypes" NOT NULL DEFAULT 'personalChat';

-- CreateIndex
CREATE UNIQUE INDEX "participants_personal_chat_id_key" ON "participants"("personal_chat_id");

-- CreateIndex
CREATE UNIQUE INDEX "participants_community_id_key" ON "participants"("community_id");
