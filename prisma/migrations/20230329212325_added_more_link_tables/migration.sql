/*
  Warnings:

  - The primary key for the `Link` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - A unique constraint covering the columns `[cardOne,cardTwo]` on the table `Link` will be added. If there are existing duplicate values, this will fail.
  - The required column `id` was added to the `Link` table with a prisma-level default value. This is not possible if the table is not empty. Please add this column as optional, then populate it before making it required.

*/
-- AlterTable
ALTER TABLE "Link" DROP CONSTRAINT "Link_pkey",
ADD COLUMN     "id" TEXT NOT NULL,
ADD CONSTRAINT "Link_pkey" PRIMARY KEY ("id");

-- CreateTable
CREATE TABLE "LinkNotes" (
    "id" TEXT NOT NULL,
    "linkId" TEXT NOT NULL,
    "authId" TEXT NOT NULL,
    "recipientId" TEXT NOT NULL,
    "note" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "LinkNotes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LinkMessages" (
    "id" TEXT NOT NULL,
    "linkId" TEXT NOT NULL,
    "senderId" TEXT NOT NULL,
    "recipientId" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "LinkMessages_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LinkPhoto" (
    "linkId" TEXT NOT NULL,
    "pathToFile" TEXT NOT NULL,

    CONSTRAINT "LinkPhoto_pkey" PRIMARY KEY ("linkId","pathToFile")
);

-- CreateIndex
CREATE UNIQUE INDEX "Link_cardOne_cardTwo_key" ON "Link"("cardOne", "cardTwo");

-- AddForeignKey
ALTER TABLE "LinkNotes" ADD CONSTRAINT "LinkNotes_linkId_fkey" FOREIGN KEY ("linkId") REFERENCES "Link"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LinkMessages" ADD CONSTRAINT "LinkMessages_linkId_fkey" FOREIGN KEY ("linkId") REFERENCES "Link"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LinkPhoto" ADD CONSTRAINT "LinkPhoto_linkId_fkey" FOREIGN KEY ("linkId") REFERENCES "Link"("id") ON DELETE CASCADE ON UPDATE CASCADE;
