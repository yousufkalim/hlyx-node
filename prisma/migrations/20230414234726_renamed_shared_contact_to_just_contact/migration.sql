/*
  Warnings:

  - You are about to drop the `SharedContact` table. If the table is not empty, all the data it contains will be lost.

*/
-- CreateEnum
CREATE TYPE "ContactStatus" AS ENUM ('requested', 'archived', 'saved');

-- DropForeignKey
ALTER TABLE "SharedContact" DROP CONSTRAINT "SharedContact_cardId_fkey";

-- DropTable
DROP TABLE "SharedContact";

-- DropEnum
DROP TYPE "SharedContactStatus";

-- CreateTable
CREATE TABLE "Contact" (
    "contactId" TEXT NOT NULL,
    "cardId" TEXT NOT NULL,
    "contactImage" TEXT,
    "status" "ContactStatus" NOT NULL DEFAULT 'requested',
    "fullName" TEXT NOT NULL,
    "company" TEXT,
    "jobTitle" TEXT,
    "phone" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "location" TEXT,
    "message" TEXT,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Contact_pkey" PRIMARY KEY ("contactId")
);

-- AddForeignKey
ALTER TABLE "Contact" ADD CONSTRAINT "Contact_cardId_fkey" FOREIGN KEY ("cardId") REFERENCES "Card"("cardId") ON DELETE CASCADE ON UPDATE CASCADE;
