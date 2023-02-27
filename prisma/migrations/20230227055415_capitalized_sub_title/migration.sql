/*
  Warnings:

  - You are about to drop the column `subtitle` on the `CardServices` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "CardServices" DROP COLUMN "subtitle",
ADD COLUMN     "subTitle" TEXT;
