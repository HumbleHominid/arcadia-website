'use server';

import { sql } from "@vercel/postgres";
import {
	MembersTable,
	Video,
	Social,
	Member
} from "@/app/lib/definitions";

export async function fetchMembers(): Promise<Array<MembersTable>> {
	try {
		const data = await sql<MembersTable>`
			SELECT
				id,
				name,
				yt_id
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
				m.name AS uploader,
				v.title,
				v.video_id,
				v.publish_date,
				v.is_arcadia_video
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
					m.name AS uploader,
					v.title,
					v.video_id,
					v.publish_date,
					v.is_arcadia_video
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
				m.name AS uploader,
				v.title,
				v.video_id,
				v.publish_date,
				v.is_arcadia_video
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

export async function fetchVideosForMember(member:string): Promise<Array<Video>> {
	try {
		// TODO Pagination
		const data = await sql<Video>`
			SELECT
				${member} AS uploader,
				title,
				video_id,
				publish_date,
				is_arcadia_video
			FROM Videos
			WHERE member_id = (SELECT id FROM Members WHERE name = ${member})
		`;

		return data.rows;
	}
	catch(err) {
		console.error('Database Error:', err);
		throw new Error(`Failed to fetch videos for ${member}.`);
	}
}

export async function fetchSocialsForMember(member:string): Promise<Array<Social>> {
	try {
		const data = await sql<Social>`
			SELECT
				st.name AS type,
				s.url
			FROM Socials s
			INNER JOIN SocialTypes st ON s.social_type_id = st.id
			WHERE s.member_id = (SELECT id FROM Members WHERE name = ${member})
		`;

		return data.rows;
	}
	catch(err) {
		console.error('Database Error:', err);
		throw new Error(`Failed to fetch socials for ${member}.`);
	}
}

export async function fetchMembersYouTube(): Promise<Array<Member>> {
	try {
		const data = await sql<Member>`
			SELECT
				name,
				yt_id
			FROM Members
			WHERE yt_id IS NOT NULL
		`;

		return data.rows;
	}
	catch(err) {
		console.error('Database Error:', err);
		throw new Error('Failed to fetch member\'s YouTube.');
	}
}
