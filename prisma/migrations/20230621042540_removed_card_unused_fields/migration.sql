/*
  Warnings:

  - You are about to drop the column `country` on the `Card` table. All the data in the column will be lost.
  - You are about to drop the column `streetAddress` on the `Card` table. All the data in the column will be lost.
  - You are about to drop the column `zipcode` on the `Card` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Card" DROP COLUMN "country",
DROP COLUMN "streetAddress",
DROP COLUMN "zipcode";
