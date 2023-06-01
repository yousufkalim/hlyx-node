-- CreateEnum
CREATE TYPE "ConnectionViaPersonFilters" AS ENUM ('auto', 'manual');

-- AlterTable
ALTER TABLE "UserPreferences" ADD COLUMN     "personFilter" "ConnectionViaPersonFilters";
