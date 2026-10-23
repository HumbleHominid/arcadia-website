// Remove members (and their videos and socials) from one Vercel environment's database,
// then mark the site's cached member/video lists stale so the change shows up right away.
//
//   node db/remove-members.mjs <development|preview|production> <handle...> [--apply]
//
// Without --apply it only shows what would be deleted. Handles match case-insensitively,
// with or without the leading "@". Needs the Vercel CLI, logged in and linked to this project.
import { neon } from "@neondatabase/serverless";
import { execFileSync } from "node:child_process";
import { pullVercelEnv } from "./vercel-env.mjs";

const args = process.argv.slice(2);
const apply = args.includes("--apply");
const [env, ...rest] = args.filter((a) => a !== "--apply");
const handles = rest.map((h) => "@" + h.replace(/^@/, "").toLowerCase());
if (
  !["development", "preview", "production"].includes(env) ||
  !handles.length
) {
  console.error(
    "usage: node db/remove-members.mjs <development|preview|production> <handle...> [--apply]",
  );
  process.exit(1);
}

// Read that environment's DATABASE_URL
const { DATABASE_URL: url } = pullVercelEnv(env, ["DATABASE_URL"]);
if (!url) throw new Error(`No DATABASE_URL in the ${env} environment`);
const sql = neon(url);

const found = await sql`
  SELECT m.handle, m.name,
    (SELECT count(*)::int FROM videos v WHERE v.member_id = m.id) AS videos,
    (SELECT count(*)::int FROM socials s WHERE s.member_id = m.id) AS socials
  FROM members m WHERE lower(m.handle) = ANY(${handles}::text[])`;
const missing = handles.filter(
  (h) => !found.some((m) => m.handle.toLowerCase() === h),
);
console.log(`${env} database, ${found.length} member(s) matched:`);
console.table(found);
if (missing.length) console.log("Not found (skipped):", missing.join(", "));
if (!found.length) process.exit(0);
if (!apply) {
  console.log("Dry run: nothing deleted. Re-run with --apply to delete.");
  process.exit(0);
}

// One statement, so it's all-or-nothing: videos and socials go with their member
const [res] = await sql`
  WITH m AS (SELECT id FROM members WHERE lower(handle) = ANY(${handles}::text[])),
  v AS (DELETE FROM videos WHERE member_id IN (SELECT id FROM m) RETURNING 1),
  s AS (DELETE FROM socials WHERE member_id IN (SELECT id FROM m) RETURNING 1),
  d AS (DELETE FROM members WHERE id IN (SELECT id FROM m) RETURNING handle)
  SELECT (SELECT count(*)::int FROM d) AS members,
         (SELECT count(*)::int FROM v) AS videos,
         (SELECT count(*)::int FROM s) AS socials`;
console.log(
  `Deleted ${res.members} member(s), ${res.videos} video(s), ${res.socials} social(s).`,
);

// Same tags app/lib/actions.ts revalidates; the member list feeds every page and the crons
const tags = [
  "members",
  "latest-videos",
  "all-videos",
  "arcadia-videos",
  ...found.flatMap((m) => [`${m.handle}-videos`, `${m.handle}-socials`]),
];
execFileSync(
  "vercel",
  ["cache", "invalidate", "--yes", "--tag", tags.join(",")],
  { stdio: "inherit" },
);
console.log("Cache marked stale for:", tags.join(", "));
