/*
  Warnings:

  - You are about to drop the column `communityId` on the `channels` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[community_id]` on the table `channels` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `community_id` to the `channels` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "channels" DROP CONSTRAINT "channels_communityId_fkey";

-- DropIndex
DROP INDEX "channels_communityId_key";

-- AlterTable
ALTER TABLE "channels" DROP COLUMN "communityId",
ADD COLUMN     "community_id" INTEGER NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "channels_community_id_key" ON "channels"("community_id");

-- AddForeignKey
ALTER TABLE "channels" ADD CONSTRAINT "channels_community_id_fkey" FOREIGN KEY ("community_id") REFERENCES "communities"("id") ON DELETE CASCADE ON UPDATE NO ACTION;
