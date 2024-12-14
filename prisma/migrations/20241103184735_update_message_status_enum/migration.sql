/*
  Warnings:

  - The values [deleted] on the enum `MessageStatus` will be removed. If these variants are still used in the database, this will fail.

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
ALTER TABLE "groupmemberships" ADD COLUMN     "status" BOOLEAN DEFAULT true;
