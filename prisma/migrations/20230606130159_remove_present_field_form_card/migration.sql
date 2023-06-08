/*
  Warnings:

  - You are about to drop the column `present` on the `CardAccolades` table. All the data in the column will be lost.
  - You are about to drop the column `present` on the `CardAchievements` table. All the data in the column will be lost.
  - You are about to drop the column `present` on the `CardBusinessGoals` table. All the data in the column will be lost.
  - You are about to drop the column `present` on the `CardEducations` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "CardAccolades" DROP COLUMN "present";

-- AlterTable
ALTER TABLE "CardAchievements" DROP COLUMN "present";

-- AlterTable
ALTER TABLE "CardBusinessGoals" DROP COLUMN "present";

-- AlterTable
ALTER TABLE "CardEducations" DROP COLUMN "present";
