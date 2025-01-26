import { fetchMembers, fetchAllVideos, fetchArcadiaVideos, fetchLatestVideos } from "@/app/lib/data";
import CollapseableList from "@/app/ui/collapseable-list/collapseable-list";
import VideoList from "@/app/ui/video-list";
import PageLayout from "@/app/ui/page-layout";
import { Suspense } from "react";
import MembersList from "@/app/ui/collapseable-list/members-list";
import VideoListSkeleton from "@/app/ui/skeletons/video-list-skeleton";
import { FilterType } from "@/app/lib/definitions";
import { Metadata } from "next";
import VideoFilter from "@/app/ui/video-filter/video-filter";
import { Video } from "@/app/lib/definitions";

type Props = {
  params: Promise<{filter: FilterType}>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const resolvedParams = await params;
  const filter = resolvedParams.filter === undefined ? "Latest" : resolvedParams.filter[0];
  const capitalized = filter.charAt(0).toUpperCase() + filter.slice(1);
  return {
    title: capitalized
  }
}

export default async function Page({ params }: Props) {
  const resolvedParams = await params;
  const filter = resolvedParams.filter === undefined ? FilterType.Latest : resolvedParams.filter[0];

  const fetchVideos = (filter: string): Promise<Array<Video>> => {
		switch (filter) {
			case FilterType.All:
				return fetchAllVideos();
			case FilterType.Arcadia:
				return fetchArcadiaVideos();
      // Fallthrough intended
      case FilterType.Latest:
      default:
        return fetchLatestVideos();
		}
	}

  const members = fetchMembers();
  const videos = fetchVideos(filter);
  const community = [
    {src: "/images/twitter_icon.png", url: "https://x.com/Arcadia_SMP", text: "Twitter/X"},
    {src: "/images/bluesky_icon.svg", url: "https://bsky.app/profile/arcadiasmp.bsky.social", text: "Bluesky"},
    {src: "/images/discord-mark-blue.svg", url: "https://discord.gg/btwNnKtWQu", text: "Discord"},
  ];
  const server = [
    {src: "/images/arrow-down-tray.svg", url: "https://www.mediafire.com/file/an45poqm8p6ldc3/arcadia-smp-season1-v1.zip/file", text: "Season 1 World Download"},
    {src: "/images/moddermore-positive.png", url: "https://moddermore.net/list/8a52816c90", text: "Server Mods"},
  ];
  return (
    <PageLayout>
      {/* Member and Server Info */}
      <div className="flex flex-col gap-1 w-full md:w-4/12">
        <Suspense fallback={<CollapseableList title="Members" />}>
          <MembersList members={members}/>
        </Suspense>
        <CollapseableList data={community} title="Community" />
        <CollapseableList data={server} title="Server Stuff" />
      </div>
      {/* Video section */}
      <div className="w-full flex flex-col items-center bg-white rounded-sm drop-shadow-sm md:drop-shadow-xl text-lg">
        {/* Need a context switcher */}
        <VideoFilter />
        {/* List of videos */}
        <Suspense fallback={<VideoListSkeleton />}>
          <VideoList videos={videos} />
        </Suspense>
      </div>
    </PageLayout>
  );
}
