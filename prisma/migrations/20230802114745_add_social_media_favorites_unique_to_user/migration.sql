/*
  Warnings:

  - A unique constraint covering the columns `[name,userId]` on the table `FavoriteSocialMedias` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX "FavoriteSocialMedias_name_key";

-- CreateIndex
CREATE UNIQUE INDEX "FavoriteSocialMedias_name_userId_key" ON "FavoriteSocialMedias"("name", "userId");
