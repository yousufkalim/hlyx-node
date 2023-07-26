/*
  Warnings:

  - You are about to drop the `FavouriteSocialMedias` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "FavouriteSocialMedias" DROP CONSTRAINT "FavouriteSocialMedias_userId_fkey";

-- DropTable
DROP TABLE "FavouriteSocialMedias";

-- CreateTable
CREATE TABLE "FavoriteSocialMedias" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "userId" TEXT NOT NULL,

    CONSTRAINT "FavoriteSocialMedias_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "FavoriteSocialMedias_name_key" ON "FavoriteSocialMedias"("name");

-- AddForeignKey
ALTER TABLE "FavoriteSocialMedias" ADD CONSTRAINT "FavoriteSocialMedias_userId_fkey" FOREIGN KEY ("userId") REFERENCES "UserBio"("id") ON DELETE CASCADE ON UPDATE CASCADE;
