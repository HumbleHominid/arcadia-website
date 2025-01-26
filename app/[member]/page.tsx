import { fetchSocialsForMember } from "../lib/data";
import CollapseableList from "../ui/collapseable-list"
import PageLayout from "@/app/ui/page-layout"

export default async function Page({
	params
}:{
	params: Promise<{member: string}>
}) {
	const socials = (await fetchSocialsForMember((await params).member))
		.map((social) => {
			return {
				src: "/images/link.svg",
				url: social.url,
				text: social.type
			}
		});
	return (
		<PageLayout>
			{/* Social Section */}
			<div className="w-full md:w-4/12">
				<CollapseableList data={socials} title="Socials" />
			</div>
			{/* Video Section */}
			<div className="w-full">
				{/* Member Name */}
				<h1 className="text-5xl">{(await params).member}</h1>
			</div>
		</PageLayout>
	)
}