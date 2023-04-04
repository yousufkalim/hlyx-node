/*
  Warnings:

  - You are about to drop the column `authId` on the `LinkNotes` table. All the data in the column will be lost.
  - Added the required column `authorId` to the `LinkNotes` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "LinkNotes" DROP COLUMN "authId",
ADD COLUMN     "authorId" TEXT NOT NULL;
