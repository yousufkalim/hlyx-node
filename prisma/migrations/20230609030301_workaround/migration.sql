/*
  Warnings:

  - The `degreeType` column on the `CardEducations` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- CreateEnum
CREATE TYPE "DegreeType1" AS ENUM ('Associates', 'Bachelors', 'Masters', 'Doctorate', 'License', 'Certificate', 'Permit', 'Registration');

-- AlterTable
ALTER TABLE "CardEducations" DROP COLUMN "degreeType",
ADD COLUMN     "degreeType" "DegreeType1";

-- DropEnum
DROP TYPE "DegreeType";
