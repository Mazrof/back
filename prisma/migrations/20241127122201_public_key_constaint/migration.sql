/*
  Warnings:

  - Made the column `public_key` on table `users` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "users" ALTER COLUMN "public_key" SET NOT NULL;
