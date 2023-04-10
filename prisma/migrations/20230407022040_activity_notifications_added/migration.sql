-- CreateEnum
CREATE TYPE "NotificationDirectsTo" AS ENUM ('linkRequest', 'message', 'contact');

-- CreateTable
CREATE TABLE "LinkNotification" (
    "notificationId" TEXT NOT NULL,
    "linkId" TEXT NOT NULL,
    "cardId" TEXT NOT NULL,
    "status" "NotificationStatus" NOT NULL DEFAULT 'active',
    "message" TEXT NOT NULL,
    "directsTo" "NotificationDirectsTo" NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "LinkNotification_pkey" PRIMARY KEY ("notificationId")
);

-- AddForeignKey
ALTER TABLE "LinkNotification" ADD CONSTRAINT "LinkNotification_linkId_fkey" FOREIGN KEY ("linkId") REFERENCES "Link"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LinkNotification" ADD CONSTRAINT "LinkNotification_cardId_fkey" FOREIGN KEY ("cardId") REFERENCES "Card"("cardId") ON DELETE CASCADE ON UPDATE CASCADE;
