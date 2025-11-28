import {
  fetchMemberByHandle,
  fetchSocialsForMemberHandle,
} from "@/app/lib/data";
import PageLayout from "@/app/ui/page-layout";
import VideoList from "@/app/ui/video-list";
import { Metadata } from "next";
import { Suspense } from "react";
import SocialsList from "@/app/ui/collapsable-list/socials-list";
import CollapsableList from "@/app/ui/collapsable-list/collapsable-list";
import VideoListSkeleton from "@/app/ui/skeletons/video-list-skeleton";
import MemberDesc from "@/app/member/[member]/member-desc";
import {
  getCachedVideosForMemberHandle,
  getCachedMemberDetails,
  getCachedSocialsForMemberHandle,
  getCachedMemberByHandle,
} from "@/app/lib/cache-methods";

type Props = {
  params: Promise<{ member: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const handle = (await params).member.replace("%40", "@");
  const member = await getCachedMemberByHandle(handle);
  return {
    title: member[0] ? member[0].name : "Arcadian",
  };
}

export default async function Page({ params }: Props) {
  // decodeURI doesn't consider that @ was encoded so we have to do this
  const handle = (await params).member.replace("%40", "@");
  const socials = getCachedSocialsForMemberHandle(handle);
  const videos = getCachedVideosForMemberHandle(handle);
  const members = getCachedMemberDetails(handle);

  return (
    <PageLayout>
      {/* Social Section */}
      <div className="flex w-full flex-col gap-1 md:w-4/12">
        <Suspense fallback={null}>
          <MemberDesc members={members} />
        </Suspense>
        <Suspense fallback={<CollapsableList title="Socials" />}>
          <SocialsList socials={socials} />
        </Suspense>
      </div>
      {/* Video Section */}
      <div className="h-min w-full rounded-sm bg-white drop-shadow-sm md:drop-shadow-xl">
        <Suspense fallback={<VideoListSkeleton />}>
          <VideoList videos={videos} />
        </Suspense>
      </div>
    </PageLayout>
  );
}
