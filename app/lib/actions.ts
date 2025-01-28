'use server';

import { fetchLatestVideos, fetchMembers, fetchMembersYouTube } from "@/app/lib/data";
import Parser from "rss-parser";
import { getYouTube } from "@/app/lib/google";
import { Member, MemberYouTube, Video } from "@/app/lib/definitions";
import { sql } from "@vercel/postgres";
import { youtube_v3 } from "googleapis";

type CreateVideoData = {
	title: string;
	video_id: string;
	publish_date: string;
	duration: string;
	uploader_id: string;
	is_arcadia_video: boolean;
}

export async function createVideo(video: CreateVideoData) {
	try {
		await sql`
			INSERT INTO Videos(member_id, title, video_id, publish_date, is_arcadia_video, duration)
				SELECT m.id, ${video.title}, ${video.video_id}, ${video.publish_date}, ${video.is_arcadia_video}, ${video.duration}
				FROM Members m
				WHERE m.yt_id = ${video.uploader_id}
				AND NOT EXISTS (SELECT 1 FROM Videos v WHERE v.video_id = ${video.video_id});
		`;
	}
	catch (err) {
		console.error('Database Error:', err);
	}
}

async function updateMemberPfp(yt_id: string, pfp: string) {
	try {
		await sql`
			UPDATE Members
				SET yt_pfp_url = ${pfp}
				WHERE yt_id = ${yt_id};
		`;
	}
	catch (e) {
		console.error(`Failed to update pfp for member ${yt_id}`);
	}
}

async function updateMemberName(yt_id: string, name: string) {
	try {
		await sql`
			UPDATE Members
				SET name = ${name}
				WHERE yt_id = ${yt_id};
		`;
	}
	catch (e) {
		console.error(`Failed to update pfp for member ${yt_id}`);
	}
}

async function updateMemberHandle(yt_id: string, handle: string) {
	try {
		await sql`
			UPDATE Members
				SET handle = ${handle}
				WHERE yt_id = ${yt_id};
		`;
	}
	catch (e) {
		console.error(`Failed to update pfp for member ${yt_id}`);
	}
}

async function insertMemberYouTubeSocial(handle: string) {
	try {
		const url = `https://www.youtube.com/${handle}`;
		await sql`
			INSERT INTO Socials (member_id, social_type_id, url)
				SELECT m.id, st.id, ${url}
				FROM Members m, SocialTypes st
				WHERE m.handle = ${handle}
				AND st.name = 'YouTube'
		`;
	}
	catch (e) {
		console.error(`Failed to insert YouTube Social for member '${handle}'`);
	}
}

async function updateMemberYouTubeSocial(handle: string) {
	try {
		const url = `https://www.youtube.com/${handle}`;
		await sql`
			UPDATE Socials
				SET url = ${url}
				WHERE id = (SELECT id FROM Members WHERE handle = ${handle})
		`;
	}
	catch (e) {
		console.error(`Failed to update YouTube Social for member '${handle}'`);
	}
}

export async function updateDbVideos() {
	// Get list of members
	const members: Array<MemberYouTube> = [];
	try {
		members.push(...(await fetchMembersYouTube()));
	}
	catch (e) {
		console.error('fetchMembersYouTube failure:', e);
		return;
	}
	// Get latest video for each member
	const latestVideos: Array<Video> = []
	try {
		latestVideos.push(...(await fetchLatestVideos()));
	}
	catch (e) {
		console.error('fetchLatestVideos failure:', e);
		return;
	}
	type ytRSS = {[key: string]: any;} & Parser.Output<{[key: string]: any;}>;
	let memberRSS: Array<ytRSS> = [];
	const parser: Parser = new Parser();
	const corsProxy = 'https://corsproxy.io/?url=';
	const ytRSS = 'https://www.youtube.com/feeds/videos.xml?channel_id=';
	// Sequential requests to try not to get blocked
	members.forEach(async (member) => {
		try {
			memberRSS.push(await parser.parseURL(corsProxy + ytRSS + member.yt_id));
		}
		catch (e) {
			console.log(`Member RSS failure: ${member.yt_id}`, e);
		}
	});

	const vidIdsToRequest: Array<string> = [];
	memberRSS.forEach((member) => {
		if (!member.link) return;
		const channelIdMatch = member.link?.match(/\/channel\/([\w-]+)/);
		if (!(channelIdMatch && channelIdMatch[1])) return;
		const channelId = channelIdMatch[1];
		// Get the latest uploaded video for this member
		const dbLatest = latestVideos.filter((vid) => vid.uploader_id === channelId);
		// The latest video is already the most recent one in our db
		if (dbLatest.length) {
			// If the vid in the db is the latest one, early out
			if (member.items[0].id.replace('yt:video:', '') === dbLatest[0].video_id) return;
		}
		// Figure out how many videos we have to request from the google api
		for (let i = 0; i < member.items.length; ++i) {
			const vidId = member.items[i].id.replace('yt:video:', '');
			if (dbLatest.length && vidId === dbLatest[0].video_id) break;
			vidIdsToRequest.push(vidId);
		}
	});

	// Early out if we don't have any videos to request
	if (vidIdsToRequest.length === 0) return;

	// Hit the google api
	try {
		const api = await getYouTube();
		const id_request_max_len = 50;
		for (let i = 0; i < vidIdsToRequest.length;i+=id_request_max_len) {
			try {
				const res = await api.videos.list({
					part: [
						"snippet,contentDetails"
					],
					id: vidIdsToRequest.slice(i, i+id_request_max_len)
				});

				if (!res.data.items || res.data.items.length === 0) continue;
				const formattedVids: Array<CreateVideoData> = [];
				res.data.items.forEach((vid) => {
					const data = vid.snippet;
					if (data === undefined) return;
					let is_arcadia_video = false;
					if (data.tags) {
						is_arcadia_video = data.tags.filter((tag) => tag.toLowerCase().includes("arcadia")).length > 0;
					}
					const valOrEmpty = (val: string | null | undefined) => {
						return val === undefined || val === null ? '' : val;
					}
					let duration: string = 'PT0H0H0S';
					if (vid.contentDetails?.duration) {
						duration = vid.contentDetails.duration;
					}
					formattedVids.push({
						title: valOrEmpty(data.title),
						video_id: valOrEmpty(vid.id),
						publish_date: valOrEmpty(data.publishedAt),
						uploader_id: valOrEmpty(data.channelId),
						is_arcadia_video: is_arcadia_video,
						duration: duration
					});
				});

				// const createVideoRequests = formattedVids.map((vid) => createVideo(vid));
				// await Promise.all(createVideoRequests);
			}
			catch (e) {
				console.error('api.videos.list failure:', e);
				continue;
			}
		}
	}
	catch (e) {
		console.error('getYouTube failure:', e);
		return;
	}
}

export async function updateDbMembers() {
	const members: Array<Member> = [];
	try {
		members.push(...(await fetchMembers()));
	}
	catch (e) {
		console.log('updateDbMembers: Failed to fetch members.', e);
		return;
	}
	let api: youtube_v3.Youtube;
	try {
		api = await getYouTube()
	}
	catch (e) {
		console.error('failed to get YouTube api')
		return;
	}

	for (let i = 0; i < members.length; ++i) {
		const member = members[i];
		try {
			const res = await api.channels.list({
				part: [ "snippet" ],
				id: [ member.yt_id ]
			});

			if (!res.data.items || res.data.items.length === 0) continue;
			const ytMember = res.data.items[0];
			if (!ytMember.snippet) continue;
			const snippet = ytMember.snippet;

			const updatePromises: Array<Promise<void>> = [];
			if (snippet.customUrl && member.handle !== snippet.customUrl) {
				// We await here because insert/update member YT social requires this
				await updateMemberHandle(member.yt_id, snippet.customUrl);
				// Also add/update this in the socials
				if (!member.handle) {
					updatePromises.push(insertMemberYouTubeSocial(snippet.customUrl));
				}
				else {
					updatePromises.push(updateMemberYouTubeSocial(snippet.customUrl));
				}
			}
			if (snippet.title && member.name !== snippet.title) {
				updatePromises.push(updateMemberName(member.yt_id, snippet.title));
			}
			if (snippet.thumbnails && snippet.thumbnails.default && snippet.thumbnails.default.url) {
				if (member.yt_pfp_url !== snippet.thumbnails.default.url) {
					updatePromises.push(updateMemberPfp(member.yt_id, snippet.thumbnails.default.url));
				}
			}
			await Promise.all(updatePromises);
		}
		catch (e) {
			console.log(`YouTube Channel request for '${member} failed.'`);
			return;
		}
	}
}
