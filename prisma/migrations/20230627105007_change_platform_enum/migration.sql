/*
  Warnings:

  - The values [stackoverflow] on the enum `SocialMediaPlatforms` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "SocialMediaPlatforms_new" AS ENUM ('fivehundredpixel', 'applemusic', 'applepodcast', 'badoo', 'baidu', 'behance', 'clubhouse', 'dailymotion', 'devianart', 'discord', 'dribble', 'facebook', 'flickr', 'foursquare', 'giphy', 'github', 'gmail', 'googlemeets', 'googlepodcast', 'imo', 'instagram', 'ivoox', 'kompoz', 'kwai', 'likee', 'line', 'linkedin', 'match', 'medium', 'meetme', 'meetup', 'messenger', 'myspace', 'patreon', 'pinterest', 'qq', 'quora', 'qzone', 'reddit', 'skype', 'slack', 'snapchat', 'soundcloud', 'spotify', 'teams', 'telegram', 'tiktok', 'tinder', 'truthsocial', 'tumbler', 'twitch', 'twitter', 'viber', 'vimeo', 'vkontakte', 'watppad', 'weechat', 'weibo', 'whatsapp', 'xing', 'yelp', 'youtube', 'zoom');
ALTER TABLE "CardSocialMedias" ALTER COLUMN "platform" TYPE "SocialMediaPlatforms_new" USING ("platform"::text::"SocialMediaPlatforms_new");
ALTER TYPE "SocialMediaPlatforms" RENAME TO "SocialMediaPlatforms_old";
ALTER TYPE "SocialMediaPlatforms_new" RENAME TO "SocialMediaPlatforms";
DROP TYPE "SocialMediaPlatforms_old";
COMMIT;
