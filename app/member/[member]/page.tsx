import PageLayout from "@/app/ui/page-layout";
import VideoList from "@/app/ui/video-list";
import { Metadata } from "next";
import { Suspense } from "react";
import { notFound } from "next/navigation";
import SocialsList from "@/app/ui/collapsable-list/socials-list";
import CollapsableList from "@/app/ui/collapsable-list/collapsable-list";
import VideoListSkeleton from "@/app/ui/skeletons/video-list-skeleton";
import MemberDesc from "@/app/member/[member]/member-desc";
import {
  getCachedVideosForMemberHandle,
  getCachedSocialsForMemberHandle,
  getCachedMembers,
} from "@/app/lib/cache-methods";

type Props = {
  params: Promise<{ member: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const handle = (await params).member.replace("%40", "@");
  const member = (await getCachedMembers()).find((m) => m.handle === handle);
  return { title: member?.name ?? "Arcadian" };
}

export default async function Page({ params }: Props) {
  // decodeURI doesn't consider that @ was encoded so we have to do this
  const handle = (await params).member.replace("%40", "@");
  // Unknown handles 404 before any per-handle query, so crawlers can't create cache misses
  const member = (await getCachedMembers()).find((m) => m.handle === handle);
  if (!member) notFound();
  const socials = getCachedSocialsForMemberHandle(handle);
  const videos = getCachedVideosForMemberHandle(handle);

  return (
    <PageLayout>
      {/* Social Section */}
      <div className="flex w-full flex-col gap-1 md:w-4/12">
        <MemberDesc member={member} />
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
