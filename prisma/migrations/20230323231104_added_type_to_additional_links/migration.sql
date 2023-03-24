/*
  Warnings:

  - Added the required column `typeContent` to the `CardAdditionalLinks` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "AdditionalLinksType" AS ENUM ('article', 'audio', 'video', 'website');

-- AlterTable
ALTER TABLE "CardAdditionalLinks" ADD COLUMN     "typeContent" "AdditionalLinksType" NOT NULL;
