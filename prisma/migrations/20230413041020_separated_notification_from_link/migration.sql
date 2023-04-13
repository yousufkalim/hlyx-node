/*
  Warnings:

  - The primary key for the `SharedContact` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `id` on the `SharedContact` table. All the data in the column will be lost.
  - You are about to drop the `LinkNotification` table. If the table is not empty, all the data it contains will be lost.
  - The required column `contactId` was added to the `SharedContact` table with a prisma-level default value. This is not possible if the table is not empty. Please add this column as optional, then populate it before making it required.

*/
-- DropForeignKey
ALTER TABLE "LinkNotification" DROP CONSTRAINT "LinkNotification_linkId_cardOne_cardTwo_fkey";

-- AlterTable
ALTER TABLE "SharedContact" DROP CONSTRAINT "SharedContact_pkey",
DROP COLUMN "id",
ADD COLUMN     "contactId" TEXT NOT NULL,
ADD CONSTRAINT "SharedContact_pkey" PRIMARY KEY ("contactId");

-- DropTable
DROP TABLE "LinkNotification";

-- DropEnum
DROP TYPE "NotificationDirectsTo";

-- CreateTable
CREATE TABLE "Notification" (
    "notificationId" TEXT NOT NULL,
    "cardId" TEXT NOT NULL,
    "status" "NotificationStatus" NOT NULL DEFAULT 'active',
    "messgae" TEXT NOT NULL,
    "directsTo" TEXT NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Notification_pkey" PRIMARY KEY ("notificationId")
);

-- AddForeignKey
ALTER TABLE "Notification" ADD CONSTRAINT "Notification_cardId_fkey" FOREIGN KEY ("cardId") REFERENCES "Card"("cardId") ON DELETE CASCADE ON UPDATE CASCADE;
