import { TwitterApi } from "twitter-api-v2";
import type { Platform } from "@/app/lib/socials/social-poster";

export const twitter: Platform = {
  name: "Twitter/X",
  enabled: false, // X's API moved to paid credits; set true to re-enable
  async login() {
    const client = new TwitterApi({
      appKey: process.env.TWITTER_CONSUMER_KEY ?? "",
      appSecret: process.env.TWITTER_CONSUMER_KEY_SECRET ?? "",
      accessToken: process.env.TWITTER_ACCESS_TOKEN ?? "",
      accessSecret: process.env.TWITTER_ACCESS_TOKEN_SECRET ?? "",
    });
    await client.v2.me();
    return async (text, data) => {
      await client.v2.tweet({
        text: `${text} https://www.youtube.com/watch?v=${data.video_id}`,
      });
    };
  },
};
