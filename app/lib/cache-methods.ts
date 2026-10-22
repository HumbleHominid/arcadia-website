import { unstable_cache } from "next/cache";
import {
  fetchMembers,
  fetchVideos,
  fetchLatestVideos,
  fetchVideosForMemberHandle,
  fetchMemberByHandle,
  fetchSocialsForMemberHandle,
} from "@/app/lib/data";
import { FilterType } from "@/app/lib/definitions";

const DAY = 24 * 60 * 60; // caches go stale after 24h

export const getCachedMembers = unstable_cache(fetchMembers, ["members"], {
  revalidate: DAY,
  tags: ["members"],
});

// Tags are per-argument (revalidated per filter/handle), so these build a cache per call.
export const getCachedVideos = (filter: string) =>
  unstable_cache(
    async () =>
      filter === "Latest"
        ? fetchLatestVideos()
        : fetchVideos(filter === FilterType.Arcadia),
    [`${filter}-videos`], // closure takes no args, so filter must be in keyParts
    { revalidate: DAY, tags: [`${filter}-videos`] },
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

export const getCachedMemberByHandle = (handle: string) =>
  unstable_cache(fetchMemberByHandle, [], {
    revalidate: DAY,
    tags: [`${handle}-member`],
  })(handle);
