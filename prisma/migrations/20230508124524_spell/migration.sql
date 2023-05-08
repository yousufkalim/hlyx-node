/*
  Warnings:

  - You are about to drop the column `zipCode` on the `CardOfficeAddresses` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "CardOfficeAddresses" DROP COLUMN "zipCode",
ADD COLUMN     "zipcode" TEXT;
