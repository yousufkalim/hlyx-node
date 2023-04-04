-- CreateEnum
CREATE TYPE "NotificationStatus" AS ENUM ('active', 'archived');

-- AlterTable
ALTER TABLE "Link" ADD COLUMN     "cardOneFavorite" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "cardTwoFavorite" BOOLEAN NOT NULL DEFAULT false;
