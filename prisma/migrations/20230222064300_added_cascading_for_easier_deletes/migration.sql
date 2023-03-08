-- DropForeignKey
ALTER TABLE "Card" DROP CONSTRAINT "Card_userId_userAvatar_fkey";

-- DropForeignKey
ALTER TABLE "CardAccolades" DROP CONSTRAINT "CardAccolades_cardId_fkey";

-- DropForeignKey
ALTER TABLE "CardAchievements" DROP CONSTRAINT "CardAchievements_cardId_fkey";

-- DropForeignKey
ALTER TABLE "CardAdditionalLinks" DROP CONSTRAINT "CardAdditionalLinks_cardId_fkey";

-- DropForeignKey
ALTER TABLE "CardBusinessGoals" DROP CONSTRAINT "CardBusinessGoals_cardId_fkey";

-- DropForeignKey
ALTER TABLE "CardBusinessNeeds" DROP CONSTRAINT "CardBusinessNeeds_cardId_fkey";

-- DropForeignKey
ALTER TABLE "CardEducations" DROP CONSTRAINT "CardEducations_cardId_fkey";

-- DropForeignKey
ALTER TABLE "CardEmails" DROP CONSTRAINT "CardEmails_cardId_fkey";

-- DropForeignKey
ALTER TABLE "CardPhones" DROP CONSTRAINT "CardPhones_cardId_fkey";

-- DropForeignKey
ALTER TABLE "CardPhotos" DROP CONSTRAINT "CardPhotos_cardId_fkey";

-- DropForeignKey
ALTER TABLE "CardPortfolio" DROP CONSTRAINT "CardPortfolio_cardId_fkey";

-- DropForeignKey
ALTER TABLE "CardServices" DROP CONSTRAINT "CardServices_cardId_fkey";

-- DropForeignKey
ALTER TABLE "CardSocialMedias" DROP CONSTRAINT "CardSocialMedias_cardId_fkey";

-- DropForeignKey
ALTER TABLE "CardWebsites" DROP CONSTRAINT "CardWebsites_cardId_fkey";

-- DropForeignKey
ALTER TABLE "Link" DROP CONSTRAINT "Link_cardOne_fkey";

-- DropForeignKey
ALTER TABLE "Link" DROP CONSTRAINT "Link_cardTwo_fkey";

-- DropForeignKey
ALTER TABLE "UserBio" DROP CONSTRAINT "UserBio_id_email_phone_fkey";

-- DropForeignKey
ALTER TABLE "UserPhoto" DROP CONSTRAINT "UserPhoto_userId_fkey";

-- AddForeignKey
ALTER TABLE "UserBio" ADD CONSTRAINT "UserBio_id_email_phone_fkey" FOREIGN KEY ("id", "email", "phone") REFERENCES "UserAuth"("id", "email", "phone") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserPhoto" ADD CONSTRAINT "UserPhoto_userId_fkey" FOREIGN KEY ("userId") REFERENCES "UserBio"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Card" ADD CONSTRAINT "Card_userId_userAvatar_fkey" FOREIGN KEY ("userId", "userAvatar") REFERENCES "UserBio"("id", "profileAvatar") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CardPhotos" ADD CONSTRAINT "CardPhotos_cardId_fkey" FOREIGN KEY ("cardId") REFERENCES "Card"("urlPath") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CardEmails" ADD CONSTRAINT "CardEmails_cardId_fkey" FOREIGN KEY ("cardId") REFERENCES "Card"("urlPath") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CardPhones" ADD CONSTRAINT "CardPhones_cardId_fkey" FOREIGN KEY ("cardId") REFERENCES "Card"("urlPath") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CardWebsites" ADD CONSTRAINT "CardWebsites_cardId_fkey" FOREIGN KEY ("cardId") REFERENCES "Card"("urlPath") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CardSocialMedias" ADD CONSTRAINT "CardSocialMedias_cardId_fkey" FOREIGN KEY ("cardId") REFERENCES "Card"("urlPath") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CardAdditionalLinks" ADD CONSTRAINT "CardAdditionalLinks_cardId_fkey" FOREIGN KEY ("cardId") REFERENCES "Card"("urlPath") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CardEducations" ADD CONSTRAINT "CardEducations_cardId_fkey" FOREIGN KEY ("cardId") REFERENCES "Card"("urlPath") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CardAccolades" ADD CONSTRAINT "CardAccolades_cardId_fkey" FOREIGN KEY ("cardId") REFERENCES "Card"("urlPath") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CardAchievements" ADD CONSTRAINT "CardAchievements_cardId_fkey" FOREIGN KEY ("cardId") REFERENCES "Card"("urlPath") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CardBusinessGoals" ADD CONSTRAINT "CardBusinessGoals_cardId_fkey" FOREIGN KEY ("cardId") REFERENCES "Card"("urlPath") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CardBusinessNeeds" ADD CONSTRAINT "CardBusinessNeeds_cardId_fkey" FOREIGN KEY ("cardId") REFERENCES "Card"("urlPath") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CardServices" ADD CONSTRAINT "CardServices_cardId_fkey" FOREIGN KEY ("cardId") REFERENCES "Card"("urlPath") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CardPortfolio" ADD CONSTRAINT "CardPortfolio_cardId_fkey" FOREIGN KEY ("cardId") REFERENCES "Card"("urlPath") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Link" ADD CONSTRAINT "Link_cardOne_fkey" FOREIGN KEY ("cardOne") REFERENCES "Card"("urlPath") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Link" ADD CONSTRAINT "Link_cardTwo_fkey" FOREIGN KEY ("cardTwo") REFERENCES "Card"("urlPath") ON DELETE CASCADE ON UPDATE CASCADE;
