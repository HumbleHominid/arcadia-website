"use client";

import { Social } from "@/app/lib/definitions";
import { use } from "react";
import CollapsableList from "@/app/ui/collapsable-list/collapsable-list";

const ICONS: Record<string, string> = {
  YouTube: "/icons/yt.png",
  Twitch: "/icons/twitch.png",
  "Twitter/X": "/icons/twitter_icon.png",
  BlueSky: "/icons/bluesky_icon.svg",
  Linktree: "/icons/linktree.png",
  TikTok: "/icons/tiktok.png",
  Instagram: "/icons/instagram.svg",
};

export default function SocialsList({
  socials,
}: {
  socials: Promise<Array<Social>>;
}) {
  const allSocials = use(socials).map((social) => ({
    src: ICONS[social.type] ?? "/icons/link.svg",
    url: social.url,
    text: social.url.replace(/\/$/, "").split("/").pop() || social.type,
  }));
  return (
    <CollapsableList
      data={allSocials}
      isExpandedDefault={true}
      title="Socials"
    />
  );
}
