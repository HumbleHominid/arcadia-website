'use server';

import { clientCache } from "@/app/lib/socials/client-cache";
import { fetchSocialsForMemberHandle } from "@/app/lib/data";
import { RichText } from "@atproto/api";

type SocialPostData = {
	video_title: string,
	video_id: string,
	yt_handle: string
}

enum Platform {
	BSKY = "BlueSky",
	Twitter = "Twitter/X"
}

function createPostContents(video_data: SocialPostData, social_handle: string = '') {
	let text = video_data.video_title;
	if (social_handle) text += ` @${social_handle}`
	text += ` https://www.youtube.com/watch?v=${video_data.video_id}`

	return text;
}

export async function createPosts(data: SocialPostData) {
		const socialInfo = await fetchSocialsForMemberHandle(data.yt_handle);

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
				post_text = createPostContents(data, social_handle);
			}
			// Otherwise, just make the posts text without any tags
			else {
				post_text = createPostContents(data);
			}

			if (platform === Platform.Twitter) {
				const client = await clientCache.get_twitter();
				if (!client) return;
				try {
					console.log(`posting tweet: ${post_text}`)
					client.v2.tweet({
						text: post_text
					});
				} catch (e) {
					console.log(`Failed to post tweet with err: ${e}`);
				}
			}
			else if (platform === Platform.BSKY) {
				// const client = clientCache.get_bsky();
				// Have to do some extra formatting work for Bluesky
				// const rt = new RichText({
				// 	text: post_text,
				// });
				// await rt.detectFacets(client)
			}
		});


		// Fire and forget intended.
		socialInfo.forEach(async (social) => {
		});
	}