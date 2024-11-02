/*
  Warnings:

  - A unique constraint covering the columns `[user2id,user1id]` on the table `personalchat` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "personalchat_user2id_user1id_key" ON "personalchat"("user2id", "user1id");
