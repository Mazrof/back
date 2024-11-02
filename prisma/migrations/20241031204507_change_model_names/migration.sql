/*
  Warnings:

  - The `status` column on the `messages` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- CreateEnum
CREATE TYPE "MessageStatus" AS ENUM ('usual', 'pinned', 'deleted', 'drafted');

-- AlterTable
ALTER TABLE "messages" DROP COLUMN "status",
ADD COLUMN     "status" "MessageStatus" NOT NULL DEFAULT 'usual';
