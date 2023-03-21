-- CreateTable
CREATE TABLE "CardPortfolioImages" (
    "cardId" TEXT NOT NULL,
    "pathToFile" TEXT NOT NULL,

    CONSTRAINT "CardPortfolioImages_pkey" PRIMARY KEY ("cardId","pathToFile")
);

-- AddForeignKey
ALTER TABLE "CardPortfolioImages" ADD CONSTRAINT "CardPortfolioImages_cardId_fkey" FOREIGN KEY ("cardId") REFERENCES "Card"("cardId") ON DELETE CASCADE ON UPDATE CASCADE;
