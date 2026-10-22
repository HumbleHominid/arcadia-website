import { neon } from "@neondatabase/serverless";
import { Video, Social, Member } from "@/app/lib/definitions";

// Neon's HTTP driver: each query is one request, with no connection to set up first
export const sql = neon(process.env.DATABASE_URL!);

// Columns for every Video query (needs `Videos v JOIN Members m`). publish_date is a
// timestamptz, returned as an ISO 'YYYY-MM-DDTHH:MM:SSZ' string so callers and caches see
// a plain string. A constant, so sql.unsafe is safe here.
const VIDEO_COLUMNS = sql.unsafe(`
	m.name AS uploader_name,
	m.handle AS uploader_handle,
	m.yt_id AS uploader_id,
	v.title,
	v.video_id,
	to_char(v.publish_date AT TIME ZONE 'UTC', 'YYYY-MM-DD"T"HH24:MI:SS"Z"') AS publish_date,
	v.is_arcadia_video,
	v.duration`);

export async function fetchMembers(): Promise<Array<Member>> {
  try {
    return (await sql`
			SELECT
				name,
				handle,
				yt_id,
				yt_pfp_url,
				uploads_playlist,
				description
			FROM Members
			ORDER BY lower(name) ASC
		`) as Member[];
  } catch (err) {
    console.error("Database Error:", err);
    throw new Error("Failed to fetch all members.");
  }
}

export async function fetchVideos(arcadiaOnly: boolean): Promise<Array<Video>> {
  try {
    return (await sql`
			SELECT ${VIDEO_COLUMNS}
			FROM Videos v
			INNER JOIN Members m ON v.member_id = m.id
			WHERE (${!arcadiaOnly}::boolean OR v.is_arcadia_video)
			ORDER BY v.publish_date DESC
			LIMIT 50
		`) as Video[];
  } catch (err) {
    console.error("Database Error:", err);
    throw new Error("Failed to fetch videos.");
  }
}

export async function fetchLatestVideos(): Promise<Array<Video>> {
  try {
    // DISTINCT ON reads videos once and guarantees one row per member, even on publish_date ties
    return (await sql`
			SELECT * FROM (
				SELECT DISTINCT ON (v.member_id) ${VIDEO_COLUMNS}
				FROM Videos v
				INNER JOIN Members m ON v.member_id = m.id
				ORDER BY v.member_id, v.publish_date DESC
			) latest
			ORDER BY publish_date DESC
		`) as Video[];
  } catch (err) {
    console.error("Database Error:", err);
    throw new Error("Failed to fetch all videos.");
  }
}

export async function fetchVideosForMemberHandle(
  handle: string,
): Promise<Array<Video>> {
  console.log("Fetching videos for handle:", handle);
  try {
    return (await sql`
			SELECT ${VIDEO_COLUMNS}
			FROM Videos v
			INNER JOIN Members m ON v.member_id = m.id
			WHERE m.handle = ${handle}
			ORDER BY v.publish_date DESC
			LIMIT 50
		`) as Video[];
  } catch (err) {
    console.error("Database Error:", err);
    throw new Error(`Failed to fetch videos for handle '${handle}'.`);
  }
}

// Every stored video ID, grouped by member, for the daily deleted-video check
export async function fetchVideoIdsByMember(): Promise<
  Array<{ handle: string; video_ids: string[] }>
> {
  try {
    return (await sql`
			SELECT m.handle, array_agg(v.video_id ORDER BY v.publish_date DESC) AS video_ids
			FROM Videos v
			INNER JOIN Members m ON v.member_id = m.id
			GROUP BY m.handle
		`) as Array<{ handle: string; video_ids: string[] }>;
  } catch (err) {
    console.error("Database Error:", err);
    throw new Error("Failed to fetch video IDs.");
  }
}

export async function fetchSocialsForMemberHandle(
  handle: string,
): Promise<Array<Social>> {
  try {
    return (await sql`
			SELECT
				st.name AS type,
				s.url
			FROM Socials s
			INNER JOIN SocialTypes st ON s.social_type_id = st.id
			WHERE s.member_id = (SELECT id FROM Members WHERE handle = ${handle})
			ORDER BY st.name ASC
		`) as Social[];
  } catch (err) {
    console.error("Database Error:", err);
    throw new Error(`Failed to fetch socials for handle '${handle}'.`);
  }
}
