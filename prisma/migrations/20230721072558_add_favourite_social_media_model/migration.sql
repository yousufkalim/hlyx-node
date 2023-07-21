-- CreateTable
CREATE TABLE "FavouriteSocialMedias" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "userId" TEXT NOT NULL,

    CONSTRAINT "FavouriteSocialMedias_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "FavouriteSocialMedias_name_key" ON "FavouriteSocialMedias"("name");

-- AddForeignKey
ALTER TABLE "FavouriteSocialMedias" ADD CONSTRAINT "FavouriteSocialMedias_userId_fkey" FOREIGN KEY ("userId") REFERENCES "UserBio"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
