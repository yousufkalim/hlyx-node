/*
  Warnings:

  - Added the required column `status` to the `SharedContact` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "SharedContactStatus" AS ENUM ('active', 'archived');

-- AlterTable
ALTER TABLE "SharedContact" ADD COLUMN     "status" "SharedContactStatus" NOT NULL;
