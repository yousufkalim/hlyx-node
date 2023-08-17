/*
  Warnings:

  - A unique constraint covering the columns `[cardId,phone]` on the table `Contact` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[cardId,email]` on the table `Contact` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX "Contact_email_key";

-- DropIndex
DROP INDEX "Contact_phone_key";

-- CreateIndex
CREATE UNIQUE INDEX "Contact_cardId_phone_key" ON "Contact"("cardId", "phone");

-- CreateIndex
CREATE UNIQUE INDEX "Contact_cardId_email_key" ON "Contact"("cardId", "email");
