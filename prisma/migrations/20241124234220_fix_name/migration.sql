/*
  Warnings:

  - You are about to drop the column `status` on the `groups` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "channelsubscriptions" ALTER COLUMN "status" DROP NOT NULL;

-- AlterTable
ALTER TABLE "communities" ADD COLUMN     "status" BOOLEAN DEFAULT true;

-- AlterTable
ALTER TABLE "groups" DROP COLUMN "status";
