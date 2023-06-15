/*
  Warnings:

  - You are about to drop the column `endDate` on the `CardBusinessNeeds` table. All the data in the column will be lost.
  - You are about to drop the column `startDate` on the `CardBusinessNeeds` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "CardBusinessNeeds" DROP COLUMN "endDate",
DROP COLUMN "startDate",
ADD COLUMN     "date" TEXT;
