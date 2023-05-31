/*
  Warnings:

  - A unique constraint covering the columns `[qrCodeImage]` on the table `Card` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "Card" ADD COLUMN     "qrCodeImage" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "Card_qrCodeImage_key" ON "Card"("qrCodeImage");
