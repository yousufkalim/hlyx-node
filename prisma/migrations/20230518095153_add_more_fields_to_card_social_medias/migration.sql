/*
  Warnings:

  - Added the required column `profileUrl` to the `CardSocialMedias` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "CardSocialMedias" ADD COLUMN     "label" TEXT,
ADD COLUMN     "profileUrl" TEXT NOT NULL,
ALTER COLUMN "handle" DROP NOT NULL;
