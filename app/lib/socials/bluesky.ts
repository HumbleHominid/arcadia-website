import AtpAgent, { RichText } from "@atproto/api";
import {
  errorDetail,
  type Platform,
  type SocialPostData,
} from "@/app/lib/socials/social-poster";

async function embedCard(agent: AtpAgent, video: SocialPostData) {
  try {
    // Posts are awaited by the cron, so don't let a slow thumbnail hold it up
    const res = await fetch(video.thumbnail_uri, {
      signal: AbortSignal.timeout(10_000),
    });
    if (!res.ok) throw new Error(`thumbnail fetch returned ${res.status}`);
    const blob = await res.blob();
    const { data } = await agent.uploadBlob(blob, { encoding: "image/jpeg" });

    return {
      $type: "app.bsky.embed.external",
      external: {
        uri: `https://youtu.be/${video.video_id}`,
        title: video.video_title,
        description: video.description,
        thumb: data.blob,
      },
    };
  } catch (e) {
    console.log(
      `BlueSky embed card failed, posting without it: ${errorDetail(e)}`,
    );
  }
}

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
        embed: await embedCard(agent, data),
      });
    };
  },
};
