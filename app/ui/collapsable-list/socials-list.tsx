"use client";

import { Social } from "@/app/lib/definitions";
import { use } from "react";
import CollapsableList from "@/app/ui/collapsable-list/collapsable-list";

// youtube-icon.png is the official red icon with its transparent margin trimmed, so the mark
// fills the slot like the other icons. The row's gap and padding keep YouTube's clear space.
const ICONS: Record<string, string> = {
  YouTube: "/icons/youtube-icon.png",
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
  const allSocials = use(socials).map((social) => {
    const text = social.url.replace(/\/$/, "").split("/").pop() || social.type;
    return {
      src: ICONS[social.type] ?? "/icons/link.svg",
      url: social.url,
      // YouTube's handle promotion format: [icon] / @handle
      text: social.type === "YouTube" ? `/ ${text}` : text,
    };
  });
  return (
    <CollapsableList
      data={allSocials}
      isExpandedDefault={true}
      title="Socials"
    />
  );
}
