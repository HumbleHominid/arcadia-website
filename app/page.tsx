import { fetchMembers, fetchVideos } from "@/app/lib/data";
import CollapseableList from "@/app/ui/collapseable-list";
import VideoList from "@/app/ui/video-list";
import PageLayout from "@/app/ui/page-layout";

export default async function Home() {
  const members = (await fetchMembers()).map((member) => { return {src: '/images/user.svg', url: `/${member.name}`, text: member.name}});
  const videoData = await fetchVideos();
  const community = [
    {src: "/images/twitter_icon.png", url: "https://x.com/Arcadia_SMP", text: "Twitter/X"},
    {src: "/images/bluesky_icon.svg", url: "https://bsky.app/profile/arcadiasmp.bsky.social", text: "Bluesky"},
    {src: "/images/discord-mark-blue.svg", url: "https://discord.gg/btwNnKtWQu", text: "Discord"},
  ];
  const server = [
    {src: "/images/arrow-down-tray.svg", url: "https://www.mediafire.com/file/an45poqm8p6ldc3/arcadia-smp-season1-v1.zip/file", text: "Season 1 World Download"},
    {src: "/images/moddermore-positive.png", url: "https://moddermore.net/list/8a52816c90", text: "Server Mods"},
  ];
  return (
    <PageLayout>
      {/* Member and Server Info */}
      <div className="flex flex-col gap-1 w-full md:w-4/12">
        <CollapseableList data={members} title="Members" />
        <CollapseableList data={community} title="Community" />
        <CollapseableList data={server} title="Server Stuff" />
      </div>
      {/* Video section */}
      <div className="w-full">
        {/* Need a context switcher */}
        {/* List of videos */}
        <VideoList videos={videoData} />
      </div>
    </PageLayout>
  );
}
