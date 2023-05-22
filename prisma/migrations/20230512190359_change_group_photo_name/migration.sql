/*
  Warnings:

  - You are about to drop the column `group_photo` on the `Group` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Group" DROP COLUMN "group_photo",
ADD COLUMN     "groupPhoto" TEXT;
