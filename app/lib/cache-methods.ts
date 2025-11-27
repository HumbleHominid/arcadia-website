import { unstable_cache } from "next/cache";
import {
  fetchMembers,
  fetchAllVideos,
  fetchArcadiaVideos,
  fetchLatestVideos,
  fetchMembersYouTube,
} from "@/app/lib/data";
import { FilterType } from "@/app/lib/definitions";

export const getCachedMembers = function () {
  return unstable_cache(
    async () => {
      console.log("Fetching members");
      return await fetchMembers();
    },
    ["members"],
    { revalidate: 24 * 60 * 60, tags: ["members"] }, // Make the member's cache stale after 24h
  )();
};

export const getCachedMembersYouTube = function () {
  return unstable_cache(
    async () => {
      console.log("Fetching members' YouTube");
      return await fetchMembersYouTube();
    },
    ["membersYouTube"],
    { revalidate: 24 * 60 * 60, tags: ["membersYouTube"] }, // Make the member's cache stale after 24h
  )();
};

export const getCachedVideos = function (filter: string) {
  return unstable_cache(
    async (filter: string) => {
      console.log(`Fetching videos with filter: '${filter}'`);
      switch (filter) {
        case FilterType.All:
          return await fetchAllVideos();
        case FilterType.Arcadia:
          return await fetchArcadiaVideos();
        // Fallthrough intended
        case FilterType.Latest:
        default:
          return await fetchLatestVideos();
      }
    },
    [`${filter}-videos`],
    { revalidate: 24 * 60 * 60, tags: [`${filter}-videos`] },
  )(filter);
};

export const getCachedLatestVideos = function () {
  return unstable_cache(
    async () => {
      console.log("Fetching latest videos");
      return await fetchLatestVideos();
    },
    ["update-db-videos"],
    { revalidate: 24 * 60 * 60, tags: ["update-db-videos"] }, // Make the latest videos cache stale after 24h
  )();
};
