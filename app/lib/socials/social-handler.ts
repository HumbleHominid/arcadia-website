import AtpAgent from "@atproto/api";
import { TwitterApi } from "twitter-api-v2";

const undefinedToEmpty = (str:string|undefined) => str === undefined ? '' : str;

export class SocialHandler {
	private initialized: boolean = false;
	private twitter_client: TwitterApi | undefined = undefined;
	private bsky_client : AtpAgent | undefined = undefined;

	async init() {
		if (this.initialized) return;
		await Promise.all([
			this.get_twitter(),
			this.get_bsky()
		]);
		this.initialized = true;
	}

	isInitialized() { return this.initialized; }

	async get_twitter(): Promise<TwitterApi | undefined> {
		if (this.twitter_client) return this.twitter_client;

		const client: TwitterApi = new TwitterApi({
			appKey: undefinedToEmpty(process.env.TWITTER_CONSUMER_KEY),
			appSecret: undefinedToEmpty(process.env.TWITTER_CONSUMER_KEY_SECRET),
			accessToken: undefinedToEmpty(process.env.TWITTER_ACCESS_TOKEN),
			accessSecret: undefinedToEmpty(process.env.TWITTER_ACCESS_TOKEN_SECRET),
		});

		try {
			await client.v2.me();
			this.twitter_client = client;
			console.log('Twitter successfully authenticated');
		} catch (e) {
			console.log(`Twitter failed to authenticate with err: ${e}`)
		}
		return this.twitter_client;
	}

	async get_bsky(): Promise<AtpAgent | undefined> {
		if (this.bsky_client) return this.bsky_client;

		const agent: AtpAgent = new AtpAgent({
			service: 'https://bsky.social',
		});

		try {
			await agent.login({
				identifier: undefinedToEmpty(process.env.BSKY_IDENTIFIER),
				password: undefinedToEmpty(process.env.BSKY_PASSWORD)
			});
			console.log('BlueSky successfully authenticated');
			this.bsky_client = agent
		}
		catch (e) {
			console.log(`Bluesky failed to authenticate with err: ${e}`);
		}

		return this.bsky_client;
	}
}