'use client';

import { Social } from "@/app/lib/definitions";
import { use } from "react";
import CollapseableList from "@/app/ui/collapseable-list/collapseable-list";

export default function SocialsList({
	socials = new Promise(()=>[]),
}: {
	socials?: Promise<Array<Social>>;
}) {
	const allSocials = use(socials)
		.map((social) => {
			return {
				src: "/images/link.svg",
				url: social.url,
				text: social.type
			}
		});
	return (
		<CollapseableList data={allSocials} title="Socials" />
	);
}