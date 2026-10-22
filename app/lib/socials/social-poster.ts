import { SocialHandler } from "@/app/lib/socials/social-handler";
import { getCachedSocialsForMemberHandle } from "@/app/lib/cache-methods";
import AtpAgent, { RichText } from "@atproto/api";

// Off locally, and anywhere DISABLE_SOCIAL_POSTING=true (set it for preview/QA deployments,
// which run with NODE_ENV=production). When off, nothing logs in, uploads or posts.
const POSTING_ENABLED =
  process.env.NODE_ENV === "production" &&
  process.env.DISABLE_SOCIAL_POSTING !== "true";

type SocialPostData = {
  video_title: string;
  video_id: string;
  yt_handle: string;
  description: string;
  thumbnail_uri: string;
};

async function getBSKYEmbedCard(client: AtpAgent, video_data: SocialPostData) {
  try {
    const blob = await fetch(video_data.thumbnail_uri).then((r) => r.blob());
    const { data } = await client.uploadBlob(blob, { encoding: "image/jpeg" });

    return {
      $type: "app.bsky.embed.external",
      external: {
        uri: `https://youtu.be/${video_data.video_id}`,
        title: video_data.video_title,
        description: video_data.description,
        thumb: data.blob,
      },
    };
  } catch (e) {
    console.log(`Failed to produce BSKY Embed Card with err: ${e}`);
  }
}

export async function createPosts(
  data: SocialPostData,
  handler: SocialHandler,
) {
  const socials = await getCachedSocialsForMemberHandle(data.yt_handle);
  // Handle = last path segment of the member's profile URL
  const handleFor = (type: string) =>
    socials
      .find((s) => s.type === type)
      ?.url.replace(/\/$/, "")
      .split("/")
      .pop();

  if (!POSTING_ENABLED) {
    console.log(
      `Social posting off, would post: ${postText(data, handleFor("BlueSky"))} | ${postText(data, handleFor("Twitter/X"))}`,
    );
    return;
  }
  // Fire and forget intended
  postSkeet(handler, data, handleFor("BlueSky"));
  postTweet(handler, data, handleFor("Twitter/X"));
}

const postText = (data: SocialPostData, handle?: string) =>
  handle ? `${data.video_title} @${handle}` : data.video_title;

async function postTweet(
  handler: SocialHandler,
  data: SocialPostData,
  handle?: string,
) {
  const client = await handler.get_twitter();
  if (!client) return;
  const text = `${postText(data, handle)} https://www.youtube.com/watch?v=${data.video_id}`;
  console.log(`posting tweet: ${text}`);
  client.v2
    .tweet({ text })
    .catch((e) =>
      console.log(
        `Failed to post tweet with err code ${e.code} and details: ${e.error?.detail}`,
      ),
    );
}

async function postSkeet(
  handler: SocialHandler,
  data: SocialPostData,
  handle?: string,
) {
  const client = await handler.get_bsky();
  if (!client) return;
  try {
    const rt = new RichText({ text: postText(data, handle) });
    await rt.detectFacets(client);
    const embed = await getBSKYEmbedCard(client, data);
    console.log(`posting skeet: ${rt.text}`);
    await client.post({ text: rt.text, facets: rt.facets, embed });
  } catch (e) {
    console.log(`Failed to post skeet with err: ${e}`);
  }
}
