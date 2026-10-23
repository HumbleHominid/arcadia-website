// Delete every announcement from one Vercel environment's database, then mark the site's
// cached announcements stale so the change shows up right away.
//
//   node db/clear-announcements.mjs <development|preview|production> [--apply]
//
// Without --apply it only lists what would be deleted. Needs the Vercel CLI, logged in and
// linked to this project.
import { neon } from "@neondatabase/serverless";
import { execFileSync } from "node:child_process";
import { pullVercelEnv } from "./vercel-env.mjs";

const args = process.argv.slice(2);
const apply = args.includes("--apply");
const [env, ...rest] = args.filter((a) => a !== "--apply");
if (!["development", "preview", "production"].includes(env) || rest.length) {
  console.error(
    "usage: node db/clear-announcements.mjs <development|preview|production> [--apply]",
  );
  process.exit(1);
}

const { DATABASE_URL: url } = pullVercelEnv(env, ["DATABASE_URL"]);
if (!url) throw new Error(`No DATABASE_URL in the ${env} environment`);
const sql = neon(url);

const found = await sql`
  SELECT id, starts_at, ends_at, title, length(text) AS text_chars,
    image IS NOT NULL AS has_image
  FROM announcements ORDER BY id`;
console.log(`${env} database, ${found.length} announcement(s):`);
console.table(found);
if (!found.length) process.exit(0);
if (!apply) {
  console.log("Dry run: nothing deleted. Re-run with --apply to delete.");
  process.exit(0);
}

const deleted = await sql`DELETE FROM announcements RETURNING id`;
console.log(`Deleted ${deleted.length} announcement(s).`);

execFileSync(
  "vercel",
  ["cache", "invalidate", "--yes", "--tag", "announcements"],
  { stdio: "inherit" },
);
console.log("Cache marked stale for: announcements");
// vercel cache invalidate only reaches Vercel; a local `next dev` keeps its own copy
console.log(
  "Local dev server: run `rm -rf .next/cache/fetch-cache` to see it there too.",
);
