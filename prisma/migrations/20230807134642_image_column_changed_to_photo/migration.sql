/*
  Warnings:

  - You are about to drop the column `image` on the `CardServices` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "CardServices" DROP COLUMN "image",
ADD COLUMN     "photo" TEXT NOT NULL DEFAULT '';
