/*
  Warnings:

  - The primary key for the `Card` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `urlPath` on the `Card` table. All the data in the column will be lost.
  - The primary key for the `CardAccolades` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `CardAchievements` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `CardAdditionalLinks` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `CardBusinessGoals` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `CardBusinessNeeds` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `CardEducations` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `CardEmails` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `CardPhones` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `CardPortfolio` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `CardServices` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `CardSocialMedias` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `CardWebsites` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `UserAuth` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `id` on the `UserAuth` table. All the data in the column will be lost.
  - The primary key for the `UserBio` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `id` on the `UserBio` table. All the data in the column will be lost.
  - The primary key for the `UserPhoto` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - A unique constraint covering the columns `[userId,email,phone]` on the table `UserAuth` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[userId,email,phone]` on the table `UserBio` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[userId,profileAvatar]` on the table `UserBio` will be added. If there are existing duplicate values, this will fail.
  - The required column `cardId` was added to the `Card` table with a prisma-level default value. This is not possible if the table is not empty. Please add this column as optional, then populate it before making it required.
  - The required column `userId` was added to the `UserAuth` table with a prisma-level default value. This is not possible if the table is not empty. Please add this column as optional, then populate it before making it required.
  - Added the required column `userId` to the `UserBio` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "Card" DROP CONSTRAINT "Card_userId_userAvatar_fkey";

-- DropForeignKey
ALTER TABLE "CardAccolades" DROP CONSTRAINT "CardAccolades_cardId_fkey";

-- DropForeignKey
ALTER TABLE "CardAchievements" DROP CONSTRAINT "CardAchievements_cardId_fkey";

-- DropForeignKey
ALTER TABLE "CardAdditionalLinks" DROP CONSTRAINT "CardAdditionalLinks_cardId_fkey";

-- DropForeignKey
ALTER TABLE "CardBusinessGoals" DROP CONSTRAINT "CardBusinessGoals_cardId_fkey";

-- DropForeignKey
ALTER TABLE "CardBusinessNeeds" DROP CONSTRAINT "CardBusinessNeeds_cardId_fkey";

-- DropForeignKey
ALTER TABLE "CardEducations" DROP CONSTRAINT "CardEducations_cardId_fkey";

-- DropForeignKey
ALTER TABLE "CardEmails" DROP CONSTRAINT "CardEmails_cardId_fkey";

-- DropForeignKey
ALTER TABLE "CardPhones" DROP CONSTRAINT "CardPhones_cardId_fkey";

-- DropForeignKey
ALTER TABLE "CardPhotos" DROP CONSTRAINT "CardPhotos_cardId_fkey";

-- DropForeignKey
ALTER TABLE "CardPortfolio" DROP CONSTRAINT "CardPortfolio_cardId_fkey";

-- DropForeignKey
ALTER TABLE "CardServices" DROP CONSTRAINT "CardServices_cardId_fkey";

-- DropForeignKey
ALTER TABLE "CardSocialMedias" DROP CONSTRAINT "CardSocialMedias_cardId_fkey";

-- DropForeignKey
ALTER TABLE "CardWebsites" DROP CONSTRAINT "CardWebsites_cardId_fkey";

-- DropForeignKey
ALTER TABLE "Link" DROP CONSTRAINT "Link_cardOne_fkey";

-- DropForeignKey
ALTER TABLE "Link" DROP CONSTRAINT "Link_cardTwo_fkey";

-- DropForeignKey
ALTER TABLE "UserBio" DROP CONSTRAINT "UserBio_id_email_phone_fkey";

-- DropForeignKey
ALTER TABLE "UserPhoto" DROP CONSTRAINT "UserPhoto_userId_fkey";

-- DropIndex
DROP INDEX "UserAuth_id_email_phone_key";

-- DropIndex
DROP INDEX "UserBio_id_email_phone_key";

-- DropIndex
DROP INDEX "UserBio_id_profileAvatar_key";

-- AlterTable
ALTER TABLE "Card" DROP CONSTRAINT "Card_pkey",
DROP COLUMN "urlPath",
ADD COLUMN     "cardId" TEXT NOT NULL,
ALTER COLUMN "userId" SET DATA TYPE TEXT,
ADD CONSTRAINT "Card_pkey" PRIMARY KEY ("cardId");

-- AlterTable
ALTER TABLE "CardAccolades" DROP CONSTRAINT "CardAccolades_pkey",
ALTER COLUMN "id" DROP DEFAULT,
ALTER COLUMN "id" SET DATA TYPE TEXT,
ADD CONSTRAINT "CardAccolades_pkey" PRIMARY KEY ("id");
DROP SEQUENCE "CardAccolades_id_seq";

-- AlterTable
ALTER TABLE "CardAchievements" DROP CONSTRAINT "CardAchievements_pkey",
ALTER COLUMN "id" DROP DEFAULT,
ALTER COLUMN "id" SET DATA TYPE TEXT,
ADD CONSTRAINT "CardAchievements_pkey" PRIMARY KEY ("id");
DROP SEQUENCE "CardAchievements_id_seq";

-- AlterTable
ALTER TABLE "CardAdditionalLinks" DROP CONSTRAINT "CardAdditionalLinks_pkey",
ALTER COLUMN "id" DROP DEFAULT,
ALTER COLUMN "id" SET DATA TYPE TEXT,
ADD CONSTRAINT "CardAdditionalLinks_pkey" PRIMARY KEY ("id");
DROP SEQUENCE "CardAdditionalLinks_id_seq";

-- AlterTable
ALTER TABLE "CardBusinessGoals" DROP CONSTRAINT "CardBusinessGoals_pkey",
ALTER COLUMN "id" DROP DEFAULT,
ALTER COLUMN "id" SET DATA TYPE TEXT,
ADD CONSTRAINT "CardBusinessGoals_pkey" PRIMARY KEY ("id");
DROP SEQUENCE "CardBusinessGoals_id_seq";

-- AlterTable
ALTER TABLE "CardBusinessNeeds" DROP CONSTRAINT "CardBusinessNeeds_pkey",
ALTER COLUMN "id" DROP DEFAULT,
ALTER COLUMN "id" SET DATA TYPE TEXT,
ADD CONSTRAINT "CardBusinessNeeds_pkey" PRIMARY KEY ("id");
DROP SEQUENCE "CardBusinessNeeds_id_seq";

-- AlterTable
ALTER TABLE "CardEducations" DROP CONSTRAINT "CardEducations_pkey",
ALTER COLUMN "id" DROP DEFAULT,
ALTER COLUMN "id" SET DATA TYPE TEXT,
ADD CONSTRAINT "CardEducations_pkey" PRIMARY KEY ("id");
DROP SEQUENCE "CardEducations_id_seq";

-- AlterTable
ALTER TABLE "CardEmails" DROP CONSTRAINT "CardEmails_pkey",
ALTER COLUMN "id" DROP DEFAULT,
ALTER COLUMN "id" SET DATA TYPE TEXT,
ADD CONSTRAINT "CardEmails_pkey" PRIMARY KEY ("id");
DROP SEQUENCE "CardEmails_id_seq";

-- AlterTable
ALTER TABLE "CardPhones" DROP CONSTRAINT "CardPhones_pkey",
ALTER COLUMN "id" DROP DEFAULT,
ALTER COLUMN "id" SET DATA TYPE TEXT,
ADD CONSTRAINT "CardPhones_pkey" PRIMARY KEY ("id");
DROP SEQUENCE "CardPhones_id_seq";

-- AlterTable
ALTER TABLE "CardPortfolio" DROP CONSTRAINT "CardPortfolio_pkey",
ALTER COLUMN "id" DROP DEFAULT,
ALTER COLUMN "id" SET DATA TYPE TEXT,
ADD CONSTRAINT "CardPortfolio_pkey" PRIMARY KEY ("id");
DROP SEQUENCE "CardPortfolio_id_seq";

-- AlterTable
ALTER TABLE "CardServices" DROP CONSTRAINT "CardServices_pkey",
ALTER COLUMN "id" DROP DEFAULT,
ALTER COLUMN "id" SET DATA TYPE TEXT,
ADD CONSTRAINT "CardServices_pkey" PRIMARY KEY ("id");
DROP SEQUENCE "CardServices_id_seq";

-- AlterTable
ALTER TABLE "CardSocialMedias" DROP CONSTRAINT "CardSocialMedias_pkey",
ALTER COLUMN "id" DROP DEFAULT,
ALTER COLUMN "id" SET DATA TYPE TEXT,
ADD CONSTRAINT "CardSocialMedias_pkey" PRIMARY KEY ("id");
DROP SEQUENCE "CardSocialMedias_id_seq";

-- AlterTable
ALTER TABLE "CardWebsites" DROP CONSTRAINT "CardWebsites_pkey",
ALTER COLUMN "id" DROP DEFAULT,
ALTER COLUMN "id" SET DATA TYPE TEXT,
ADD CONSTRAINT "CardWebsites_pkey" PRIMARY KEY ("id");
DROP SEQUENCE "CardWebsites_id_seq";

-- AlterTable
ALTER TABLE "UserAuth" DROP CONSTRAINT "UserAuth_pkey",
DROP COLUMN "id",
ADD COLUMN     "userId" TEXT NOT NULL,
ADD CONSTRAINT "UserAuth_pkey" PRIMARY KEY ("userId");

-- AlterTable
ALTER TABLE "UserBio" DROP CONSTRAINT "UserBio_pkey",
DROP COLUMN "id",
ADD COLUMN     "userId" TEXT NOT NULL,
ADD CONSTRAINT "UserBio_pkey" PRIMARY KEY ("userId");

-- AlterTable
ALTER TABLE "UserPhoto" DROP CONSTRAINT "UserPhoto_pkey",
ALTER COLUMN "userId" SET DATA TYPE TEXT,
ADD CONSTRAINT "UserPhoto_pkey" PRIMARY KEY ("userId", "pathToFile");

-- CreateIndex
CREATE UNIQUE INDEX "UserAuth_userId_email_phone_key" ON "UserAuth"("userId", "email", "phone");

-- CreateIndex
CREATE UNIQUE INDEX "UserBio_userId_email_phone_key" ON "UserBio"("userId", "email", "phone");

-- CreateIndex
CREATE UNIQUE INDEX "UserBio_userId_profileAvatar_key" ON "UserBio"("userId", "profileAvatar");

-- AddForeignKey
ALTER TABLE "UserBio" ADD CONSTRAINT "UserBio_userId_email_phone_fkey" FOREIGN KEY ("userId", "email", "phone") REFERENCES "UserAuth"("userId", "email", "phone") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserPhoto" ADD CONSTRAINT "UserPhoto_userId_fkey" FOREIGN KEY ("userId") REFERENCES "UserBio"("userId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Card" ADD CONSTRAINT "Card_userId_userAvatar_fkey" FOREIGN KEY ("userId", "userAvatar") REFERENCES "UserBio"("userId", "profileAvatar") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CardPhotos" ADD CONSTRAINT "CardPhotos_cardId_fkey" FOREIGN KEY ("cardId") REFERENCES "Card"("cardId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CardEmails" ADD CONSTRAINT "CardEmails_cardId_fkey" FOREIGN KEY ("cardId") REFERENCES "Card"("cardId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CardPhones" ADD CONSTRAINT "CardPhones_cardId_fkey" FOREIGN KEY ("cardId") REFERENCES "Card"("cardId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CardWebsites" ADD CONSTRAINT "CardWebsites_cardId_fkey" FOREIGN KEY ("cardId") REFERENCES "Card"("cardId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CardSocialMedias" ADD CONSTRAINT "CardSocialMedias_cardId_fkey" FOREIGN KEY ("cardId") REFERENCES "Card"("cardId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CardAdditionalLinks" ADD CONSTRAINT "CardAdditionalLinks_cardId_fkey" FOREIGN KEY ("cardId") REFERENCES "Card"("cardId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CardEducations" ADD CONSTRAINT "CardEducations_cardId_fkey" FOREIGN KEY ("cardId") REFERENCES "Card"("cardId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CardAccolades" ADD CONSTRAINT "CardAccolades_cardId_fkey" FOREIGN KEY ("cardId") REFERENCES "Card"("cardId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CardAchievements" ADD CONSTRAINT "CardAchievements_cardId_fkey" FOREIGN KEY ("cardId") REFERENCES "Card"("cardId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CardBusinessGoals" ADD CONSTRAINT "CardBusinessGoals_cardId_fkey" FOREIGN KEY ("cardId") REFERENCES "Card"("cardId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CardBusinessNeeds" ADD CONSTRAINT "CardBusinessNeeds_cardId_fkey" FOREIGN KEY ("cardId") REFERENCES "Card"("cardId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CardServices" ADD CONSTRAINT "CardServices_cardId_fkey" FOREIGN KEY ("cardId") REFERENCES "Card"("cardId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CardPortfolio" ADD CONSTRAINT "CardPortfolio_cardId_fkey" FOREIGN KEY ("cardId") REFERENCES "Card"("cardId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Link" ADD CONSTRAINT "Link_cardOne_fkey" FOREIGN KEY ("cardOne") REFERENCES "Card"("cardId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Link" ADD CONSTRAINT "Link_cardTwo_fkey" FOREIGN KEY ("cardTwo") REFERENCES "Card"("cardId") ON DELETE CASCADE ON UPDATE CASCADE;
