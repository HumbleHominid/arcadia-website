'use client';

import { Social } from "@/app/lib/definitions";
import { use } from "react";
import CollapseableList from "@/app/ui/collapseable-list/collapseable-list";

export default function SocialsList({
	socials = new Promise(()=>[]),
}: {
	socials?: Promise<Array<Social>>;
}) {
	const allSocials = use(socials)
		.map((social) => {
			let socialUrl: string = '';
			switch (social.type) {
				case 'YouTube':
					socialUrl = '/icons/yt.png';
					break;
				case 'Twitch':
					socialUrl = '/icons/twitch.png'
					break;
				case 'Twitter/X':
					socialUrl = '/icons/twitter_icon.png';
					break;
				case 'BlueSky':
					socialUrl = '/icons/bluesky_icon.svg';
					break;
				case 'Linktree':
					socialUrl = '/icons/linktree.png';
					break;
				case 'TikTok':
					socialUrl = '/icons/tiktok.png'
					break;
				case 'Instagram':
					socialUrl = '/icons/instagram.svg';
					break;
				default:
					socialUrl = '/icons/link.svg';
			}

			let text: string | undefined = social.url;
			if (text.endsWith('/')) {
				text = social.url.substring(0, social.url.length - 1);
			}
			text = text.split('/').pop();

			return {
				src: socialUrl,
				url: social.url,
				text:	text ? text : social.type
			}
		});
	return (
		<CollapseableList data={allSocials} isExpandedDefault={true} title="Socials" />
	);
}