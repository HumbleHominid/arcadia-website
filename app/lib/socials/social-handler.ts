import AtpAgent from "@atproto/api";
import { TwitterApi } from "twitter-api-v2";

export class SocialHandler {
  private twitter?: Promise<TwitterApi | undefined>;
  private bsky?: Promise<AtpAgent | undefined>;

  // Memoize the promise so concurrent callers share one login
  get_twitter() {
    return (this.twitter ??= loginTwitter());
  }

  get_bsky() {
    return (this.bsky ??= loginBsky());
  }
}

async function loginTwitter(): Promise<TwitterApi | undefined> {
  const client = new TwitterApi({
    appKey: process.env.TWITTER_CONSUMER_KEY ?? "",
    appSecret: process.env.TWITTER_CONSUMER_KEY_SECRET ?? "",
    accessToken: process.env.TWITTER_ACCESS_TOKEN ?? "",
    accessSecret: process.env.TWITTER_ACCESS_TOKEN_SECRET ?? "",
  });

  try {
    await client.v2.me();
    console.log("Twitter successfully authenticated");
    return client;
  } catch (e) {
    console.log(`Twitter failed to authenticate with err: ${e}`);
  }
}

async function loginBsky(): Promise<AtpAgent | undefined> {
  const agent = new AtpAgent({ service: "https://bsky.social" });

  try {
    await agent.login({
      identifier: process.env.BSKY_IDENTIFIER ?? "",
      password: process.env.BSKY_PASSWORD ?? "",
    });
    console.log("BlueSky successfully authenticated");
    return agent;
  } catch (e) {
    console.log(`Bluesky failed to authenticate with err: ${e}`);
  }
}
