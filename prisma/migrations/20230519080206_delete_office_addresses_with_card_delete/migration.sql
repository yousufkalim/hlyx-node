-- DropForeignKey
ALTER TABLE "CardOfficeAddresses" DROP CONSTRAINT "CardOfficeAddresses_cardId_fkey";

-- AddForeignKey
ALTER TABLE "CardOfficeAddresses" ADD CONSTRAINT "CardOfficeAddresses_cardId_fkey" FOREIGN KEY ("cardId") REFERENCES "Card"("cardId") ON DELETE CASCADE ON UPDATE CASCADE;
