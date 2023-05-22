/*
  Warnings:

  - A unique constraint covering the columns `[userPreferencesId]` on the table `UserAuth` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `userPreferencesId` to the `UserAuth` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "TwoFactorAuthType" AS ENUM ('none', 'email', 'phone');

-- AlterTable
ALTER TABLE "UserAuth" ADD COLUMN     "userPreferencesId" TEXT NOT NULL;

-- CreateTable
CREATE TABLE "UserPreferences" (
    "id" TEXT NOT NULL,
    "twoFactorAuth" "TwoFactorAuthType" NOT NULL DEFAULT 'none',
    "allCardsPrivate" BOOLEAN NOT NULL DEFAULT false,
    "connectionViaProfileLink" BOOLEAN NOT NULL DEFAULT false,
    "connectionViaQRCode" BOOLEAN NOT NULL DEFAULT false,
    "connectionViaPerson" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "UserPreferences_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "UserAuth_userPreferencesId_key" ON "UserAuth"("userPreferencesId");

-- AddForeignKey
ALTER TABLE "UserAuth" ADD CONSTRAINT "UserAuth_userPreferencesId_fkey" FOREIGN KEY ("userPreferencesId") REFERENCES "UserPreferences"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
