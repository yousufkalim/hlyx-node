/*
  Warnings:

  - A unique constraint covering the columns `[id,email]` on the table `UserAuth` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[id,email]` on the table `UserBio` will be added. If there are existing duplicate values, this will fail.

*/
-- DropForeignKey
ALTER TABLE "UserBio" DROP CONSTRAINT "UserBio_id_email_phone_fkey";

-- DropIndex
DROP INDEX "UserAuth_id_email_phone_key";

-- DropIndex
DROP INDEX "UserBio_id_email_phone_key";

-- CreateIndex
CREATE UNIQUE INDEX "UserAuth_id_email_key" ON "UserAuth"("id", "email");

-- CreateIndex
CREATE UNIQUE INDEX "UserBio_id_email_key" ON "UserBio"("id", "email");

-- AddForeignKey
ALTER TABLE "UserBio" ADD CONSTRAINT "UserBio_id_email_fkey" FOREIGN KEY ("id", "email") REFERENCES "UserAuth"("id", "email") ON DELETE CASCADE ON UPDATE CASCADE;
