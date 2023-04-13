-- CreateTable
CREATE TABLE "SharedContact" (
    "id" TEXT NOT NULL,
    "cardId" TEXT NOT NULL,
    "fullName" TEXT NOT NULL,
    "company" TEXT NOT NULL,
    "jobTitle" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "notes" TEXT,

    CONSTRAINT "SharedContact_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "SharedContact" ADD CONSTRAINT "SharedContact_cardId_fkey" FOREIGN KEY ("cardId") REFERENCES "Card"("cardId") ON DELETE CASCADE ON UPDATE CASCADE;
