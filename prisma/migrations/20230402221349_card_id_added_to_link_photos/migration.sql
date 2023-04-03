/*
  Warnings:

  - Added the required column `cardId` to the `LinkPhoto` table without a default value. This is not possible if the table is not empty.
  - Added the required column `uploadedBy` to the `LinkPhoto` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "LinkPhoto" ADD COLUMN     "cardId" TEXT NOT NULL,
ADD COLUMN     "uploadedBy" TEXT NOT NULL;

-- AddForeignKey
ALTER TABLE "LinkPhoto" ADD CONSTRAINT "LinkPhoto_cardId_fkey" FOREIGN KEY ("cardId") REFERENCES "Card"("cardId") ON DELETE CASCADE ON UPDATE CASCADE;
