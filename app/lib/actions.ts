import { fetchLatestVideos, fetchMembersYouTube } from "@/app/lib/data";
import Parser from "rss-parser";
import { getYouTube } from "@/app/lib/google";
import { Member, Video } from "@/app/lib/definitions";
import { sql } from "@vercel/postgres";

export async function createVideo(video: Video) {
	try {
		await sql`
			INSERT INTO Videos(member_id, title, video_id, publish_date, is_arcadia_video)
				SELECT m.id, ${video.title}, ${video.video_id}, ${video.publish_date}, ${video.is_arcadia_video}
				FROM Members m
				WHERE m.yt_id = ${video.uploader}
				AND NOT EXISTS (SELECT 1 FROM Videos v WHERE v.video_id = ${video.video_id});
		`;
	}
	catch (err) {
		console.error('Database Error:', err);
	}
}

export async function updateDB() {
	// Get list of members
	const members: Array<Member> = []
	try {
		members.concat(await fetchMembersYouTube());
	}
	catch (e) {
		console.error('fetchMembersYouTube failure:', e);
		return;
	}
	// Get latest video for each member
	const latestVideos: Array<Video> = []
	try {
		latestVideos.concat(await fetchLatestVideos());
	}
	catch (e) {
		console.error('fetchLatestVideos failure:', e);
		return;
	}
	const parser: Parser = new Parser();
	const corsProxy = 'https://corsproxy.io/?url=';
	const ytRSS = 'https://www.youtube.com/feeds/videos.xml?channel_id='
	const memberRSSPromises = members.map((member) => parser.parseURL(corsProxy + ytRSS + member.yt_id));

	const memberRSS = await Promise.all(memberRSSPromises);
	const vidIdsToRequest: Array<string> = [];
	memberRSS.forEach((member) => {
		// Get the latest uploaded video for this member
		const dbLatest = latestVideos.filter((vid) => vid.uploader === member.items[0].author);
		// The latest video is already the most recent one in our db
		if (dbLatest.length) {
			// If the vid in the db is the latest one, early out
			if (member.items[0].id.replace('yt:video:', '') === dbLatest[0].video_id) return;
		}
		// Figure out how many videos we have to request from the google api
		for (let i = 0; i < member.items.length; ++i) {
			const vidId = member.items[i].id.replace('yt:video:', '');
			if (dbLatest.length > 0 && vidId !== dbLatest[0].video_id) break;
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

				const formattedVids: Array<Video> = [];
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
					formattedVids.push({
						title: valOrEmpty(data.title),
						video_id: valOrEmpty(vid.id),
						publish_date: valOrEmpty(data.publishedAt),
						uploader: valOrEmpty(data.channelId),
						is_arcadia_video: is_arcadia_video
					});
				});

				const createVideoRequests = formattedVids.map((vid) => createVideo(vid));
				await Promise.all(createVideoRequests);
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
