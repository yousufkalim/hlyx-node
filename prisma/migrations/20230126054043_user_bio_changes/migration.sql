/*
  Warnings:

  - A unique constraint covering the columns `[id,email,phone]` on the table `User` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[id,email,phone]` on the table `UserBio` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `email` to the `UserBio` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "UserBio" DROP CONSTRAINT "UserBio_id_fkey";

-- AlterTable
ALTER TABLE "UserBio" ADD COLUMN     "email" TEXT NOT NULL,
ADD COLUMN     "phone" TEXT,
ADD COLUMN     "role" TEXT,
ADD COLUMN     "website" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "User_id_email_phone_key" ON "User"("id", "email", "phone");

-- CreateIndex
CREATE UNIQUE INDEX "UserBio_id_email_phone_key" ON "UserBio"("id", "email", "phone");

-- AddForeignKey
ALTER TABLE "UserBio" ADD CONSTRAINT "UserBio_id_email_phone_fkey" FOREIGN KEY ("id", "email", "phone") REFERENCES "User"("id", "email", "phone") ON DELETE RESTRICT ON UPDATE CASCADE;
