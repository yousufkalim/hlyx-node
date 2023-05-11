/*
  Warnings:

  - You are about to drop the column `userPreferencesId` on the `UserAuth` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[userId]` on the table `UserPreferences` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `userId` to the `UserPreferences` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "UserAuth" DROP CONSTRAINT "UserAuth_userPreferencesId_fkey";

-- DropIndex
DROP INDEX "UserAuth_userPreferencesId_key";

-- AlterTable
ALTER TABLE "UserAuth" DROP COLUMN "userPreferencesId";

-- AlterTable
ALTER TABLE "UserPreferences" ADD COLUMN     "userId" TEXT NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "UserPreferences_userId_key" ON "UserPreferences"("userId");

-- AddForeignKey
ALTER TABLE "UserPreferences" ADD CONSTRAINT "UserPreferences_userId_fkey" FOREIGN KEY ("userId") REFERENCES "UserAuth"("id") ON DELETE CASCADE ON UPDATE CASCADE;
