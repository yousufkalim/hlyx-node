-- AlterTable
ALTER TABLE "UserBio" ADD COLUMN     "blockedUserId" TEXT;

-- AddForeignKey
ALTER TABLE "UserBio" ADD CONSTRAINT "UserBio_blockedUserId_fkey" FOREIGN KEY ("blockedUserId") REFERENCES "UserBio"("id") ON DELETE SET NULL ON UPDATE CASCADE;
