/*
  Warnings:

  - A unique constraint covering the columns `[phone]` on the table `UserBio` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "UserBio_phone_key" ON "UserBio"("phone");
