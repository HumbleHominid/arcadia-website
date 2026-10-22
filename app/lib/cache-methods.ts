import { unstable_cache } from "next/cache";
import {
  fetchMembers,
  fetchVideos,
  fetchLatestVideos,
  fetchVideosForMemberHandle,
  fetchSocialsForMemberHandle,
} from "@/app/lib/data";
import { FilterType } from "@/app/lib/definitions";

// Every DB write in actions.ts revalidates its tags, so expiry is only a safety net.
// Each expiry costs a Neon wake-up (5+ minutes of compute), so keep it long.
const DAY = 7 * 24 * 60 * 60;

export const getCachedMembers = unstable_cache(fetchMembers, ["members"], {
  revalidate: DAY,
  tags: ["members"],
});

// FilterType.Latest is "", so map it to a non-empty tag; actions.ts revalidates these
export const videoListTag = (filter: FilterType) =>
  `${filter || "latest"}-videos`;

// Tags are per-argument (revalidated per filter/handle), so these build a cache per call.
export const getCachedVideos = (filter: FilterType) =>
  unstable_cache(
    async () =>
      filter === FilterType.Latest
        ? fetchLatestVideos()
        : fetchVideos(filter === FilterType.Arcadia),
    [videoListTag(filter)], // closure takes no args, so filter must be in keyParts
    { revalidate: DAY, tags: [videoListTag(filter)] },
  )();

export const getCachedVideosForMemberHandle = (handle: string) =>
  unstable_cache(fetchVideosForMemberHandle, [], {
    revalidate: DAY,
    tags: [`${handle}-videos`],
  })(handle);

export const getCachedSocialsForMemberHandle = (handle: string) =>
  unstable_cache(fetchSocialsForMemberHandle, [], {
    revalidate: DAY,
    tags: [`${handle}-socials`],
  })(handle);
