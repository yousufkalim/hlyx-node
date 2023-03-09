/*
  Warnings:

  - You are about to drop the column `templateID` on the `CardPortfolio` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Card" ADD COLUMN     "portfolioTemplate" "PortfolioTemplateIdentification" NOT NULL DEFAULT 'DEFAULT';

-- AlterTable
ALTER TABLE "CardPortfolio" DROP COLUMN "templateID";
