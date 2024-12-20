/*
  Warnings:

  - The `duration` column on the `mutedparticipants` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- CreateEnum
CREATE TYPE "MuteDuration" AS ENUM ('oneHour', 'oneDay', 'oneWeek', 'oneMonth', 'forever');

-- AlterTable
ALTER TABLE "communities" ADD COLUMN     "image_url" TEXT NOT NULL DEFAULT '';

-- AlterTable
ALTER TABLE "mutedparticipants" DROP COLUMN "duration",
ADD COLUMN     "duration" "MuteDuration" NOT NULL DEFAULT 'forever';
