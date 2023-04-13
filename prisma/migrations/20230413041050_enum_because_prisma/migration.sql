/*
  Warnings:

  - Changed the type of `directsTo` on the `Notification` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- CreateEnum
CREATE TYPE "NotificationDirectsTo" AS ENUM ('linkRequest', 'message', 'contactRequest', 'sharedContact');

-- AlterTable
ALTER TABLE "Notification" DROP COLUMN "directsTo",
ADD COLUMN     "directsTo" "NotificationDirectsTo" NOT NULL;
