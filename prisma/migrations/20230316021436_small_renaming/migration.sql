/*
  Warnings:

  - You are about to drop the column `icon` on the `CardAdditionalLinks` table. All the data in the column will be lost.
  - You are about to drop the column `website` on the `CardAdditionalLinks` table. All the data in the column will be lost.
  - You are about to drop the column `startingYear` on the `CardEducations` table. All the data in the column will be lost.
  - You are about to drop the column `website` on the `CardWebsites` table. All the data in the column will be lost.
  - Added the required column `url` to the `CardAdditionalLinks` table without a default value. This is not possible if the table is not empty.
  - Added the required column `url` to the `CardWebsites` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "CardAdditionalLinks" DROP COLUMN "icon",
DROP COLUMN "website",
ADD COLUMN     "url" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "CardEducations" DROP COLUMN "startingYear",
ADD COLUMN     "startYear" TEXT;

-- AlterTable
ALTER TABLE "CardWebsites" DROP COLUMN "website",
ADD COLUMN     "url" TEXT NOT NULL;
