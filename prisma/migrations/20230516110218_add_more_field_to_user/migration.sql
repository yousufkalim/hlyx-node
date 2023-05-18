-- AlterTable
ALTER TABLE "UserPreferences" ADD COLUMN     "connectionViaContacts" BOOLEAN NOT NULL DEFAULT false;

-- CreateTable
CREATE TABLE "UserNotification" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "newLinkRequest" BOOLEAN NOT NULL DEFAULT false,
    "newMessage" BOOLEAN NOT NULL DEFAULT false,
    "groupMessages" BOOLEAN NOT NULL DEFAULT false,
    "profileShare" BOOLEAN NOT NULL DEFAULT false,
    "acceptedLinkRequest" BOOLEAN NOT NULL DEFAULT false,
    "accountSecurity" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "UserNotification_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "UserNotification_userId_key" ON "UserNotification"("userId");

-- AddForeignKey
ALTER TABLE "UserNotification" ADD CONSTRAINT "UserNotification_userId_fkey" FOREIGN KEY ("userId") REFERENCES "UserAuth"("id") ON DELETE CASCADE ON UPDATE CASCADE;
