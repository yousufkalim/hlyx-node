/*
  Warnings:

  - The values [active] on the enum `SharedContactStatus` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "SharedContactStatus_new" AS ENUM ('requested', 'archived', 'saved');
ALTER TABLE "SharedContact" ALTER COLUMN "status" DROP DEFAULT;
ALTER TABLE "SharedContact" ALTER COLUMN "status" TYPE "SharedContactStatus_new" USING ("status"::text::"SharedContactStatus_new");
ALTER TYPE "SharedContactStatus" RENAME TO "SharedContactStatus_old";
ALTER TYPE "SharedContactStatus_new" RENAME TO "SharedContactStatus";
DROP TYPE "SharedContactStatus_old";
ALTER TABLE "SharedContact" ALTER COLUMN "status" SET DEFAULT 'requested';
COMMIT;

-- AlterTable
ALTER TABLE "SharedContact" ALTER COLUMN "status" SET DEFAULT 'requested';
