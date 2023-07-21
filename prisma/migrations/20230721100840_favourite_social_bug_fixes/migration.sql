-- DropForeignKey
ALTER TABLE "FavouriteSocialMedias" DROP CONSTRAINT "FavouriteSocialMedias_userId_fkey";

-- AddForeignKey
ALTER TABLE "FavouriteSocialMedias" ADD CONSTRAINT "FavouriteSocialMedias_userId_fkey" FOREIGN KEY ("userId") REFERENCES "UserBio"("id") ON DELETE CASCADE ON UPDATE CASCADE;
