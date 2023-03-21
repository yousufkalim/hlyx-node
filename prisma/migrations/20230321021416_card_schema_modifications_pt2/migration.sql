/*
  Warnings:

  - You are about to drop the column `qrCode` on the `Card` table. All the data in the column will be lost.
  - Added the required column `positioning` to the `CardServices` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX "Card_qrCode_key";

-- AlterTable
ALTER TABLE "Card" DROP COLUMN "qrCode";

-- AlterTable
ALTER TABLE "CardServices" ADD COLUMN     "positioning" INTEGER NOT NULL;
