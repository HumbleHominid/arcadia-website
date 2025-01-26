'use server';

import { sql } from "@vercel/postgres";
import {
	MembersTable,
	Video,
	Social
} from "@/app/lib/definitions";

export async function fetchMembers(): Promise<Array<MembersTable>> {
	try {
		const data = await sql<MembersTable>`
			SELECT
				id,
				name
			FROM Members
			ORDER BY name ASC
		`;

		return data.rows;
	}
	catch(err) {
		console.error('Database Error:', err);
		throw new Error('Failed to fetch all members.');
	}
}

export async function fetchVideos(): Promise<Array<Video>> {
	try {
		const data = await sql<Video>`
			SELECT
				m.name as uploader,
				v.title,
				v.video_id,
				v.publish_date,
				v.is_arcadia_video
			FROM Videos v
			INNER JOIN Members m on v.member_id = m.id
		`;

		return data.rows;
	}
	catch(err) {
		console.error('Database Error:', err);
		throw new Error('Failed to fetch all videos.');
	}
}

export async function fetchSocialsForMember(member:string): Promise<Array<Social>> {
	try {
		const data = await sql<Social>`
			SELECT
				st.name as type,
				s.url
			FROM Socials s
			INNER JOIN SocialTypes st on s.social_type_id = st.id
			WHERE s.member_id = (SELECT id FROM Members WHERE name = ${member})
		`;

		return data.rows;
	}
	catch(err) {
		console.error('Database Error:', err);
		throw new Error(`Failed to fetch socials for ${member}.`);
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