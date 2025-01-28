import { fetchMemberByHandle, fetchSocialsForMemberHandle, fetchVideosForMemberHandle } from "@/app/lib/data";
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
	const handle = (await params).member.replace('%40', '@');
	const member = await fetchMemberByHandle(handle);
	return {
		title: member[0] ? member[0].name : 'Arcadian'
	}
}

export default async function Page({ params }: Props) {
	// decodeURI doesn't consider that @ was encoded so we have to do this
	const handle = (await params).member.replace('%40', '@');
	const getCachedSocialsForMemberHandle = unstable_cache(
		async (handle: string) => {
			return fetchSocialsForMemberHandle(handle);
		},
		[`${handle}-socials`],
		{ revalidate: 0.25 * 60, tags: [`${handle}-socials`]}
	);
	const getCachedVideosForMember = unstable_cache(
		async (handle: string) => {
			return fetchVideosForMemberHandle(handle);
		},
		[`${handle}-videos`],
		{ revalidate: 10 * 60, tags: [`${handle}-videos`]}
	);

	const socials = getCachedSocialsForMemberHandle(handle);
	const videos = getCachedVideosForMember(handle);
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