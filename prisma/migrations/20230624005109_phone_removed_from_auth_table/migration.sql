/*
  Warnings:

  - You are about to drop the column `phone` on the `UserAuth` table. All the data in the column will be lost.

*/
-- DropIndex
DROP INDEX "UserAuth_phone_key";

-- AlterTable
ALTER TABLE "UserAuth" DROP COLUMN "phone";
