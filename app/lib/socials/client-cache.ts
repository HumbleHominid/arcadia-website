import { AtpBaseClient } from "@atproto/api";
import { TwitterApi } from "twitter-api-v2";

class ClientCache {
	twitter_client: TwitterApi | undefined = undefined;
	bsky_client : AtpBaseClient | undefined = undefined;

	async get_twitter(): Promise<TwitterApi | undefined> {
		if (this.twitter_client) return this.twitter_client;

		const undefinedToEmpty = (str:string|undefined) => str === undefined ? '' : str;
		const client: TwitterApi = new TwitterApi({
			appKey: undefinedToEmpty(process.env.TWITTER_CONSUMER_KEY),
			appSecret: undefinedToEmpty(process.env.TWITTER_CONSUMER_KEY_SECRET),
			accessToken: undefinedToEmpty(process.env.TWITTER_ACCESS_TOKEN),
			accessSecret: undefinedToEmpty(process.env.TWITTER_ACCESS_TOKEN_SECRET),
		});

		try {
			await client.v2.me();
			this.twitter_client = client;
			console.log("Twitter successfully authenticated")
		} catch (e) {
			console.log("Twitter failed to authenticate")
		}
		return this.twitter_client;
	}

	async get_bsky(): Promise<AtpBaseClient> {
		if (this.bsky_client) return this.bsky_client;
		return await new Promise(()=>{});
	}
}

export const clientCache = new ClientCache();