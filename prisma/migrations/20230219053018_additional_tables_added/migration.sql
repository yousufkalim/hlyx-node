/*
  Warnings:

  - You are about to drop the column `academicFocus` on the `Card` table. All the data in the column will be lost.
  - You are about to drop the column `accolades` on the `Card` table. All the data in the column will be lost.
  - You are about to drop the column `businessGoals` on the `Card` table. All the data in the column will be lost.
  - You are about to drop the column `degreeType` on the `Card` table. All the data in the column will be lost.
  - You are about to drop the column `educationLevel` on the `Card` table. All the data in the column will be lost.
  - You are about to drop the column `needsAsks` on the `Card` table. All the data in the column will be lost.
  - You are about to drop the column `schoolName` on the `Card` table. All the data in the column will be lost.
  - Added the required column `image` to the `CardPortfolio` table without a default value. This is not possible if the table is not empty.
  - Added the required column `subTitle` to the `CardPortfolio` table without a default value. This is not possible if the table is not empty.
  - Added the required column `title` to the `CardPortfolio` table without a default value. This is not possible if the table is not empty.
  - Added the required column `type` to the `CardPortfolio` table without a default value. This is not possible if the table is not empty.
  - Added the required column `subtitle` to the `CardServices` table without a default value. This is not possible if the table is not empty.
  - Added the required column `type` to the `CardServices` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "BusinessGoalsStatus" AS ENUM ('Active', 'Achieved', 'Assist');

-- CreateEnum
CREATE TYPE "BusinessNeedsStatus" AS ENUM ('Active', 'Filled');

-- CreateEnum
CREATE TYPE "ServiceTypes" AS ENUM ('featured', 'main');

-- CreateEnum
CREATE TYPE "PortfolioType" AS ENUM ('featured', 'research', 'splicing');

-- AlterTable
ALTER TABLE "Card" DROP COLUMN "academicFocus",
DROP COLUMN "accolades",
DROP COLUMN "businessGoals",
DROP COLUMN "degreeType",
DROP COLUMN "educationLevel",
DROP COLUMN "needsAsks",
DROP COLUMN "schoolName";

-- AlterTable
ALTER TABLE "CardPortfolio" ADD COLUMN     "image" TEXT NOT NULL,
ADD COLUMN     "subTitle" TEXT NOT NULL,
ADD COLUMN     "title" TEXT NOT NULL,
ADD COLUMN     "type" "PortfolioType" NOT NULL;

-- AlterTable
ALTER TABLE "CardServices" ADD COLUMN     "subtitle" TEXT NOT NULL,
ADD COLUMN     "type" "ServiceTypes" NOT NULL;

-- CreateTable
CREATE TABLE "CardEducations" (
    "id" SERIAL NOT NULL,
    "academicLevel" TEXT NOT NULL,
    "schoolName" TEXT NOT NULL,
    "graduationYear" TEXT NOT NULL,
    "academicFocus" TEXT NOT NULL,
    "degreeType" "DegreeType",
    "cardId" TEXT NOT NULL,

    CONSTRAINT "CardEducations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CardAccolades" (
    "id" SERIAL NOT NULL,
    "title" TEXT NOT NULL,
    "fromWho" TEXT NOT NULL,
    "startDate" TIMESTAMP(3) NOT NULL,
    "endDate" TIMESTAMP(3) NOT NULL,
    "cardId" TEXT NOT NULL,

    CONSTRAINT "CardAccolades_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CardBusinessGoals" (
    "id" SERIAL NOT NULL,
    "status" "BusinessGoalsStatus" NOT NULL,
    "title" TEXT NOT NULL,
    "subTitle" TEXT NOT NULL,
    "percentComplete" INTEGER NOT NULL,
    "startDate" TIMESTAMP(3) NOT NULL,
    "endDate" TIMESTAMP(3) NOT NULL,
    "about" TEXT NOT NULL,
    "cardId" TEXT NOT NULL,

    CONSTRAINT "CardBusinessGoals_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CardBusinessNeeds" (
    "id" SERIAL NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "title" TEXT NOT NULL,
    "subTitle" TEXT NOT NULL,
    "status" "BusinessNeedsStatus" NOT NULL,
    "cardId" TEXT NOT NULL,

    CONSTRAINT "CardBusinessNeeds_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "CardEducations" ADD CONSTRAINT "CardEducations_cardId_fkey" FOREIGN KEY ("cardId") REFERENCES "Card"("urlPath") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CardAccolades" ADD CONSTRAINT "CardAccolades_cardId_fkey" FOREIGN KEY ("cardId") REFERENCES "Card"("urlPath") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CardBusinessGoals" ADD CONSTRAINT "CardBusinessGoals_cardId_fkey" FOREIGN KEY ("cardId") REFERENCES "Card"("urlPath") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CardBusinessNeeds" ADD CONSTRAINT "CardBusinessNeeds_cardId_fkey" FOREIGN KEY ("cardId") REFERENCES "Card"("urlPath") ON DELETE RESTRICT ON UPDATE CASCADE;
