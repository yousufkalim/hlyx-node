/*
  Warnings:

  - The `licenseNumber` column on the `CardEducations` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- AlterTable
ALTER TABLE "CardEducations" DROP COLUMN "licenseNumber",
ADD COLUMN     "licenseNumber" INTEGER;
