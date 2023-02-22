/*
  Warnings:

  - Made the column `profileAvatar` on table `UserBio` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "UserBio" ALTER COLUMN "profileAvatar" SET NOT NULL,
ALTER COLUMN "profileAvatar" SET DEFAULT 'routeToOurDefaultAvatar';
