import { fetchSocialsForMember, fetchVideosForMember } from "@/app/lib/data";
import PageLayout from "@/app/ui/page-layout"
import VideoList from "@/app/ui/video-list";
import { Metadata } from "next";
import { Suspense } from "react";
import SocialsList from "@/app/ui/collapseable-list/socials-list";
import CollapseableList from "@/app/ui/collapseable-list/collapseable-list";
import VideoListSkeleton from "@/app/ui/skeletons/video-list-skeleton";
import { unstable_cache } from "next/cache";

type Props = {
	params: Promise<{member: string}>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
	return {
		title: decodeURI((await params).member)
	}
}

export default async function Page({ params }: Props) {
	const member = decodeURI((await params).member);
	const getCachedSocialsForMember = unstable_cache(
		async (member: string) => {
			return fetchSocialsForMember(member);
		},
		[`${member}-socials`],
		{ revalidate: 60 * 60, tags: [`${member}-socials`]}
	);
	const getCachedVideosForMember = unstable_cache(
		async (member: string) => {
			return fetchVideosForMember(member);
		},
		[`${member}-videos`],
		{ revalidate: 10 * 60, tags: [`${member}-videos`]}
	);

	const socials = getCachedSocialsForMember(member);
	const videos = getCachedVideosForMember(member);
	return (
		<PageLayout>
			{/* Social Section */}
			<div className="w-full md:w-4/12">
			<Suspense fallback={<CollapseableList title="Socials" />}>
				<SocialsList socials={socials} />
			</Suspense>
			</div>
			{/* Video Section */}
			<div className="w-full h-min bg-white rounded-sm drop-shadow-sm md:drop-shadow-xl">
				{/* TODO: Make skeleton for the suspense */}
				<Suspense fallback={<VideoListSkeleton />}>
					<VideoList videos={videos} />
				</Suspense>
			</div>
		</PageLayout>
	)
}