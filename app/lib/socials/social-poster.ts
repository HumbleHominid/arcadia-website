'use server';

import { SocialHandler } from "@/app/lib/socials/social-handler";
import { fetchSocialsForMemberHandle } from "@/app/lib/data";
import AtpAgent, { RichText } from "@atproto/api";

const IS_DRY_RUN = process.env.NODE_ENV !== "production" && true;

type SocialPostData = {
	video_title: string;
	video_id: string;
	yt_handle: string;
	description: string;
};

enum Platform {
	BSKY = "BlueSky",
	Twitter = "Twitter/X"
}

function createPostContents(platform: Platform, video_data: SocialPostData, social_handle: string = '') {
	let text = video_data.video_title;
	if (social_handle) text += ` @${social_handle}`
	if (platform === Platform.Twitter) text += ` https://www.youtube.com/watch?v=${video_data.video_id}`

	return text;
}

async function getBSKYEmbedCard(client: AtpAgent, video_data: SocialPostData) {
	try {
		const blob = await fetch(`https://i.ytimg.com/vi/${video_data.video_id}/mqdefault.jpg`).then(r => r.blob());
		const { data } = await client.uploadBlob(blob, { encoding: "image/jpeg" });

		return {
			$type: 'app.bsky.embed.external',
			external: {
				uri: `https://youtu.be/${video_data.video_id}`,
				title: video_data.video_title,
				description: video_data.description,
				thumb: data.blob
			}
		}
	} catch (e) {
		console.log(`Failed to produce BSKY Embed Card with err: ${e}`);
		return;
	}
}

export async function createPosts(data: SocialPostData, handler: SocialHandler) {
		const socialInfo = await fetchSocialsForMemberHandle(data.yt_handle);

		// Fire and forget intended
		[Platform.BSKY, Platform.Twitter].forEach(async (platform) => {
			let post_text: string = "";
			const platformInfo = socialInfo.filter((social) => social.type === platform);

			// If the member has socials they want us to tag, figure out their handle and make the post text
			if (platformInfo.length > 0) {
				// Do some URI stuff to get the social handle
				// TODO: This probably won't work for every social media but it works for the two we have now so no
				// reason to overengineer something atm
				const social = platformInfo[0];
				let social_handle: string | undefined = social.url;
				if (social_handle.endsWith('/')) {
					social_handle = social.url.substring(0, social.url.length - 1);
				}
				social_handle = social_handle.split('/').pop();
				post_text = createPostContents(platform, data, social_handle);
			}
			// Otherwise, just make the posts text without any tags
			else {
				post_text = createPostContents(platform, data);
			}

			if (platform === Platform.Twitter) {
				const client = await handler.get_twitter();
				if (!client) return;
				try {
					console.log(`posting tweet: ${post_text}`);
					if (!IS_DRY_RUN) {
						client.v2.tweet({
							text: post_text
						});
					}
				} catch (e) {
					console.log(`Failed to post tweet with err: ${e}`);
				}
			}
			else if (platform === Platform.BSKY) {
				const client = await handler.get_bsky();
				if (!client) return;
				// Have to do some extra formatting work for Bluesky
				const rt = new RichText({
					text: post_text,
				});
				await rt.detectFacets(client);
				try {
					console.log(`posting skeet: ${post_text}`)
					if (!IS_DRY_RUN) {
						await client.post({
							text: rt.text,
							facets: rt.facets,
							embed: await getBSKYEmbedCard(client, data)
						});
					}
				} catch (e) {
					console.log(`Failed to post skeet with err: ${e}`);
				}
			}
		});
	}