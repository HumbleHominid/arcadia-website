'use server';

import { sql } from "@vercel/postgres";
import { MembersTable } from "@/app/lib/definitions";

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
	catch (err) {
		console.error('Database Error:', err);
		throw new Error('Failed to fetch all members.');
	}
}