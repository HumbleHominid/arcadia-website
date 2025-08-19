import {
  fetchMembers,
  fetchAllVideos,
  fetchArcadiaVideos,
  fetchLatestVideos,
} from "@/app/lib/data";
import CollapsableList from "@/app/ui/collapsable-list/collapsable-list";
import VideoList from "@/app/ui/video-list";
import PageLayout from "@/app/ui/page-layout";
import { Suspense } from "react";
import MembersList from "@/app/ui/collapsable-list/members-list";
import VideoListSkeleton from "@/app/ui/skeletons/video-list-skeleton";
import { FilterType } from "@/app/lib/definitions";
import { Metadata } from "next";
import VideoFilter from "@/app/ui/video-filter/video-filter";
import { unstable_cache } from "next/cache";
import { notFound } from "next/navigation";
import Announcement from "@/app/ui/announcement";
import { externalSites as ES } from "@/app/lib/external-sites";

type Props = {
  params: Promise<{ filter: FilterType }>;
};

export const metadata: Metadata = {
  title: "Home",
};

export default async function Page({ params }: Props) {
  const resolvedParams = await params;
  const latest = "Latest";
  const filter =
    resolvedParams.filter === undefined ? "Latest" : resolvedParams.filter[0];
  const validFilters: string[] = [FilterType.All, FilterType.Arcadia, latest];
  if (!validFilters.includes(filter)) notFound();

  const getCachedMembers = unstable_cache(
    async () => {
      return await fetchMembers();
    },
    ["members"],
    { revalidate: 24 * 60 * 60, tags: ["members"] }, // Make the member's cache stale after 24h
  );
  const getCachedVideos = unstable_cache(
    async (filter: string) => {
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
    { revalidate: 10 * 60, tags: [`${filter}-videos`] },
  );

  // Try to update the DB with new videos
  const members = getCachedMembers();
  const videos = getCachedVideos(filter);
  const community = [
    {
      src: "/icons/twitter_icon.png",
      url: ES.twitter,
      text: "Arcadia_SMP",
    },
    {
      src: "/icons/bluesky_icon.svg",
      url: ES.bsky,
      text: "arcadiasmp.bsky.social",
    },
    {
      src: "/icons/discord-mark-blue.svg",
      url: ES.discord,
      text: "The Arcadians",
    },
  ];
  const server = [
    {
      src: "/icons/arrow-down-tray.svg",
      url: ES.seasonOneWorldDL,
      text: "Season 1 World Download",
    },
    {
      src: "/icons/arrow-down-tray.svg",
      url: ES.seasonTwoWorldDL,
      text: "Season 2 World Download",
    },
    {
      src: "/icons/moddermore-positive.png",
      url: ES.modList,
      text: "Server Mods",
    },
  ];
  return (
    <div className="flex flex-col gap-4">
      <Announcement />
      <PageLayout>
        {/* Member and Server Info */}
        <div className="flex w-full flex-col gap-1 md:w-4/12">
          <Suspense fallback={<CollapsableList title="Members" />}>
            <MembersList members={members} />
          </Suspense>
          <CollapsableList data={community} title="Community" />
          <CollapsableList data={server} title="Server Stuff" />
        </div>
        {/* Video section */}
        <div className="flex h-min w-full flex-col items-center rounded-sm bg-white text-lg drop-shadow-sm md:drop-shadow-xl">
          {/* Need a context switcher */}
          <VideoFilter />
          {/* List of videos */}
          <Suspense fallback={<VideoListSkeleton />}>
            <VideoList videos={videos} />
          </Suspense>
        </div>
      </PageLayout>
    </div>
  );
}
