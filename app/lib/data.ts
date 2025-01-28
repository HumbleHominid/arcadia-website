'use server';

import { sql } from "@vercel/postgres";
import {
	Video,
	Social,
	Member,
	MemberYouTube
} from "@/app/lib/definitions";

export async function fetchMembers(): Promise<Array<Member>> {
	try {
		const data = await sql<Member>`
			SELECT
				name,
				handle,
				yt_id,
				yt_pfp_url,
				uploads_playlist
			FROM Members
			ORDER BY lower(name) ASC
		`;

		return data.rows;
	}
	catch(err) {
		console.error('Database Error:', err);
		throw new Error('Failed to fetch all members.');
	}
}

export async function fetchAllVideos(): Promise<Array<Video>> {
	try {
		const data = await sql<Video>`
			SELECT
				m.name AS uploader_name,
				m.handle AS uploader_handle,
				m.yt_id AS uploader_id,
				v.title,
				v.video_id,
				v.publish_date,
				v.is_arcadia_video,
				v.duration
			FROM Videos v
			INNER JOIN Members m ON v.member_id = m.id
			ORDER BY v.publish_date DESC
			LIMIT 50
		`;

		return data.rows;
	}
	catch(err) {
		console.error('Database Error:', err);
		throw new Error('Failed to fetch all videos.');
	}
}

export async function fetchLatestVideos(): Promise<Array<Video>> {
	try {
		const data = await sql<Video>`
			SELECT
					m.name AS uploader_name,
					m.handle AS uploader_handle,
					m.yt_id AS uploader_id,
					v.title,
					v.video_id,
					v.publish_date,
					v.is_arcadia_video,
					v.duration
			FROM videos v
			JOIN
					(SELECT member_id, MAX(publish_date) as max_date
					FROM videos
					GROUP BY member_id) latest
				ON v.member_id = latest.member_id AND v.publish_date = latest.max_date
			INNER JOIN Members m ON v.member_id = m.id
			ORDER BY v.publish_date DESC
		`;

		return data.rows;
	}
	catch(err) {
		console.error('Database Error:', err);
		throw new Error('Failed to fetch all videos.');
	}
}

export async function fetchArcadiaVideos(): Promise<Array<Video>> {
	try {
		const data = await sql<Video>`
			SELECT
				m.name AS uploader_name,
				m.handle AS uploader_handle,
				m.yt_id AS uploader_id,
				v.title,
				v.video_id,
				v.publish_date,
				v.is_arcadia_video,
				v.duration
			FROM Videos v
			INNER JOIN Members m ON v.member_id = m.id
			WHERE v.is_arcadia_video = TRUE
			ORDER BY v.publish_date DESC
			LIMIT 50
		`;

		return data.rows;
	}
	catch(err) {
		console.error('Database Error:', err);
		throw new Error('Failed to fetch all videos.');
	}
}

export async function fetchVideosForMemberHandle(handle:string): Promise<Array<Video>> {
	try {
		const data = await sql<Video>`
			SELECT
				m.name AS uploader_name,
				m.handle AS uploader_handle,
				m.yt_id AS uploader_id,
				title,
				video_id,
				publish_date,
				is_arcadia_video,
				duration
			FROM Videos v
			INNER JOIN Members m on v.member_id = m.id
			WHERE m.handle = ${handle}
			ORDER BY publish_date DESC
			LIMIT 50
		`;

		return data.rows;
	}
	catch(err) {
		console.error('Database Error:', err);
		throw new Error(`Failed to fetch videos for handle '${handle}'.`);
	}
}

export async function fetchSocialsForMemberHandle(handle:string): Promise<Array<Social>> {
	try {
		const data = await sql<Social>`
			SELECT
				st.name AS type,
				s.url
			FROM Socials s
			INNER JOIN SocialTypes st ON s.social_type_id = st.id
			WHERE s.member_id = (SELECT id FROM Members WHERE handle = ${handle})
			ORDER BY st.name ASC
		`;

		return data.rows;
	}
	catch(err) {
		console.error('Database Error:', err);
		throw new Error(`Failed to fetch socials for handle '${handle}'.`);
	}
}

export async function fetchMemberByHandle(handle: string): Promise<Array<Member>> {
	try {
		const data = await sql<Member>`
			SELECT
				name,
				handle,
				yt_id,
				yt_pfp_url,
				uploads_playlist
			FROM Members
			WHERE handle = ${handle}
		`;

		return data.rows;
	}
	catch(err) {
		console.error('Database Error:', err);
		throw new Error(`Failed to fetch member with handle '${handle}'.`);
	}
}

export async function fetchMembersYouTube(): Promise<Array<MemberYouTube>> {
	try {
		const data = await sql<MemberYouTube>`
			SELECT
				yt_id,
				uploads_playlist
			FROM Members
		`;

		return data.rows;
	}
	catch(err) {
		console.error('Database Error:', err);
		throw new Error('Failed to fetch member\'s YouTube.');
	}
}
