/*
  Warnings:

  - You are about to drop the column `templateID` on the `Card` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Card" DROP COLUMN "templateID",
ADD COLUMN     "templateId" "TemplateIdentification" NOT NULL DEFAULT 'DEFAULT';
