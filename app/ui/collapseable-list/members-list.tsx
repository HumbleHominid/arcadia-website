'use client';

import { MembersTable } from "@/app/lib/definitions";
import { use } from "react";
import CollapseableList from "@/app/ui/collapseable-list/collapseable-list";

export default function MembersList({
	members = new Promise(()=>[]),
}: {
	members?: Promise<Array<MembersTable>>;
}) {
	const allMembers = use(members)
		.map((member) => {
			return {
				src: '/images/user.svg',
				url: `/${member.name}`,
				text: member.name
			}
		});
	return (
		<CollapseableList data={allMembers} title="Members" />
	);
}