/*
  Warnings:

  - A unique constraint covering the columns `[userName]` on the table `UserBio` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "UserBio" ADD COLUMN     "userName" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "UserBio_userName_key" ON "UserBio"("userName");
