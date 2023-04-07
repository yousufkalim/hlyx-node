/*
  Warnings:

  - You are about to drop the column `message` on the `LinkNotification` table. All the data in the column will be lost.
  - Added the required column `details` to the `LinkNotification` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "LinkNotification" DROP COLUMN "message",
ADD COLUMN     "details" TEXT NOT NULL;
