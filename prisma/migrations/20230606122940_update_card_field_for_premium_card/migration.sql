/*
  Warnings:

  - You are about to drop the column `fromWho` on the `CardAccolades` table. All the data in the column will be lost.
  - You are about to drop the column `issuedYear` on the `CardAchievements` table. All the data in the column will be lost.
  - You are about to drop the column `startYear` on the `CardAchievements` table. All the data in the column will be lost.
  - You are about to drop the column `graduationYear` on the `CardEducations` table. All the data in the column will be lost.
  - You are about to drop the column `startYear` on the `CardEducations` table. All the data in the column will be lost.
  - You are about to drop the column `image` on the `CardPortfolio` table. All the data in the column will be lost.
  - Added the required column `designationType` to the `CardAccolades` table without a default value. This is not possible if the table is not empty.
  - Made the column `startDate` on table `CardAccolades` required. This step will fail if there are existing NULL values in that column.
  - Added the required column `startDate` to the `CardAchievements` table without a default value. This is not possible if the table is not empty.
  - Made the column `description` on table `CardAchievements` required. This step will fail if there are existing NULL values in that column.
  - Made the column `description` on table `CardBusinessGoals` required. This step will fail if there are existing NULL values in that column.
  - Added the required column `startDate` to the `CardEducations` table without a default value. This is not possible if the table is not empty.
  - Made the column `academicLevel` on table `CardEducations` required. This step will fail if there are existing NULL values in that column.
  - Made the column `academicFocus` on table `CardEducations` required. This step will fail if there are existing NULL values in that column.
  - Added the required column `images` to the `CardPortfolio` table without a default value. This is not possible if the table is not empty.
  - Made the column `title` on table `CardPortfolio` required. This step will fail if there are existing NULL values in that column.
  - Made the column `details` on table `CardPortfolio` required. This step will fail if there are existing NULL values in that column.
  - Made the column `subtitle` on table `CardServices` required. This step will fail if there are existing NULL values in that column.

*/
-- CreateEnum
CREATE TYPE "DesignationType" AS ENUM ('receivedAt', 'receivedFrom');

-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "DegreeType" ADD VALUE 'License';
ALTER TYPE "DegreeType" ADD VALUE 'Certificate';
ALTER TYPE "DegreeType" ADD VALUE 'Permit';
ALTER TYPE "DegreeType" ADD VALUE 'Registration';

-- AlterTable
ALTER TABLE "CardAccolades" DROP COLUMN "fromWho",
ADD COLUMN     "designationType" "DesignationType" NOT NULL,
ADD COLUMN     "organization" TEXT,
ADD COLUMN     "present" BOOLEAN DEFAULT false,
ALTER COLUMN "startDate" SET NOT NULL;

-- AlterTable
ALTER TABLE "CardAchievements" DROP COLUMN "issuedYear",
DROP COLUMN "startYear",
ADD COLUMN     "endDate" TIMESTAMP(3),
ADD COLUMN     "present" BOOLEAN DEFAULT false,
ADD COLUMN     "startDate" TIMESTAMP(3) NOT NULL,
ALTER COLUMN "description" SET NOT NULL;

-- AlterTable
ALTER TABLE "CardBusinessGoals" ADD COLUMN     "present" BOOLEAN DEFAULT false,
ALTER COLUMN "description" SET NOT NULL;

-- AlterTable
ALTER TABLE "CardEducations" DROP COLUMN "graduationYear",
DROP COLUMN "startYear",
ADD COLUMN     "endDate" TIMESTAMP(3),
ADD COLUMN     "licenseNumber" TEXT,
ADD COLUMN     "startDate" TIMESTAMP(3) NOT NULL,
ALTER COLUMN "academicLevel" SET NOT NULL,
ALTER COLUMN "academicFocus" SET NOT NULL;

-- AlterTable
ALTER TABLE "CardPortfolio" DROP COLUMN "image",
ADD COLUMN     "images" TEXT NOT NULL,
ALTER COLUMN "title" SET NOT NULL,
ALTER COLUMN "details" SET NOT NULL;

-- AlterTable
ALTER TABLE "CardServices" ADD COLUMN     "url" TEXT,
ALTER COLUMN "subtitle" SET NOT NULL;
