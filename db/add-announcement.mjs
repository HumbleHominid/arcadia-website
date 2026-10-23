// Add an announcement to one Vercel environment's database, then mark the site's cached
// announcements stale so it shows up right away (at its start time, if that's in the future).
//
//   node db/add-announcement.mjs <development|preview|production> --title <text>
//     (--text <text> | --text-file <path>) [--start <time>] [--end <time>]
//     [--image <path>] [--apply]
//
// Without --apply it only shows what would be inserted. Times are ISO 8601; one without a
// "Z" or ±HH:MM offset is UTC. --start defaults to now, no --end means it never expires.
// Text keeps its newlines. Images: png, jpg, webp or gif, at most 1 MB. Needs the Vercel
// CLI, logged in and linked to this project.
//
// The table is applied by hand per database (`end` is reserved, hence starts_at/ends_at):
//
//   CREATE TABLE announcements (
//     id integer GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
//     starts_at timestamptz NOT NULL,
//     ends_at timestamptz,
//     title text NOT NULL,
//     text text NOT NULL,
//     image bytea,
//     image_type text,
//     CHECK (ends_at IS NULL OR ends_at > starts_at),
//     CHECK ((image IS NULL) = (image_type IS NULL))
//   );
import { neon } from "@neondatabase/serverless";
import { execFileSync } from "node:child_process";
import { readFileSync } from "node:fs";
import { extname } from "node:path";
import { parseArgs } from "node:util";
import { pullVercelEnv } from "./vercel-env.mjs";

const USAGE =
  "usage: node db/add-announcement.mjs <development|preview|production> --title <text> " +
  "(--text <text> | --text-file <path>) [--start <time>] [--end <time>] [--image <path>] [--apply]";
const fail = (msg) => {
  console.error(msg ? `${msg}\n${USAGE}` : USAGE);
  process.exit(1);
};

let parsed;
try {
  parsed = parseArgs({
    allowPositionals: true,
    options: {
      title: { type: "string" },
      text: { type: "string" },
      "text-file": { type: "string" },
      start: { type: "string" },
      end: { type: "string" },
      image: { type: "string" },
      apply: { type: "boolean" },
    },
  });
} catch (err) {
  fail(err.message);
}
const { values, positionals } = parsed;
const [env] = positionals;
if (
  !["development", "preview", "production"].includes(env) ||
  positionals.length !== 1
)
  fail();

const title = values.title?.trim();
if (!title) fail("--title is required and can't be empty");
if ((values.text === undefined) === (values["text-file"] === undefined))
  fail("give exactly one of --text or --text-file");
const text = (values.text ?? readFileSync(values["text-file"], "utf8")).trim();
if (!text) fail("the text can't be empty");

// ISO 8601; with no offset it's UTC
const parseTime = (flag, s) => {
  const t = new Date(/Z$|[+-]\d\d:?\d\d$/i.test(s) ? s : s + "Z");
  if (isNaN(t)) fail(`${flag}: can't parse "${s}" as an ISO 8601 time`);
  return t;
};
const start = values.start ? parseTime("--start", values.start) : new Date();
const end = values.end ? parseTime("--end", values.end) : null;
if (end && end <= start) fail("--end must be after --start");

const TYPES = {
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".webp": "image/webp",
  ".gif": "image/gif",
};
const MAGIC = {
  "image/png": (b) =>
    b.subarray(0, 4).equals(Buffer.from([0x89, 0x50, 0x4e, 0x47])),
  "image/jpeg": (b) => b.subarray(0, 3).equals(Buffer.from([0xff, 0xd8, 0xff])),
  "image/gif": (b) => b.subarray(0, 4).toString("latin1") === "GIF8",
  "image/webp": (b) =>
    b.subarray(0, 4).toString("latin1") === "RIFF" &&
    b.subarray(8, 12).toString("latin1") === "WEBP",
};
let imageB64 = null;
let imageType = null;
let imageSize = 0;
if (values.image) {
  imageType = TYPES[extname(values.image).toLowerCase()];
  if (!imageType)
    fail("--image must be a .png, .jpg, .jpeg, .webp or .gif file");
  const bytes = readFileSync(values.image);
  imageSize = bytes.length;
  if (imageSize > 1024 * 1024)
    fail(
      `--image is ${imageSize} bytes; the limit is 1 MB so its base64 stays under the Vercel data cache's 2 MB per-entry limit`,
    );
  if (!MAGIC[imageType](bytes))
    fail(`--image's contents aren't really ${imageType}`);
  imageB64 = bytes.toString("base64");
}

const iso = (d) => d.toISOString().replace(/\.\d+Z$/, "Z");
console.log(`${env} database, announcement to insert:`);
console.log(`  title: ${title}`);
console.log(`  text:  ${text.length} characters`);
console.log(`  start: ${iso(start)} (UTC)`);
console.log(`  end:   ${end ? iso(end) + " (UTC)" : "never"}`);
console.log(
  `  image: ${imageType ? `${imageType}, ${imageSize} bytes` : "none"}`,
);
if (!values.apply) {
  console.log("Dry run: nothing inserted. Re-run with --apply to insert.");
  process.exit(0);
}

const { DATABASE_URL: url } = pullVercelEnv(env, ["DATABASE_URL"]);
if (!url) throw new Error(`No DATABASE_URL in the ${env} environment`);
const sql = neon(url);

const [row] = await sql`
  INSERT INTO announcements (starts_at, ends_at, title, text, image, image_type)
  VALUES (${iso(start)}::timestamptz, ${end ? iso(end) : null}::timestamptz, ${title}, ${text},
    decode(${imageB64}, 'base64'), ${imageType})
  RETURNING id`;
console.log(`Inserted announcement ${row.id}.`);

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
