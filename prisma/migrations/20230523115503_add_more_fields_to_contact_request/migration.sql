/*
  Warnings:

  - You are about to drop the column `location` on the `Contact` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Contact" DROP COLUMN "location",
ADD COLUMN     "city" TEXT,
ADD COLUMN     "state" TEXT;
