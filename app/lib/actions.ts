import { fetchMembers, fetchVideoIdsByMember, sql } from "@/app/lib/data";
import {
  getCachedMembers,
  getCachedSocialsForMemberHandle,
  getCachedVideosForMemberHandle,
  videoListTag,
} from "@/app/lib/cache-methods";
import { youtube, YouTubeItem } from "@/app/lib/google";
import { FilterType, Member } from "@/app/lib/definitions";
import { socialPoster } from "@/app/lib/socials/social-poster";
import { PLATFORMS } from "@/app/lib/socials/platforms";
import { revalidateTag } from "next/cache";

// Tags used by getCachedVideos for each home page filter
const VIDEO_LIST_TAGS = Object.values(FilterType).map(videoListTag);

type CreateVideoData = {
  title: string;
  video_id: string;
  publish_date: string;
  duration: string;
  is_arcadia_video: boolean;
};

// The stored fields of a videos.list item (part "snippet,contentDetails,status"), shared by the
// insert and the daily refresh. null means don't store it: only public videos are kept
// (videos.list by ID also returns unlisted ones), and publish_date is a required timestamptz.
function videoFields(vid: YouTubeItem): CreateVideoData | null {
  const { id, snippet } = vid;
  if (!id || !snippet?.publishedAt || vid.status?.privacyStatus !== "public")
    return null;
  return {
    video_id: id,
    title: snippet.title ?? "",
    publish_date: snippet.publishedAt,
    is_arcadia_video: !!snippet.tags?.some((tag) =>
      tag.toLowerCase().includes("arcadia"),
    ),
    duration: vid.contentDetails?.duration || "PT0S",
  };
}

// One round trip for all of a member's new videos. ON CONFLICT skips any already stored,
// and RETURNING says which were really inserted, so only those get announced.
async function createVideos(yt_id: string, vids: Array<CreateVideoData>) {
  const rows = await sql`
		INSERT INTO Videos (member_id, title, video_id, publish_date, is_arcadia_video, duration)
			SELECT m.id, v.title, v.video_id, v.publish_date, v.is_arcadia_video, v.duration
			FROM Members m, unnest(
				${vids.map((v) => v.title)}::text[],
				${vids.map((v) => v.video_id)}::text[],
				${vids.map((v) => v.publish_date)}::timestamptz[],
				${vids.map((v) => v.is_arcadia_video)}::boolean[],
				${vids.map((v) => v.duration)}::text[]
			) AS v(title, video_id, publish_date, is_arcadia_video, duration)
			WHERE m.yt_id = ${yt_id}
		ON CONFLICT (video_id) DO NOTHING
		RETURNING video_id
	`;
  return new Set(rows.map((row) => row.video_id as string));
}

// Insert or replace the member's YouTube link (one row per member and social type)
async function upsertMemberYouTubeSocial(yt_id: string, handle: string) {
  try {
    await sql`
			INSERT INTO Socials (member_id, social_type_id, url)
				SELECT m.id, st.id, ${`https://www.youtube.com/${handle}`}
				FROM Members m, SocialTypes st
				WHERE m.yt_id = ${yt_id} AND st.name = 'YouTube'
			ON CONFLICT (member_id, social_type_id) DO UPDATE SET url = EXCLUDED.url
		`;
  } catch (e) {
    console.error(`Failed to save YouTube Social for member '${handle}'`, e);
  }
}

export async function updateDbVideos() {
  console.log("Updating DB Videos...");
  const members = await getCachedMembers();
  const postVideo = socialPoster(PLATFORMS); // one login per platform for this run
  let didUpdate = false;
  const failed: string[] = [];

  for (const member of members) {
    // Dedupe is by handle; without one we'd re-post every run
    if (!member.uploads_playlist || !member.handle) continue;
    try {
      const playlistRes = await youtube("playlistItems", {
        part: "snippet",
        playlistId: member.uploads_playlist,
        maxResults: "5",
      });
      // Cached read: this runs every 10 minutes, and an uncached query would keep Neon awake
      const vidIdsInDb = (
        await getCachedVideosForMemberHandle(member.handle)
      ).map((vid) => vid.video_id);
      const vidsToRequest = (playlistRes.items ?? [])
        .map((item) => item.snippet?.resourceId?.videoId)
        .filter((id): id is string => !!id && !vidIdsInDb.includes(id));

      if (vidsToRequest.length === 0) continue;
      console.log(
        `Found ${vidsToRequest.length} new videos for member '${member.handle}'\n`,
        vidsToRequest,
      );

      const vidsRes = await youtube("videos", {
        part: "snippet,contentDetails,status",
        id: vidsToRequest.join(","),
      });
      const vids = vidsRes.items ?? [];
      if (vids.length === 0) continue;
      console.log(
        `Fetched details for ${vids.length} videos from YouTube GCP for member '${member.handle}'\n`,
        vids.map((vid) => vid.id),
      );

      // Non-public videos aren't stored, so they're picked up once they go public
      const formattedVids = vids.flatMap((vid) => videoFields(vid) ?? []);
      if (formattedVids.length === 0) continue;

      const inserted = await createVideos(member.yt_id, formattedVids);
      revalidateTag(`${member.handle}-videos`);
      didUpdate = true;
      // Post only what the insert confirms is new: the cached ID list above can lag the DB.
      // Seconds-only duration (< 1 min) is likely a short; only post non-short Arcadia videos
      const toPost = formattedVids.filter(
        (vid) =>
          inserted.has(vid.video_id) &&
          vid.is_arcadia_video &&
          !/^PT\d+S$/.test(vid.duration),
      );
      if (toPost.length) {
        // The videos are already stored, so a failed socials read must not skip posting: post without @handles
        const socials = await getCachedSocialsForMemberHandle(
          member.handle,
        ).catch((e) => {
          console.error(`Socials read for '${member.handle}' failed:`, e);
          return [];
        });
        await Promise.all(
          toPost.map((vid) =>
            postVideo(
              { video_title: vid.title, video_id: vid.video_id },
              socials,
            ),
          ),
        );
      }
    } catch (e) {
      console.error(
        `YouTube playlist or video request for '${member.yt_id}' failed.`,
        e,
      );
      failed.push(member.handle); // keep going: one dead playlist shouldn't block everyone after it
    }
  }

  if (didUpdate) VIDEO_LIST_TAGS.forEach((tag) => revalidateTag(tag));
  // Still fail the cron so partial failures show up in Vercel's cron logs
  if (failed.length) throw new Error(`Failed for: ${failed.join(", ")}`);
}

export async function updateDbMembers() {
  const members = await fetchMembers();
  const failed: string[] = [];

  for (const member of members) {
    try {
      const res = await youtube("channels", {
        part: "snippet,contentDetails",
        id: member.yt_id,
      });

      const ytMember = res.items?.[0];
      if (!ytMember) {
        // The request succeeded, so the channel is gone (deleted or terminated). Its data can't
        // be kept, so one statement drops the member with their videos and socials.
        await sql`
					WITH m AS (SELECT id FROM Members WHERE yt_id = ${member.yt_id}),
					v AS (DELETE FROM Videos WHERE member_id IN (SELECT id FROM m)),
					s AS (DELETE FROM Socials WHERE member_id IN (SELECT id FROM m))
					DELETE FROM Members WHERE id IN (SELECT id FROM m)
				`;
        console.log(
          `Channel '${member.yt_id}' ('${member.handle}') is gone from YouTube: member deleted`,
        );
        revalidateTag("members");
        revalidateTag(`${member.handle}-videos`);
        revalidateTag(`${member.handle}-socials`);
        VIDEO_LIST_TAGS.forEach((tag) => revalidateTag(tag));
        continue;
      }
      const { snippet, contentDetails } = ytMember;
      if (!snippet || !contentDetails) continue;
      const handle = snippet.customUrl || null;
      // Store what YouTube returns (empty when it has none; the UI has fallbacks), except the
      // structural fields: the handle is the page URL and the playlist feeds update-videos
      const next = {
        handle: handle ?? member.handle,
        name: snippet.title ?? "",
        yt_pfp_url: snippet.thumbnails?.default?.url ?? "",
        uploads_playlist:
          contentDetails.relatedPlaylists?.uploads || member.uploads_playlist,
        description: snippet.description ?? "",
      };
      // Skip unchanged members: no write, and no busting the members cache every day
      if (
        Object.entries(next).every(([k, v]) => member[k as keyof Member] === v)
      )
        continue;
      await sql`
				UPDATE Members SET
					handle = ${next.handle},
					name = ${next.name},
					yt_pfp_url = ${next.yt_pfp_url},
					uploads_playlist = ${next.uploads_playlist},
					description = ${next.description}
				WHERE yt_id = ${member.yt_id}
			`;
      if (handle && handle !== member.handle) {
        await upsertMemberYouTubeSocial(member.yt_id, handle);
        revalidateTag(`${handle}-socials`);
      }
      // Video rows carry the uploader's name and handle, so their lists are stale too
      if (next.name !== member.name || next.handle !== member.handle) {
        revalidateTag(`${next.handle}-videos`);
        VIDEO_LIST_TAGS.forEach((tag) => revalidateTag(tag));
      }
      revalidateTag("members");
    } catch (e) {
      console.error(`YouTube Channel request for '${member.yt_id}' failed.`, e);
      failed.push(member.yt_id);
    }
  }

  if (failed.length) throw new Error(`Failed for: ${failed.join(", ")}`);
}

// Daily refresh of every stored video, so none is kept more than a day without being re-checked
// (YouTube API policy: stored data must be refreshed or deleted within 30 days).
// Updates changed videos and deletes the ones YouTube no longer returns as public.
export async function updateDeletedVideos() {
  // One uncached read of every stored ID (the cached per-member lists stop at 50).
  // Daily, so it shares the wake-up with update-members. Members with no videos aren't listed.
  const members = await fetchVideoIdsByMember();
  let didChange = false;
  const failed: string[] = [];

  for (const { handle, video_ids } of members) {
    try {
      const items: YouTubeItem[] = [];
      // videos.list takes at most 50 IDs per request. Same quota cost as part "id"
      for (let i = 0; i < video_ids.length; i += 50) {
        const res = await youtube("videos", {
          part: "snippet,contentDetails,status",
          id: video_ids.slice(i, i + 50).join(","),
        });
        items.push(...(res.items ?? []));
      }
      const fresh = items.flatMap((vid) => videoFields(vid) ?? []);
      // In the DB but not returned by YouTube (deleted or private), or no longer storable
      // (e.g. unlisted). A failed request throws above, so an empty success really means gone.
      const valid = new Set(fresh.map((f) => f.video_id));
      const gone = video_ids.filter((id) => !valid.has(id));
      // One round trip; only rows that differ are written, and RETURNING says which
      const updated = fresh.length
        ? await sql`
						UPDATE Videos v SET
							title = u.title,
							publish_date = u.publish_date,
							is_arcadia_video = u.is_arcadia_video,
							duration = u.duration
						FROM unnest(
							${fresh.map((f) => f.video_id)}::text[],
							${fresh.map((f) => f.title)}::text[],
							${fresh.map((f) => f.publish_date)}::timestamptz[],
							${fresh.map((f) => f.is_arcadia_video)}::boolean[],
							${fresh.map((f) => f.duration)}::text[]
						) AS u(video_id, title, publish_date, is_arcadia_video, duration)
						WHERE v.video_id = u.video_id
							AND (v.title, v.publish_date, v.is_arcadia_video, v.duration)
								IS DISTINCT FROM (u.title, u.publish_date, u.is_arcadia_video, u.duration)
						RETURNING v.video_id
					`
        : [];
      if (gone.length)
        await sql`DELETE FROM Videos WHERE video_id = ANY(${gone}::text[])`;
      if (updated.length === 0 && gone.length === 0) continue;
      console.log(
        `'${handle}': refreshed ${updated.length}, deleted ${gone.length} videos`,
      );
      didChange = true;
      revalidateTag(`${handle}-videos`);
    } catch (e) {
      console.error(`YouTube video request for '${handle}' failed.`, e);
      failed.push(handle);
    }
  }

  if (didChange) VIDEO_LIST_TAGS.forEach((tag) => revalidateTag(tag));
  if (failed.length) throw new Error(`Failed for: ${failed.join(", ")}`);
}
