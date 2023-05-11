/*
  Warnings:

  - You are about to drop the column `calendar` on the `Card` table. All the data in the column will be lost.
  - The `type` column on the `CardEmails` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - Added the required column `profileLayout` to the `Card` table without a default value. This is not possible if the table is not empty.
  - Made the column `company` on table `Card` required. This step will fail if there are existing NULL values in that column.
  - Made the column `profTitle` on table `Card` required. This step will fail if there are existing NULL values in that column.
  - Made the column `occupation` on table `Card` required. This step will fail if there are existing NULL values in that column.
  - Made the column `industry` on table `Card` required. This step will fail if there are existing NULL values in that column.
  - Made the column `city` on table `Card` required. This step will fail if there are existing NULL values in that column.

*/
-- CreateEnum
CREATE TYPE "ProfileLayout" AS ENUM ('minimal', 'premium');

-- AlterEnum
ALTER TYPE "EmailType" ADD VALUE 'alternate';

-- AlterTable
ALTER TABLE "Card" DROP COLUMN "calendar",
ADD COLUMN     "profileLayout" "ProfileLayout" NOT NULL,
ALTER COLUMN "company" SET NOT NULL,
ALTER COLUMN "profTitle" SET NOT NULL,
ALTER COLUMN "occupation" SET NOT NULL,
ALTER COLUMN "industry" SET NOT NULL,
ALTER COLUMN "city" SET NOT NULL;

-- AlterTable
ALTER TABLE "CardEmails" DROP COLUMN "type",
ADD COLUMN     "type" TEXT;

-- CreateTable
CREATE TABLE "CardCalendars" (
    "id" TEXT NOT NULL,
    "cardId" TEXT NOT NULL,
    "label" TEXT,
    "title" TEXT NOT NULL,
    "url" TEXT NOT NULL,

    CONSTRAINT "CardCalendars_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CardOfficeAddresses" (
    "id" TEXT NOT NULL,
    "cardId" TEXT NOT NULL,
    "label" TEXT,
    "streetAddress" TEXT NOT NULL,
    "city" TEXT NOT NULL,
    "state" TEXT,
    "zipCode" TEXT,

    CONSTRAINT "CardOfficeAddresses_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "CardCalendars" ADD CONSTRAINT "CardCalendars_cardId_fkey" FOREIGN KEY ("cardId") REFERENCES "Card"("cardId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CardOfficeAddresses" ADD CONSTRAINT "CardOfficeAddresses_cardId_fkey" FOREIGN KEY ("cardId") REFERENCES "Card"("cardId") ON DELETE RESTRICT ON UPDATE CASCADE;
