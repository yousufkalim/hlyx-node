/*
  Warnings:

  - You are about to drop the column `extention` on the `CardPhones` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "CardPhones" DROP COLUMN "extention",
ADD COLUMN     "extension" TEXT;
