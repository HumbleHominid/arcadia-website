import { neon } from "@neondatabase/serverless";
import { Video, Social, Member } from "@/app/lib/definitions";

// Neon's HTTP driver: each query is one request, with no connection to set up first
export const sql = neon(process.env.DATABASE_URL!);

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
				SELECT DISTINCT ON (v.member_id)
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
		`) as Video[];
  } catch (err) {
    console.error("Database Error:", err);
    throw new Error(`Failed to fetch videos for handle '${handle}'.`);
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
