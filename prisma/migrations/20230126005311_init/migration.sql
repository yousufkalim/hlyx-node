-- CreateEnum
CREATE TYPE "Role" AS ENUM ('USER', 'ADMIN');

-- CreateEnum
CREATE TYPE "CardType" AS ENUM ('personal', 'professional');

-- CreateEnum
CREATE TYPE "EmailType" AS ENUM ('work', 'personal');

-- CreateEnum
CREATE TYPE "PhoneType" AS ENUM ('home', 'work', 'mobile', 'main', 'fax', 'direct', 'office');

-- CreateEnum
CREATE TYPE "SocialMediaPlatforms" AS ENUM ('linkedin', 'youtube', 'slack', 'reddit', 'discord', 'facebook', 'twitter', 'instagram');

-- CreateEnum
CREATE TYPE "DegreeType" AS ENUM ('Associates', 'Bachelors', 'Masters', 'Doctorate');

-- CreateEnum
CREATE TYPE "LinkType" AS ENUM ('requested', 'accepted', 'declined', 'blocked');

-- CreateTable
CREATE TABLE "User" (
    "id" SERIAL NOT NULL,
    "email" TEXT NOT NULL,
    "phone" TEXT,
    "password" TEXT NOT NULL,
    "profileAvatar" TEXT,
    "isEmailVerified" BOOLEAN NOT NULL DEFAULT false,
    "isPhoneVerified" BOOLEAN NOT NULL DEFAULT false,
    "termsConditions" BOOLEAN NOT NULL DEFAULT false,
    "role" "Role" NOT NULL DEFAULT 'USER',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UserBio" (
    "id" INTEGER NOT NULL,
    "firstName" TEXT NOT NULL,
    "middleInitial" TEXT,
    "lastName" TEXT NOT NULL,
    "company" TEXT NOT NULL,
    "profTitle" TEXT NOT NULL,
    "industry" TEXT NOT NULL,
    "country" TEXT NOT NULL,
    "city" TEXT NOT NULL,
    "state" TEXT NOT NULL,
    "zipcode" TEXT NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "UserBio_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UserPhoto" (
    "userId" INTEGER NOT NULL,
    "pathToFile" TEXT NOT NULL,

    CONSTRAINT "UserPhoto_pkey" PRIMARY KEY ("userId","pathToFile")
);

-- CreateTable
CREATE TABLE "Card" (
    "urlPath" TEXT NOT NULL,
    "cardType" "CardType" NOT NULL,
    "userId" INTEGER NOT NULL,
    "userAvatar" TEXT NOT NULL,
    "coverPhoto" TEXT NOT NULL,
    "fullName" TEXT NOT NULL,
    "calendar" TEXT,
    "about" TEXT,
    "company" TEXT,
    "profTitle" TEXT,
    "occupation" TEXT,
    "industry" TEXT,
    "educationLevel" TEXT,
    "schoolName" TEXT,
    "academicFocus" TEXT,
    "degreeType" "DegreeType" NOT NULL,
    "accolades" TEXT[],
    "businessGoals" TEXT[],
    "needsAsks" TEXT[],
    "hobbies" TEXT[],
    "interests" TEXT[],
    "skills" TEXT[],
    "motto" TEXT NOT NULL,
    "qrCode" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Card_pkey" PRIMARY KEY ("urlPath")
);

-- CreateTable
CREATE TABLE "CardPhotos" (
    "cardId" TEXT NOT NULL,
    "pathToFile" TEXT NOT NULL,

    CONSTRAINT "CardPhotos_pkey" PRIMARY KEY ("cardId","pathToFile")
);

-- CreateTable
CREATE TABLE "CardEmails" (
    "id" SERIAL NOT NULL,
    "email" TEXT NOT NULL,
    "type" "EmailType",
    "cardId" TEXT NOT NULL,

    CONSTRAINT "CardEmails_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CardPhones" (
    "id" SERIAL NOT NULL,
    "phone" TEXT NOT NULL,
    "extention" TEXT,
    "type" "PhoneType" NOT NULL,
    "cardId" TEXT NOT NULL,

    CONSTRAINT "CardPhones_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CardWebsites" (
    "id" SERIAL NOT NULL,
    "website" TEXT NOT NULL,
    "description" TEXT,
    "cardId" TEXT NOT NULL,

    CONSTRAINT "CardWebsites_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CardLocations" (
    "id" SERIAL NOT NULL,
    "country" TEXT NOT NULL,
    "city" TEXT NOT NULL,
    "state" TEXT NOT NULL,
    "cardId" TEXT NOT NULL,

    CONSTRAINT "CardLocations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CardSocialMedias" (
    "id" SERIAL NOT NULL,
    "platform" "SocialMediaPlatforms" NOT NULL,
    "handle" TEXT NOT NULL,
    "cardId" TEXT NOT NULL,

    CONSTRAINT "CardSocialMedias_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CardAdditionalLinks" (
    "id" SERIAL NOT NULL,
    "website" TEXT NOT NULL,
    "icon" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "cardId" TEXT NOT NULL,

    CONSTRAINT "CardAdditionalLinks_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CardAchievements" (
    "id" SERIAL NOT NULL,
    "title" TEXT NOT NULL,
    "issuedBy" TEXT NOT NULL,
    "issuedYear" TEXT NOT NULL,
    "cardId" TEXT NOT NULL,

    CONSTRAINT "CardAchievements_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CardServices" (
    "id" SERIAL NOT NULL,
    "title" TEXT NOT NULL,
    "icon" TEXT NOT NULL,
    "details" TEXT NOT NULL,
    "cardId" TEXT NOT NULL,

    CONSTRAINT "CardServices_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CardPortfolio" (
    "id" SERIAL NOT NULL,
    "cardId" TEXT NOT NULL,

    CONSTRAINT "CardPortfolio_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Link" (
    "cardOne" TEXT NOT NULL,
    "cardTwo" TEXT NOT NULL,
    "status" "LinkType" NOT NULL,
    "recentChangeBy" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Link_pkey" PRIMARY KEY ("cardOne","cardTwo")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "User_phone_key" ON "User"("phone");

-- CreateIndex
CREATE UNIQUE INDEX "User_profileAvatar_key" ON "User"("profileAvatar");

-- CreateIndex
CREATE UNIQUE INDEX "User_id_profileAvatar_key" ON "User"("id", "profileAvatar");

-- CreateIndex
CREATE UNIQUE INDEX "Card_qrCode_key" ON "Card"("qrCode");

-- CreateIndex
CREATE UNIQUE INDEX "CardPortfolio_cardId_key" ON "CardPortfolio"("cardId");

-- AddForeignKey
ALTER TABLE "UserBio" ADD CONSTRAINT "UserBio_id_fkey" FOREIGN KEY ("id") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserPhoto" ADD CONSTRAINT "UserPhoto_userId_fkey" FOREIGN KEY ("userId") REFERENCES "UserBio"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Card" ADD CONSTRAINT "Card_userId_userAvatar_fkey" FOREIGN KEY ("userId", "userAvatar") REFERENCES "User"("id", "profileAvatar") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CardPhotos" ADD CONSTRAINT "CardPhotos_cardId_fkey" FOREIGN KEY ("cardId") REFERENCES "Card"("urlPath") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CardEmails" ADD CONSTRAINT "CardEmails_cardId_fkey" FOREIGN KEY ("cardId") REFERENCES "Card"("urlPath") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CardPhones" ADD CONSTRAINT "CardPhones_cardId_fkey" FOREIGN KEY ("cardId") REFERENCES "Card"("urlPath") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CardWebsites" ADD CONSTRAINT "CardWebsites_cardId_fkey" FOREIGN KEY ("cardId") REFERENCES "Card"("urlPath") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CardLocations" ADD CONSTRAINT "CardLocations_cardId_fkey" FOREIGN KEY ("cardId") REFERENCES "Card"("urlPath") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CardSocialMedias" ADD CONSTRAINT "CardSocialMedias_cardId_fkey" FOREIGN KEY ("cardId") REFERENCES "Card"("urlPath") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CardAdditionalLinks" ADD CONSTRAINT "CardAdditionalLinks_cardId_fkey" FOREIGN KEY ("cardId") REFERENCES "Card"("urlPath") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CardAchievements" ADD CONSTRAINT "CardAchievements_cardId_fkey" FOREIGN KEY ("cardId") REFERENCES "Card"("urlPath") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CardServices" ADD CONSTRAINT "CardServices_cardId_fkey" FOREIGN KEY ("cardId") REFERENCES "Card"("urlPath") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CardPortfolio" ADD CONSTRAINT "CardPortfolio_cardId_fkey" FOREIGN KEY ("cardId") REFERENCES "Card"("urlPath") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Link" ADD CONSTRAINT "Link_cardOne_fkey" FOREIGN KEY ("cardOne") REFERENCES "Card"("urlPath") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Link" ADD CONSTRAINT "Link_cardTwo_fkey" FOREIGN KEY ("cardTwo") REFERENCES "Card"("urlPath") ON DELETE RESTRICT ON UPDATE CASCADE;
