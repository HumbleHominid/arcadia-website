import { fetchMembers, fetchVideoIdsByMember, sql } from "@/app/lib/data";
import {
  getCachedMembers,
  getCachedSocialsForMemberHandle,
  getCachedVideosForMemberHandle,
  videoListTag,
} from "@/app/lib/cache-methods";
import { youtube } from "@/app/lib/google";
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
  description: string;
  thumbnail_uri: string;
};

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
        part: "snippet,contentDetails",
        id: vidsToRequest.join(","),
      });
      const vids = vidsRes.items ?? [];
      if (vids.length === 0) continue;
      console.log(
        `Fetched details for ${vids.length} videos from YouTube GCP for member '${member.handle}'\n`,
        vids.map((vid) => vid.id),
      );

      const formattedVids: Array<CreateVideoData> = vids.flatMap((vid) => {
        const { snippet } = vid;
        // publish_date is a timestamptz, so a video without one can't be stored
        if (!snippet?.publishedAt) return [];
        const id = vid.id ?? "";
        return [
          {
            title: snippet.title ?? "",
            video_id: id,
            publish_date: snippet.publishedAt,
            is_arcadia_video: !!snippet.tags?.some((tag) =>
              tag.toLowerCase().includes("arcadia"),
            ),
            duration: vid.contentDetails?.duration || "PT0S",
            description: snippet.description ?? "",
            thumbnail_uri:
              snippet.thumbnails?.standard?.url ||
              `https://i.ytimg.com/vi/${id}/hqdefault.jpg`,
          },
        ];
      });

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
              {
                video_title: vid.title,
                video_id: vid.video_id,
                description: vid.description,
                thumbnail_uri: vid.thumbnail_uri,
              },
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
      const snippet = ytMember?.snippet;
      const contentDetails = ytMember?.contentDetails;
      if (!snippet || !contentDetails) continue;
      const handle = snippet.customUrl || null;
      // Keep the current value when YouTube returns nothing
      const next = {
        handle: handle ?? member.handle,
        name: snippet.title || member.name,
        yt_pfp_url: snippet.thumbnails?.default?.url || member.yt_pfp_url,
        uploads_playlist:
          contentDetails.relatedPlaylists?.uploads || member.uploads_playlist,
        description: snippet.description || member.description,
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
      revalidateTag("members");
    } catch (e) {
      console.error(`YouTube Channel request for '${member.yt_id}' failed.`, e);
      failed.push(member.yt_id);
    }
  }

  if (failed.length) throw new Error(`Failed for: ${failed.join(", ")}`);
}

export async function updateDeletedVideos() {
  // One uncached read of every stored ID (the cached per-member lists stop at 50).
  // Daily, so it shares the wake-up with update-members. Members with no videos aren't listed.
  const members = await fetchVideoIdsByMember();
  let didDelete = false;
  const failed: string[] = [];

  for (const { handle, video_ids } of members) {
    try {
      const valid = new Set<string>();
      // videos.list takes at most 50 IDs per request
      for (let i = 0; i < video_ids.length; i += 50) {
        const res = await youtube("videos", {
          part: "id",
          id: video_ids.slice(i, i + 50).join(","),
        });
        res.items?.forEach((item) => item.id && valid.add(item.id));
      }
      if (valid.size === 0) continue; // never wipe a member on an empty response
      // In the DB but not returned by YouTube: deleted or set to private
      const gone = video_ids.filter((id) => !valid.has(id));
      if (gone.length === 0) continue;
      await sql`DELETE FROM Videos WHERE video_id = ANY(${gone}::text[])`;
      didDelete = true;
      revalidateTag(`${handle}-videos`);
    } catch (e) {
      console.error(`YouTube video request for '${handle}' failed.`, e);
      failed.push(handle);
    }
  }

  if (didDelete) VIDEO_LIST_TAGS.forEach((tag) => revalidateTag(tag));
  if (failed.length) throw new Error(`Failed for: ${failed.join(", ")}`);
}
