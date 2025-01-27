'use client';

import { Member } from "@/app/lib/definitions";
import { use } from "react";
import CollapseableList from "@/app/ui/collapseable-list/collapseable-list";

export default function MembersList({
	members = new Promise(()=>[]),
}: {
	members?: Promise<Array<Member>>;
}) {
	const allMembers = use(members)
		.map((member) => {
			return {
				src: member.yt_pfp_url && member.yt_pfp_url !== '' ? member.yt_pfp_url : '/images/user.svg',
				url: `/member/${member.handle}`,
				text: member.name
			}
		});
	return (
		<CollapseableList data={allMembers} title="Members" />
	);
}