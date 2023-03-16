/*
  Warnings:

  - The primary key for the `UserAuth` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `userId` on the `UserAuth` table. All the data in the column will be lost.
  - The primary key for the `UserBio` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `userId` on the `UserBio` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[id,email,phone]` on the table `UserAuth` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[id,email,phone]` on the table `UserBio` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[id,profileAvatar]` on the table `UserBio` will be added. If there are existing duplicate values, this will fail.
  - The required column `id` was added to the `UserAuth` table with a prisma-level default value. This is not possible if the table is not empty. Please add this column as optional, then populate it before making it required.
  - Added the required column `id` to the `UserBio` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "Card" DROP CONSTRAINT "Card_userId_userAvatar_fkey";

-- DropForeignKey
ALTER TABLE "UserBio" DROP CONSTRAINT "UserBio_userId_email_phone_fkey";

-- DropForeignKey
ALTER TABLE "UserPhoto" DROP CONSTRAINT "UserPhoto_userId_fkey";

-- DropIndex
DROP INDEX "UserAuth_userId_email_phone_key";

-- DropIndex
DROP INDEX "UserBio_userId_email_phone_key";

-- DropIndex
DROP INDEX "UserBio_userId_profileAvatar_key";

-- AlterTable
ALTER TABLE "UserAuth" DROP CONSTRAINT "UserAuth_pkey",
DROP COLUMN "userId",
ADD COLUMN     "id" TEXT NOT NULL,
ADD CONSTRAINT "UserAuth_pkey" PRIMARY KEY ("id");

-- AlterTable
ALTER TABLE "UserBio" DROP CONSTRAINT "UserBio_pkey",
DROP COLUMN "userId",
ADD COLUMN     "id" TEXT NOT NULL,
ADD CONSTRAINT "UserBio_pkey" PRIMARY KEY ("id");

-- CreateIndex
CREATE UNIQUE INDEX "UserAuth_id_email_phone_key" ON "UserAuth"("id", "email", "phone");

-- CreateIndex
CREATE UNIQUE INDEX "UserBio_id_email_phone_key" ON "UserBio"("id", "email", "phone");

-- CreateIndex
CREATE UNIQUE INDEX "UserBio_id_profileAvatar_key" ON "UserBio"("id", "profileAvatar");

-- AddForeignKey
ALTER TABLE "UserBio" ADD CONSTRAINT "UserBio_id_email_phone_fkey" FOREIGN KEY ("id", "email", "phone") REFERENCES "UserAuth"("id", "email", "phone") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserPhoto" ADD CONSTRAINT "UserPhoto_userId_fkey" FOREIGN KEY ("userId") REFERENCES "UserBio"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Card" ADD CONSTRAINT "Card_userId_userAvatar_fkey" FOREIGN KEY ("userId", "userAvatar") REFERENCES "UserBio"("id", "profileAvatar") ON DELETE CASCADE ON UPDATE CASCADE;
