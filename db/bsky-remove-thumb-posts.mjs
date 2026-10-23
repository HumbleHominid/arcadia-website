// Delete the site's old Bluesky posts whose link card carries an uploaded thumbnail
// (YouTube API policy: cards must not embed YouTube thumbnails or descriptions).
//
//   node db/bsky-remove-thumb-posts.mjs [--apply]
//
// Without --apply it only lists the matching posts. Reads BSKY_IDENTIFIER / BSKY_PASSWORD
// from the production Vercel environment. Needs the Vercel CLI, logged in and linked to this project.
import { AtpAgent } from "@atproto/api";
import { pullVercelEnv } from "./vercel-env.mjs";

const apply = process.argv.slice(2).includes("--apply");

// Production's Bluesky credentials
const { BSKY_IDENTIFIER: identifier, BSKY_PASSWORD: password } = pullVercelEnv(
  "production",
  ["BSKY_IDENTIFIER", "BSKY_PASSWORD"],
);
if (!identifier || !password)
  throw new Error(
    "No BSKY_IDENTIFIER / BSKY_PASSWORD in the production environment",
  );

const agent = new AtpAgent({ service: "https://bsky.social" });
await agent.login({ identifier, password });

// The YouTube link card of a post, if it has an uploaded thumbnail. Other links' cards
// (e.g. hand-made posts on the same account) are left alone.
const thumbCard = (embed) =>
  [embed, embed?.media].find(
    (e) =>
      e?.$type === "app.bsky.embed.external" &&
      e.external?.thumb &&
      /^https:\/\/(youtu\.be|(www\.)?youtube\.com)\//.test(e.external.uri),
  )?.external;

const matches = [];
let cursor;
do {
  const { data } = await agent.com.atproto.repo.listRecords({
    repo: agent.session.did,
    collection: "app.bsky.feed.post",
    limit: 100,
    cursor,
  });
  for (const r of data.records) {
    const card = thumbCard(r.value.embed);
    if (card) matches.push({ uri: r.uri, createdAt: r.value.createdAt, card });
  }
  cursor = data.cursor;
} while (cursor);

for (const { uri, createdAt, card } of matches)
  console.log(
    createdAt,
    uri,
    card.uri,
    JSON.stringify((card.title ?? "").slice(0, 60)),
  );
console.log(`${matches.length} post(s) with a thumbnail card`);

if (!apply) {
  console.log(`dry run: re-run with --apply to delete ${matches.length} posts`);
  process.exit(0);
}

let failed = 0;
for (const { uri } of matches) {
  try {
    await agent.deletePost(uri);
    console.log("deleted", uri);
  } catch (e) {
    failed++;
    console.error("failed", uri, e?.message ?? e);
  }
}
if (failed) process.exit(1);
