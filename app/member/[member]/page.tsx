import { fetchSocialsForMember, fetchVideosForMember } from "@/app/lib/data";
import PageLayout from "@/app/ui/page-layout"
import VideoList from "@/app/ui/video-list";
import { Metadata } from "next";
import { Suspense } from "react";
import SocialsList from "@/app/ui/collapseable-list/socials-list";
import CollapseableList from "@/app/ui/collapseable-list/collapseable-list";
import VideoListSkeleton from "@/app/ui/skeletons/video-list-skeleton";

type Props = {
	params: Promise<{member: string}>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
	return {
		title: (await params).member
	}
}

export default async function Page({ params }: Props) {
	const member = (await params).member;
	const socials = fetchSocialsForMember(member);
	const videos = fetchVideosForMember(member);
	return (
		<PageLayout>
			{/* Social Section */}
			<div className="w-full md:w-4/12">
			<Suspense fallback={<CollapseableList title="Socials" />}>
				<SocialsList socials={socials} />
			</Suspense>
			</div>
			{/* Video Section */}
			<div className="w-full bg-white rounded-sm drop-shadow-sm md:drop-shadow-xl">
				{/* TODO: Make skeleton for the suspense */}
				<Suspense fallback={<VideoListSkeleton />}>
					<VideoList videos={videos} />
				</Suspense>
			</div>
		</PageLayout>
	)
}