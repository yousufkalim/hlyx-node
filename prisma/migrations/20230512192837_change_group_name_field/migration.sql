/*
  Warnings:

  - You are about to drop the column `name` on the `Group` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[groupName]` on the table `Group` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `groupName` to the `Group` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX "Group_name_key";

-- AlterTable
ALTER TABLE "Group" DROP COLUMN "name",
ADD COLUMN     "groupName" TEXT NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "Group_groupName_key" ON "Group"("groupName");
