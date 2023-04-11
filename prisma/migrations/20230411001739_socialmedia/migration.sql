/*
  Warnings:

  - The values [linkedin] on the enum `SocialMediaPlatforms` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "SocialMediaPlatforms_new" AS ENUM ('linkedIn', 'youtube', 'slack', 'reddit', 'discord', 'facebook', 'twitter', 'instagram', 'medium');
ALTER TABLE "CardSocialMedias" ALTER COLUMN "platform" TYPE "SocialMediaPlatforms_new" USING ("platform"::text::"SocialMediaPlatforms_new");
ALTER TYPE "SocialMediaPlatforms" RENAME TO "SocialMediaPlatforms_old";
ALTER TYPE "SocialMediaPlatforms_new" RENAME TO "SocialMediaPlatforms";
DROP TYPE "SocialMediaPlatforms_old";
COMMIT;
