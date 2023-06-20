-- CreateEnum
CREATE TYPE "ProfileType" AS ENUM ('user', 'contact');

-- AlterTable
ALTER TABLE "UserBio" ADD COLUMN     "profileType" "ProfileType" NOT NULL DEFAULT 'user';
