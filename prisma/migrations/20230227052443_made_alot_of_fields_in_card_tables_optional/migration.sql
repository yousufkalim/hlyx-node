-- AlterTable
ALTER TABLE "CardAccolades" ALTER COLUMN "fromWho" DROP NOT NULL,
ALTER COLUMN "startDate" DROP NOT NULL,
ALTER COLUMN "endDate" DROP NOT NULL;

-- AlterTable
ALTER TABLE "CardAchievements" ALTER COLUMN "issuedBy" DROP NOT NULL,
ALTER COLUMN "issuedYear" DROP NOT NULL;

-- AlterTable
ALTER TABLE "CardAdditionalLinks" ALTER COLUMN "icon" DROP NOT NULL,
ALTER COLUMN "description" DROP NOT NULL;

-- AlterTable
ALTER TABLE "CardBusinessGoals" ALTER COLUMN "subTitle" DROP NOT NULL,
ALTER COLUMN "startDate" DROP NOT NULL,
ALTER COLUMN "endDate" DROP NOT NULL,
ALTER COLUMN "about" DROP NOT NULL;

-- AlterTable
ALTER TABLE "CardBusinessNeeds" ALTER COLUMN "date" DROP NOT NULL,
ALTER COLUMN "subTitle" DROP NOT NULL;

-- AlterTable
ALTER TABLE "CardEducations" ALTER COLUMN "academicLevel" DROP NOT NULL,
ALTER COLUMN "graduationYear" DROP NOT NULL,
ALTER COLUMN "academicFocus" DROP NOT NULL;

-- AlterTable
ALTER TABLE "CardPortfolio" ALTER COLUMN "image" DROP NOT NULL,
ALTER COLUMN "subTitle" DROP NOT NULL;

-- AlterTable
ALTER TABLE "CardServices" ALTER COLUMN "icon" DROP NOT NULL,
ALTER COLUMN "details" DROP NOT NULL,
ALTER COLUMN "subtitle" DROP NOT NULL;
