/*
  Warnings:

  - You are about to drop the column `issuedBy` on the `CardAchievements` table. All the data in the column will be lost.
  - You are about to drop the column `media` on the `CardPortfolio` table. All the data in the column will be lost.
  - You are about to drop the column `type` on the `CardPortfolio` table. All the data in the column will be lost.
  - You are about to drop the column `icon` on the `CardServices` table. All the data in the column will be lost.
  - You are about to drop the `CardPhotos` table. If the table is not empty, all the data it contains will be lost.
  - Made the column `startDate` on table `CardBusinessGoals` required. This step will fail if there are existing NULL values in that column.
  - Added the required column `positioning` to the `CardPortfolio` table without a default value. This is not possible if the table is not empty.
  - Made the column `image` on table `CardPortfolio` required. This step will fail if there are existing NULL values in that column.

*/
-- DropForeignKey
ALTER TABLE "CardPhotos" DROP CONSTRAINT "CardPhotos_cardId_fkey";

-- AlterTable
ALTER TABLE "CardAchievements" DROP COLUMN "issuedBy";

-- AlterTable
ALTER TABLE "CardBusinessGoals" ALTER COLUMN "percentComplete" SET DEFAULT 0,
ALTER COLUMN "startDate" SET NOT NULL,
ALTER COLUMN "startDate" SET DEFAULT CURRENT_TIMESTAMP;

-- AlterTable
ALTER TABLE "CardPortfolio" DROP COLUMN "media",
DROP COLUMN "type",
ADD COLUMN     "details" TEXT,
ADD COLUMN     "positioning" INTEGER NOT NULL,
ALTER COLUMN "image" SET NOT NULL,
ALTER COLUMN "title" DROP NOT NULL;

-- AlterTable
ALTER TABLE "CardServices" DROP COLUMN "icon",
ADD COLUMN     "subtitle" TEXT;

-- DropTable
DROP TABLE "CardPhotos";

-- DropEnum
DROP TYPE "PortfolioType";

-- CreateTable
CREATE TABLE "CardCoverPhotos" (
    "cardId" TEXT NOT NULL,
    "pathToFile" TEXT NOT NULL,

    CONSTRAINT "CardCoverPhotos_pkey" PRIMARY KEY ("cardId","pathToFile")
);

-- AddForeignKey
ALTER TABLE "CardCoverPhotos" ADD CONSTRAINT "CardCoverPhotos_cardId_fkey" FOREIGN KEY ("cardId") REFERENCES "Card"("cardId") ON DELETE CASCADE ON UPDATE CASCADE;
