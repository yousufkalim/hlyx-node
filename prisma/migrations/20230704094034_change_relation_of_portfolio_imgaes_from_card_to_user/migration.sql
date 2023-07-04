/*
  Warnings:

  - The primary key for the `CardPortfolioImages` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `cardId` on the `CardPortfolioImages` table. All the data in the column will be lost.
  - Added the required column `userId` to the `CardPortfolioImages` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "CardPortfolioImages" DROP CONSTRAINT "CardPortfolioImages_cardId_fkey";

-- AlterTable
ALTER TABLE "CardPortfolioImages" DROP CONSTRAINT "CardPortfolioImages_pkey",
DROP COLUMN "cardId",
ADD COLUMN     "userId" TEXT NOT NULL,
ADD CONSTRAINT "CardPortfolioImages_pkey" PRIMARY KEY ("userId", "pathToFile");

-- AddForeignKey
ALTER TABLE "CardPortfolioImages" ADD CONSTRAINT "CardPortfolioImages_userId_fkey" FOREIGN KEY ("userId") REFERENCES "UserBio"("id") ON DELETE CASCADE ON UPDATE CASCADE;
