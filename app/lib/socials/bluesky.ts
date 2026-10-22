import AtpAgent, { RichText } from "@atproto/api";
import type { Platform, SocialPostData } from "@/app/lib/socials/social-poster";

// Link card with no thumb: YouTube API policy forbids downloading or re-hosting thumbnails,
// and Bluesky only shows uploaded blobs. The app still renders a youtu.be link as a player.
export const embedCard = (video: SocialPostData) => ({
  $type: "app.bsky.embed.external",
  external: {
    uri: `https://youtu.be/${video.video_id}`,
    title: video.video_title,
    description: "", // required by the lexicon
  },
});

export const bluesky: Platform = {
  name: "BlueSky",
  enabled: true,
  async login() {
    const agent = new AtpAgent({ service: "https://bsky.social" });
    await agent.login({
      identifier: process.env.BSKY_IDENTIFIER ?? "",
      password: process.env.BSKY_PASSWORD ?? "",
    });
    return async (text, data) => {
      const rt = new RichText({ text });
      await rt.detectFacets(agent);
      await agent.post({
        text: rt.text,
        facets: rt.facets,
        embed: embedCard(data),
      });
    };
  },
};
