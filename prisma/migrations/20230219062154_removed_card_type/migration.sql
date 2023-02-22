/*
  Warnings:

  - You are about to drop the column `cardType` on the `Card` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Card" DROP COLUMN "cardType";

-- DropEnum
DROP TYPE "CardType";
