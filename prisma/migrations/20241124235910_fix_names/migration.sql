/*
  Warnings:

  - You are about to drop the column `community_id` on the `channels` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[communityId]` on the table `channels` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[community_id]` on the table `groups` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `communityId` to the `channels` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "channels" DROP CONSTRAINT "channels_community_id_fkey";

-- AlterTable
ALTER TABLE "channels" DROP COLUMN "community_id",
ADD COLUMN     "communityId" INTEGER NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "channels_communityId_key" ON "channels"("communityId");

-- CreateIndex
CREATE UNIQUE INDEX "groups_community_id_key" ON "groups"("community_id");

-- AddForeignKey
ALTER TABLE "channels" ADD CONSTRAINT "channels_communityId_fkey" FOREIGN KEY ("communityId") REFERENCES "communities"("id") ON DELETE CASCADE ON UPDATE NO ACTION;
