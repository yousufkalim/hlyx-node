/*
  Warnings:

  - You are about to drop the `UserNotification` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "UserNotification" DROP CONSTRAINT "UserNotification_userId_fkey";

-- DropTable
DROP TABLE "UserNotification";
