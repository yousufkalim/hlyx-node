/*
  Warnings:

  - You are about to drop the column `role` on the `UserBio` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "UserBio" DROP COLUMN "role",
ADD COLUMN     "profRole" TEXT;
