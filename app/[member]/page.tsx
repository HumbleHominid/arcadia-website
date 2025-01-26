import { fetchSocialsForMember, fetchVideosForMember } from "@/app/lib/data";
import CollapseableList from "../ui/collapseable-list"
import PageLayout from "@/app/ui/page-layout"
import VideoList from "@/app/ui/video-list";

export default async function Page({
	params
}:{
	params: Promise<{member: string}>
}) {
	const member = (await params).member;
	// TODO Make not slow
	const socials = (await fetchSocialsForMember(member))
		.map((social) => {
			return {
				src: "/images/link.svg",
				url: social.url,
				text: social.type
			}
		});
		const videos = await fetchVideosForMember(member);
	return (
		<PageLayout>
			{/* Social Section */}
			<div className="w-full md:w-4/12">
				<CollapseableList data={socials} title="Socials" />
			</div>
			{/* Video Section */}
			<div className="w-full">
				<VideoList videos={videos} />
			</div>
		</PageLayout>
	)
}