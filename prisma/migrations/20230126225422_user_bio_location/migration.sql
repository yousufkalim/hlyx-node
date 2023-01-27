/*
  Warnings:

  - You are about to drop the column `termsConditions` on the `UserAuth` table. All the data in the column will be lost.
  - You are about to drop the `CardLocations` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "CardLocations" DROP CONSTRAINT "CardLocations_cardId_fkey";

-- AlterTable
ALTER TABLE "Card" ADD COLUMN     "city" TEXT,
ADD COLUMN     "country" TEXT,
ADD COLUMN     "state" TEXT,
ADD COLUMN     "streetAddress" TEXT,
ADD COLUMN     "zipcode" TEXT;

-- AlterTable
ALTER TABLE "UserAuth" DROP COLUMN "termsConditions";

-- DropTable
DROP TABLE "CardLocations";
