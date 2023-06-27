/*
  Warnings:

  - Changed the type of `platform` on the `CardSocialMedias` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- CreateEnum
CREATE TYPE "SocialMediaPlatforms" AS ENUM ('fivehundredpixel', 'applemusic', 'applepodcast', 'badoo', 'baidu', 'behance', 'clubhouse', 'dailymotion', 'devianart', 'discord', 'dribble', 'facebook', 'flickr', 'foursquare', 'giphy', 'github', 'gmail', 'googlemeets', 'googlepodcast', 'imo', 'instagram', 'ivoox', 'kompoz', 'kwai', 'likee', 'line', 'linkedin', 'match', 'medium', 'meetme', 'meetup', 'messenger', 'myspace', 'patreon', 'pinterest', 'qq', 'quora', 'qzone', 'reddit', 'skype', 'slack', 'snapchat', 'soundcloud', 'spotify', 'stackoverflow', 'teams', 'telegram', 'tiktok', 'tinder', 'truthsocial', 'tumbler', 'twitch', 'twitter', 'viber', 'vimeo', 'vkontakte', 'watppad', 'weechat', 'weibo', 'whatsapp', 'xing', 'yelp', 'youtube', 'zoom');

-- AlterTable
ALTER TABLE "CardSocialMedias" DROP COLUMN "platform",
ADD COLUMN     "platform" "SocialMediaPlatforms" NOT NULL;
