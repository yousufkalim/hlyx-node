-- AlterEnum
ALTER TYPE "LinkType" ADD VALUE 'archived';

-- AlterTable
ALTER TABLE "Card" ALTER COLUMN "publicCard" SET DEFAULT false;
