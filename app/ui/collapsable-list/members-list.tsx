"use client";

import { Member } from "@/app/lib/definitions";
import { use } from "react";
import CollapsableList from "@/app/ui/collapsable-list/collapsable-list";

export default function MembersList({
  members,
}: {
  members: Promise<Array<Member>>;
}) {
  const allMembers = use(members).map((member) => ({
    src: member.yt_pfp_url || "/icons/user.svg",
    url: `/member/${member.handle}`,
    text: member.name,
  }));
  return <CollapsableList data={allMembers} title="Members" />;
}
