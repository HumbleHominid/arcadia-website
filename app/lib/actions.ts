"use server";

import {
  fetchLatestVideos,
  fetchMembers,
  fetchVideosForMemberHandle,
} from "@/app/lib/data";
import { getYouTube } from "@/app/lib/google";
import { Member, Video } from "@/app/lib/definitions";
import { sql } from "@vercel/postgres";
import { youtube_v3 } from "googleapis";
import { createPosts } from "@/app/lib/socials/social-poster";
import { SocialHandler } from "./socials/social-handler";

type CreateVideoData = {
  title: string;
  video_id: string;
  publish_date: string;
  duration: string;
  uploader_id: string;
  is_arcadia_video: boolean;
  description: string;
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
  } catch (err) {
    console.error("Database Error:", err);
  }
}

async function updateMemberPfp(yt_id: string, pfp: string) {
  try {
    await sql`
			UPDATE Members
				SET yt_pfp_url = ${pfp}
				WHERE yt_id = ${yt_id};
		`;
  } catch (e) {
    console.error(`Failed to update pfp for member ${yt_id}`, e);
  }
}

async function updateMemberName(yt_id: string, name: string) {
  try {
    await sql`
			UPDATE Members
				SET name = ${name}
				WHERE yt_id = ${yt_id};
		`;
  } catch (e) {
    console.error(`Failed to update pfp for member ${yt_id}`, e);
  }
}

async function updateMemberHandle(yt_id: string, handle: string) {
  try {
    await sql`
			UPDATE Members
				SET handle = ${handle}
				WHERE yt_id = ${yt_id};
		`;
  } catch (e) {
    console.error(`Failed to update pfp for member ${yt_id}`, e);
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

async function updateMemberYouTubeSocial(member_id: string, handle: string) {
  try {
    const url = `https://www.youtube.com/${handle}`;
    await sql`
			UPDATE Socials
				SET url = ${url}
				WHERE id = (SELECT id FROM Members WHERE yt_id = ${member_id})
		`;
  } catch (e) {
    console.error(`Failed to update YouTube Social for member '${handle}'`, e);
  }
}

async function updateMemberUploadsPlaylist(
  yt_id: string,
  uploads_playlist: string
) {
  try {
    await sql`
			UPDATE Members
				SET uploads_playlist = ${uploads_playlist}
				WHERE yt_id = ${yt_id}
		`;
  } catch (e) {
    console.error(`Failed to update uploads_playlist for member '${yt_id}'`, e);
  }
}

async function updateMemberDescription(yt_id: string, description: string) {
  try {
    await sql`
			UPDATE Members
				SET description = ${description}
				WHERE yt_id = ${yt_id}
		`;
  } catch (e) {
    console.error(`Failed to update description for member '${yt_id}'`, e);
  }
}

async function deleteVideoByVidId(vid_id: string) {
  try {
    await sql`
			DELETE FROM Videos
				WHERE video_id = ${vid_id}
		`;
  } catch (e) {
    console.error(`Failed to delete video with id ${vid_id}'`, e);
  }
}

export async function updateDbVideos() {
  // Get list of members
  const members: Array<Member> = [];
  try {
    members.push(...(await fetchMembers()));
  } catch (e) {
    console.error("fetchMembers failure:", e);
    return;
  }
  // Get latest video for each member
  const latestVideos: Array<Video> = [];
  try {
    latestVideos.push(...(await fetchLatestVideos()));
  } catch (e) {
    console.error("fetchLatestVideos failure:", e);
    return;
  }
  let api: youtube_v3.Youtube;
  try {
    api = getYouTube();
  } catch (e) {
    console.error("failed to get YouTube api", e);
    throw e;
  }
  // Create a social handler for posting new videos if we need to.
  const sh = new SocialHandler();

  for (let i = 0; i < members.length; ++i) {
    const member = members[i];
    if (!member.uploads_playlist) continue;
    // Get the 10 most recent videos from YouTube
    try {
      const playlistRes = await api.playlistItems.list({
        part: ["snippet"],
        playlistId: member.uploads_playlist,
        maxResults: 10,
      });

      if (!playlistRes.data.items || playlistRes.data.items.length === 0)
        continue;
      const playlistVids = playlistRes.data.items;
      const vidFilter = latestVideos.filter(
        (vid) => vid.uploader_id === member.yt_id
      );

      // List of vid ids we have to further request because we want some info we don't have
      const vidsToRequest: Array<string> = [];
      for (let j = 0; j < playlistVids.length; ++j) {
        const vidId = playlistVids[j].snippet?.resourceId?.videoId;
        if (!vidId) continue;
        if (vidFilter.length !== 0 && vidFilter[0].video_id === vidId) break;

        vidsToRequest.push(vidId);
      }

      if (vidsToRequest.length === 0) continue;

      const vidsRes = await api.videos.list({
        part: ["snippet,contentDetails"],
        id: vidsToRequest,
      });

      if (!vidsRes.data.items || vidsRes.data.items.length === 0) continue;
      const vids = vidsRes.data.items;
      const formattedVids: Array<CreateVideoData> = [];
      // Get a list of the videos we have record of in the db
      const memberVidsInDb = await fetchVideosForMemberHandle(member.handle);
      const vidIdsInDb = memberVidsInDb.map((vid) => vid.video_id);
      vids.forEach((vid) => {
        const snippet = vid.snippet;
        if (!snippet) return;
        const valOrEmpty = (val: string | null | undefined) => {
          return val === undefined || val === null ? "" : val;
        };
        if (vidIdsInDb.includes(valOrEmpty(vid.id))) return;
        let is_arcadia_video = false;
        if (snippet.tags) {
          is_arcadia_video =
            snippet.tags.filter((tag) => tag.toLowerCase().includes("arcadia"))
              .length > 0;
        }
        let duration: string = "PT0H0H0S";
        if (vid.contentDetails?.duration) {
          duration = vid.contentDetails.duration;
        }
        formattedVids.push({
          title: valOrEmpty(snippet.title),
          video_id: valOrEmpty(vid.id),
          publish_date: valOrEmpty(snippet.publishedAt),
          uploader_id: valOrEmpty(snippet.channelId),
          is_arcadia_video: is_arcadia_video,
          duration: duration,
          description: valOrEmpty(snippet.description),
        });
      });

      const vidsToPost = formattedVids.filter((vid) => {
        const duration = vid.duration
          .replace("PT", "")
          .replace("P", "")
          .replace("D", ":")
          .replace("H", ":")
          .replace("M", ":")
          .replace("S", "")
          .split(":")
          .map((t) => {
            const s = "00" + t;
            return s.substring(s.length - 2);
          })
          .join(":")
          .replace(/^0+/, "");
        // If the video is less than a minute, it's likely a short
        const isShort = duration.split(":").length === 1;
        return !isShort && vid.is_arcadia_video;
      });

      // Only init if we know we are going to be posting videos to social media
      if (vidsToPost.length > 0 && !sh.isInitialized()) await sh.init();

      const createPostRequsets = vidsToPost.map((vid) =>
        createPosts(
          {
            video_title: vid.title,
            video_id: vid.video_id,
            yt_handle: member.handle,
            description: vid.description,
          },
          sh
        )
      );
      // Finally create the videos for this person
      const createVideoRequests = formattedVids.map((vid) => createVideo(vid));
      await Promise.all(createPostRequsets);
      await Promise.all(createVideoRequests);
    } catch (e) {
      console.error(
        `YouTube playlist or video request for '${member.yt_id} failed.`,
        e
      );
      throw e;
    }
  }
}

export async function updateDbMembers() {
  const members: Array<Member> = [];
  try {
    members.push(...(await fetchMembers()));
  } catch (e) {
    console.log("updateDbMembers: Failed to fetch members.", e);
    return;
  }
  let api: youtube_v3.Youtube;
  try {
    api = getYouTube();
  } catch (e) {
    console.error("failed to get YouTube api", e);
    throw e;
  }

  for (let i = 0; i < members.length; ++i) {
    const member = members[i];
    try {
      const res = await api.channels.list({
        part: ["snippet,contentDetails"],
        id: [member.yt_id],
      });

      if (!res.data.items || res.data.items.length === 0) continue;
      const ytMember = res.data.items[0];
      if (!ytMember.snippet) continue;
      const snippet = ytMember.snippet;
      if (!ytMember.contentDetails) continue;
      const contentDetails = ytMember.contentDetails;

      const updatePromises: Array<Promise<void>> = [];
      if (snippet.customUrl && member.handle !== snippet.customUrl) {
        // We await here because insert/update member YT social requires this
        await updateMemberHandle(member.yt_id, snippet.customUrl);
        // Also add/update this in the socials
        if (!member.handle) {
          updatePromises.push(insertMemberYouTubeSocial(snippet.customUrl));
        } else {
          updatePromises.push(
            updateMemberYouTubeSocial(member.yt_id, snippet.customUrl)
          );
        }
      }
      if (snippet.title && member.name !== snippet.title) {
        updatePromises.push(updateMemberName(member.yt_id, snippet.title));
      }
      if (
        snippet.thumbnails &&
        snippet.thumbnails.default &&
        snippet.thumbnails.default.url
      ) {
        if (member.yt_pfp_url !== snippet.thumbnails.default.url) {
          updatePromises.push(
            updateMemberPfp(member.yt_id, snippet.thumbnails.default.url)
          );
        }
      }
      if (
        contentDetails.relatedPlaylists?.uploads &&
        member.uploads_playlist !== contentDetails.relatedPlaylists.uploads
      ) {
        updatePromises.push(
          updateMemberUploadsPlaylist(
            member.yt_id,
            contentDetails.relatedPlaylists.uploads
          )
        );
      }
      if (snippet.description && member.description !== snippet.description) {
        updatePromises.push(
          updateMemberDescription(member.yt_id, snippet.description)
        );
      }
      await Promise.all(updatePromises);
    } catch (e) {
      console.log(`YouTube Channel request for '${member} failed.'`, e);
      throw e;
    }
  }
}

export async function updateDeletedVideos() {
  // Get list of members
  const members: Array<Member> = [];
  try {
    members.push(...(await fetchMembers()));
  } catch (e) {
    console.error("fetchMembersYouTube failure:", e);
    return;
  }
  // Get most recent videos for members
  const latestVideos: Map<string, Array<Video>> = new Map<
    string,
    Array<Video>
  >();
  const dbPromises = members.map(async (member) => {
    latestVideos.set(
      member.handle,
      await fetchVideosForMemberHandle(member.handle)
    );
  });
  await Promise.all(dbPromises);
  let api: youtube_v3.Youtube;
  try {
    api = getYouTube();
  } catch (e) {
    console.error("failed to get YouTube api", e);
    throw e;
  }

  for (let i = 0; i < members.length; ++i) {
    const member = members[i];
    if (!latestVideos.has(member.handle)) continue;
    const vidIds = latestVideos.get(member.handle)?.map((vid) => vid.video_id);
    if (!vidIds) continue;
    try {
      // Try to fetch all the videos for this member
      const vidRes = await api.videos.list({
        part: ["snippet"],
        id: vidIds,
      });
      if (!vidRes.data.items || vidRes.data.items.length === 0) continue;
      const validVids = vidRes.data.items.map((item) => item.id);
      // If the video we have in the db (vidIds) is not in the yt response (validVids)
      // it was either deleted or set to private. so delete it.
      for (let j = 0; j < vidIds.length; ++j) {
        const vidId = vidIds[j];
        if (!validVids.includes(vidId)) {
          await deleteVideoByVidId(vidId);
        }
      }
    } catch (e) {
      console.error(
        `YouTube playlist or video request for '${member.handle} failed.`,
        e
      );
      throw e;
    }
  }
}
