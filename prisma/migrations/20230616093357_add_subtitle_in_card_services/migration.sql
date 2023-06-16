/*
  Warnings:

  - The `url` column on the `CardServices` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- AlterTable
ALTER TABLE "CardServices" ALTER COLUMN "subtitle" DROP NOT NULL,
DROP COLUMN "url",
ADD COLUMN     "url" TEXT[];
