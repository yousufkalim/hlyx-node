/*
  Warnings:

  - The values [Assist] on the enum `BusinessGoalsStatus` will be removed. If these variants are still used in the database, this will fail.
  - The values [ADMIN] on the enum `Role` will be removed. If these variants are still used in the database, this will fail.
  - You are about to drop the column `about` on the `CardBusinessGoals` table. All the data in the column will be lost.
  - You are about to drop the column `subTitle` on the `CardBusinessGoals` table. All the data in the column will be lost.
  - You are about to drop the column `subTitle` on the `CardBusinessNeeds` table. All the data in the column will be lost.
  - You are about to drop the column `subTitle` on the `CardPortfolio` table. All the data in the column will be lost.
  - You are about to drop the column `subTitle` on the `CardServices` table. All the data in the column will be lost.
  - Added the required column `media` to the `CardPortfolio` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "TemplateIdentification" AS ENUM ('DEFAULT', 'FULL');

-- CreateEnum
CREATE TYPE "PortfolioTemplateIdentification" AS ENUM ('DEFAULT');

-- AlterEnum
BEGIN;
CREATE TYPE "BusinessGoalsStatus_new" AS ENUM ('Active', 'Achieved');
ALTER TABLE "CardBusinessGoals" ALTER COLUMN "status" TYPE "BusinessGoalsStatus_new" USING ("status"::text::"BusinessGoalsStatus_new");
ALTER TYPE "BusinessGoalsStatus" RENAME TO "BusinessGoalsStatus_old";
ALTER TYPE "BusinessGoalsStatus_new" RENAME TO "BusinessGoalsStatus";
DROP TYPE "BusinessGoalsStatus_old";
COMMIT;

-- AlterEnum
BEGIN;
CREATE TYPE "Role_new" AS ENUM ('SUPER_ADMIN', 'USER', 'COMPANY');
ALTER TABLE "UserAuth" ALTER COLUMN "role" DROP DEFAULT;
ALTER TABLE "UserAuth" ALTER COLUMN "role" TYPE "Role_new" USING ("role"::text::"Role_new");
ALTER TYPE "Role" RENAME TO "Role_old";
ALTER TYPE "Role_new" RENAME TO "Role";
DROP TYPE "Role_old";
ALTER TABLE "UserAuth" ALTER COLUMN "role" SET DEFAULT 'USER';
COMMIT;

-- AlterTable
ALTER TABLE "Card" ADD COLUMN     "companyIcon" TEXT,
ADD COLUMN     "templateID" "TemplateIdentification" NOT NULL DEFAULT 'DEFAULT';

-- AlterTable
ALTER TABLE "CardAchievements" ADD COLUMN     "description" TEXT,
ADD COLUMN     "startYear" TEXT;

-- AlterTable
ALTER TABLE "CardBusinessGoals" DROP COLUMN "about",
DROP COLUMN "subTitle",
ADD COLUMN     "description" TEXT;

-- AlterTable
ALTER TABLE "CardBusinessNeeds" DROP COLUMN "subTitle",
ADD COLUMN     "description" TEXT;

-- AlterTable
ALTER TABLE "CardEducations" ADD COLUMN     "startingYear" TEXT;

-- AlterTable
ALTER TABLE "CardPortfolio" DROP COLUMN "subTitle",
ADD COLUMN     "media" TEXT NOT NULL,
ADD COLUMN     "templateID" "PortfolioTemplateIdentification" NOT NULL DEFAULT 'DEFAULT';

-- AlterTable
ALTER TABLE "CardServices" DROP COLUMN "subTitle";
