-- AlterTable
ALTER TABLE "SharedContact" ADD COLUMN     "location" TEXT,
ALTER COLUMN "message" DROP NOT NULL;
