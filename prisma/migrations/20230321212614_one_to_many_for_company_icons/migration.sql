-- CreateTable
CREATE TABLE "CardCompanyIcons" (
    "cardId" TEXT NOT NULL,
    "pathToFile" TEXT NOT NULL,

    CONSTRAINT "CardCompanyIcons_pkey" PRIMARY KEY ("cardId","pathToFile")
);

-- AddForeignKey
ALTER TABLE "CardCompanyIcons" ADD CONSTRAINT "CardCompanyIcons_cardId_fkey" FOREIGN KEY ("cardId") REFERENCES "Card"("cardId") ON DELETE CASCADE ON UPDATE CASCADE;
