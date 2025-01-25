import CollapseableList from "./ui/collapseable-list";

export default function Home() {
  // TODO: Get from skeleton data then DB
  const members = [
    {src: "/images/user.svg", url: "/HumbleHominid", text: "HumbleHominid"},
    {src: "/images/user.svg", url: "/Zoontii", text: "Zoontii"},
  ];
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
    <article className="flex md:flex-row flex-col gap-4">
      {/* Member and Server Info */}
      <div className="flex flex-col">
        <CollapseableList data={members} title="Members" />
        <CollapseableList data={community} title="Community" />
        <CollapseableList data={server} title="Server Stuff" />
      </div>
    </article>
  );
}
