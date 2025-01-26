'use server';

import { sql } from "@vercel/postgres";
import {
	MembersTable,
	Video
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
			JOIN Members m on v.member_id = m.id
		`;

		return data.rows;
	}
	catch(err) {
		console.error('Database Error:', err);
		throw new Error('Failed to fetch all videos.');
	}
}