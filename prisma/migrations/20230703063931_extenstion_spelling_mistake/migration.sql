/*
  Warnings:

  - You are about to drop the column `extension` on the `CardPhones` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "CardPhones" DROP COLUMN "extension",
ADD COLUMN     "extention" TEXT;
