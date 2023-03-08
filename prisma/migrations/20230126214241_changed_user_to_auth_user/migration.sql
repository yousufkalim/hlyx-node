/*
  Warnings:

  - You are about to drop the `User` table. If the table is not empty, all the data it contains will be lost.
  - A unique constraint covering the columns `[profileAvatar]` on the table `UserBio` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[id,profileAvatar]` on the table `UserBio` will be added. If there are existing duplicate values, this will fail.

*/
-- DropForeignKey
ALTER TABLE "Card" DROP CONSTRAINT "Card_userId_userAvatar_fkey";

-- DropForeignKey
ALTER TABLE "UserBio" DROP CONSTRAINT "UserBio_id_email_phone_fkey";

-- AlterTable
ALTER TABLE "UserBio" ADD COLUMN     "profileAvatar" TEXT;

-- DropTable
DROP TABLE "User";

-- CreateTable
CREATE TABLE "UserAuth" (
    "id" SERIAL NOT NULL,
    "email" TEXT NOT NULL,
    "phone" TEXT,
    "password" TEXT NOT NULL,
    "isEmailVerified" BOOLEAN NOT NULL DEFAULT false,
    "isPhoneVerified" BOOLEAN NOT NULL DEFAULT false,
    "termsConditions" BOOLEAN NOT NULL DEFAULT false,
    "role" "Role" NOT NULL DEFAULT 'USER',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "UserAuth_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "UserAuth_email_key" ON "UserAuth"("email");

-- CreateIndex
CREATE UNIQUE INDEX "UserAuth_phone_key" ON "UserAuth"("phone");

-- CreateIndex
CREATE UNIQUE INDEX "UserAuth_id_email_phone_key" ON "UserAuth"("id", "email", "phone");

-- CreateIndex
CREATE UNIQUE INDEX "UserBio_profileAvatar_key" ON "UserBio"("profileAvatar");

-- CreateIndex
CREATE UNIQUE INDEX "UserBio_id_profileAvatar_key" ON "UserBio"("id", "profileAvatar");

-- AddForeignKey
ALTER TABLE "UserBio" ADD CONSTRAINT "UserBio_id_email_phone_fkey" FOREIGN KEY ("id", "email", "phone") REFERENCES "UserAuth"("id", "email", "phone") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Card" ADD CONSTRAINT "Card_userId_userAvatar_fkey" FOREIGN KEY ("userId", "userAvatar") REFERENCES "UserBio"("id", "profileAvatar") ON DELETE RESTRICT ON UPDATE CASCADE;
