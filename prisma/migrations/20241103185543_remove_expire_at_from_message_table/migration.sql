/*
  Warnings:

  - You are about to drop the column `expire_at` on the `messages` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "messages" DROP COLUMN "expire_at";
