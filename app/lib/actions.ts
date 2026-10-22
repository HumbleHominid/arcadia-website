import { fetchMembers, fetchVideosForMemberHandle } from "@/app/lib/data";
import { getCachedMembers } from "@/app/lib/cache-methods";
import { getYouTube } from "@/app/lib/google";
import { FilterType } from "@/app/lib/definitions";
import { sql } from "@vercel/postgres";
import { createPosts } from "@/app/lib/socials/social-poster";
import { SocialHandler } from "@/app/lib/socials/social-handler";
import { revalidateTag } from "next/cache";

// Tags used by getCachedVideos for each home page filter
const VIDEO_LIST_TAGS = [FilterType.All, FilterType.Arcadia, "Latest"].map(
  (filter) => `${filter}-videos`,
);

type CreateVideoData = {
  title: string;
  video_id: string;
  publish_date: string;
  duration: string;
  uploader_id: string;
  is_arcadia_video: boolean;
  description: string;
  thumbnail_uri: string;
  handle: string;
};

export async function createVideo(video: CreateVideoData) {
  try {
    await sql`
			INSERT INTO Videos(member_id, title, video_id, publish_date, is_arcadia_video, duration)
				SELECT m.id, ${video.title}, ${video.video_id}, ${video.publish_date}, ${video.is_arcadia_video}, ${video.duration}
				FROM Members m
				WHERE m.yt_id = ${video.uploader_id}
				AND NOT EXISTS (SELECT 1 FROM Videos v WHERE v.video_id = ${video.video_id});
		`;
    revalidateTag(`${video.handle}-videos`);
  } catch (err) {
    console.error("Database Error:", err);
  }
}

async function insertMemberYouTubeSocial(handle: string) {
  try {
    const url = `https://www.youtube.com/${handle}`;
    await sql`
			INSERT INTO Socials (member_id, social_type_id, url)
				SELECT m.id, st.id, ${url}
				FROM Members m, SocialTypes st
				WHERE m.handle = ${handle}
				AND st.name = 'YouTube'
				AND NOT EXISTS (SELECT 1 FROM Socials s WHERE s.url = ${url})
		`;
  } catch (e) {
    console.error(`Failed to insert YouTube Social for member '${handle}'`, e);
  }
}

async function updateMemberYouTubeSocial(yt_id: string, handle: string) {
  try {
    const url = `https://www.youtube.com/${handle}`;
    await sql`
			UPDATE Socials
				SET url = ${url}
				WHERE member_id = (SELECT id FROM Members WHERE yt_id = ${yt_id})
					AND social_type_id = (SELECT id FROM SocialTypes WHERE name = 'YouTube')
		`;
  } catch (e) {
    console.error(`Failed to update YouTube Social for member '${handle}'`, e);
  }
}

async function deleteVideoByVidId(vid_id: string) {
  try {
    await sql`
			DELETE FROM Videos
				WHERE video_id = ${vid_id}
		`;
  } catch (e) {
    console.error(`Failed to delete video with id '${vid_id}'`, e);
  }
}

export async function updateDbVideos() {
  console.log("Updating DB Videos...");
  const members = await getCachedMembers();
  const api = getYouTube();
  const sh = new SocialHandler();
  let didUpdate = false;

  for (const member of members) {
    // Dedupe is by handle; without one we'd re-post every run
    if (!member.uploads_playlist || !member.handle) continue;
    try {
      const playlistRes = await api.playlistItems.list({
        part: ["snippet"],
        playlistId: member.uploads_playlist,
        maxResults: 5,
      });
      const vidIdsInDb = (await fetchVideosForMemberHandle(member.handle)).map(
        (vid) => vid.video_id,
      );
      const vidsToRequest = (playlistRes.data.items ?? [])
        .map((item) => item.snippet?.resourceId?.videoId)
        .filter((id): id is string => !!id && !vidIdsInDb.includes(id));

      if (vidsToRequest.length === 0) continue;
      console.log(
        `Found ${vidsToRequest.length} new videos for member '${member.handle}'\n`,
        vidsToRequest,
      );

      const vidsRes = await api.videos.list({
        part: ["snippet,contentDetails"],
        id: vidsToRequest,
      });
      const vids = vidsRes.data.items ?? [];
      if (vids.length === 0) continue;
      console.log(
        `Fetched details for ${vids.length} videos from YouTube GCP for member '${member.handle}'\n`,
        vids.map((vid) => vid.id),
      );

      const formattedVids: Array<CreateVideoData> = vids.flatMap((vid) => {
        if (!vid.snippet) return [];
        const { snippet } = vid;
        const id = vid.id ?? "";
        return [
          {
            title: snippet.title ?? "",
            video_id: id,
            publish_date: snippet.publishedAt ?? "",
            uploader_id: snippet.channelId ?? "",
            is_arcadia_video: !!snippet.tags?.some((tag) =>
              tag.toLowerCase().includes("arcadia"),
            ),
            duration: vid.contentDetails?.duration || "PT0S",
            description: snippet.description ?? "",
            thumbnail_uri:
              snippet.thumbnails?.standard?.url ||
              `https://i.ytimg.com/vi/${id}/hqdefault.jpg`,
            handle: member.handle,
          },
        ];
      });

      // Seconds-only duration (< 1 min) is likely a short; only post non-short Arcadia videos
      const vidsToPost = formattedVids.filter(
        (vid) => vid.is_arcadia_video && !/^PT\d+S$/.test(vid.duration),
      );
      await Promise.all([
        ...vidsToPost.map((vid) =>
          createPosts(
            {
              video_title: vid.title,
              video_id: vid.video_id,
              yt_handle: member.handle,
              description: vid.description,
              thumbnail_uri: vid.thumbnail_uri,
            },
            sh,
          ),
        ),
        ...formattedVids.map(createVideo),
      ]);

      didUpdate = true;
    } catch (e) {
      console.error(
        `YouTube playlist or video request for '${member.yt_id}' failed.`,
        e,
      );
      throw e;
    }
  }

  if (didUpdate) VIDEO_LIST_TAGS.forEach((tag) => revalidateTag(tag));
}

export async function updateDbMembers() {
  const members = await fetchMembers();
  const api = getYouTube();

  for (const member of members) {
    try {
      const res = await api.channels.list({
        part: ["snippet,contentDetails"],
        id: [member.yt_id],
      });

      const ytMember = res.data.items?.[0];
      const snippet = ytMember?.snippet;
      const contentDetails = ytMember?.contentDetails;
      if (!snippet || !contentDetails) continue;
      const handle = snippet.customUrl || null;
      // COALESCE keeps the current value when YouTube returns nothing (matches the old truthiness checks)
      await sql`
				UPDATE Members SET
					handle = COALESCE(${handle}, handle),
					name = COALESCE(${snippet.title || null}, name),
					yt_pfp_url = COALESCE(${snippet.thumbnails?.default?.url || null}, yt_pfp_url),
					uploads_playlist = COALESCE(${contentDetails.relatedPlaylists?.uploads || null}, uploads_playlist),
					description = COALESCE(${snippet.description || null}, description)
				WHERE yt_id = ${member.yt_id}
			`;
      // member.handle is the pre-update value: no handle before -> insert the YouTube social, else update it
      if (handle && handle !== member.handle) {
        if (member.handle)
          await updateMemberYouTubeSocial(member.yt_id, handle);
        else await insertMemberYouTubeSocial(handle);
        revalidateTag(`${handle}-member`);
        revalidateTag(`${handle}-socials`);
      }
      if (member.handle) revalidateTag(`${member.handle}-member`); // member pages were stale up to 24h
      revalidateTag("members");
    } catch (e) {
      console.log(`YouTube Channel request for '${member.yt_id}' failed.`, e);
      throw e;
    }
  }
}

export async function updateDeletedVideos() {
  const members = await fetchMembers();
  const memberVids = await Promise.all(
    members.map((m) => fetchVideosForMemberHandle(m.handle)),
  );
  const api = getYouTube();
  let didDelete = false;

  for (const [i, member] of members.entries()) {
    const vidIds = memberVids[i].map((vid) => vid.video_id);
    if (vidIds.length === 0) continue; // videos.list with no ids 400s and would abort the cron
    try {
      const vidRes = await api.videos.list({
        part: ["snippet"],
        id: vidIds,
      });
      if (!vidRes.data.items?.length) continue; // never wipe a member on an empty response
      const validVids = vidRes.data.items.map((item) => item.id);
      // In the DB but not returned by YouTube: deleted or set to private
      for (const vidId of vidIds) {
        if (validVids.includes(vidId)) continue;
        await deleteVideoByVidId(vidId);
        didDelete = true;
        revalidateTag(`${member.handle}-videos`);
      }
    } catch (e) {
      console.error(
        `YouTube playlist or video request for '${member.handle}' failed.`,
        e,
      );
      throw e;
    }
  }

  if (didDelete) VIDEO_LIST_TAGS.forEach((tag) => revalidateTag(tag));
}
