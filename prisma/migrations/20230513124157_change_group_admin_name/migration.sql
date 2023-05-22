/*
  Warnings:

  - You are about to drop the column `userBioId` on the `Group` table. All the data in the column will be lost.
  - Added the required column `adminUser` to the `Group` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "Group" DROP CONSTRAINT "Group_userBioId_fkey";

-- AlterTable
ALTER TABLE "Group" DROP COLUMN "userBioId",
ADD COLUMN     "adminUser" TEXT NOT NULL;

-- AddForeignKey
ALTER TABLE "Group" ADD CONSTRAINT "Group_adminUser_fkey" FOREIGN KEY ("adminUser") REFERENCES "UserBio"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
