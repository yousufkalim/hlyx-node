-- AlterTable
ALTER TABLE "Notification" ADD COLUMN     "read" BOOLEAN DEFAULT false,
ADD COLUMN     "resolved" BOOLEAN DEFAULT false;
