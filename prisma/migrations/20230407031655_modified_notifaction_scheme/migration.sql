/*
  Warnings:

  - You are about to drop the column `cardId` on the `LinkNotification` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[id,cardOne,cardTwo]` on the table `Link` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `cardOne` to the `LinkNotification` table without a default value. This is not possible if the table is not empty.
  - Added the required column `cardTwo` to the `LinkNotification` table without a default value. This is not possible if the table is not empty.
  - Added the required column `ownerId` to the `LinkNotification` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "LinkNotification" DROP CONSTRAINT "LinkNotification_cardId_fkey";

-- DropForeignKey
ALTER TABLE "LinkNotification" DROP CONSTRAINT "LinkNotification_linkId_fkey";

-- AlterTable
ALTER TABLE "LinkNotification" DROP COLUMN "cardId",
ADD COLUMN     "cardOne" TEXT NOT NULL,
ADD COLUMN     "cardTwo" TEXT NOT NULL,
ADD COLUMN     "ownerId" TEXT NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "Link_id_cardOne_cardTwo_key" ON "Link"("id", "cardOne", "cardTwo");

-- AddForeignKey
ALTER TABLE "LinkNotification" ADD CONSTRAINT "LinkNotification_linkId_cardOne_cardTwo_fkey" FOREIGN KEY ("linkId", "cardOne", "cardTwo") REFERENCES "Link"("id", "cardOne", "cardTwo") ON DELETE CASCADE ON UPDATE CASCADE;
