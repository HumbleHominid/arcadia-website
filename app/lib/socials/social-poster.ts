// No runtime imports and only erasable TS, so plain `node` (type stripping) can import this file.
import type { Social } from "@/app/lib/definitions";

// Off locally, and anywhere DISABLE_SOCIAL_POSTING=true (set it for preview/QA deployments,
// which run with NODE_ENV=production). When off, nothing logs in or posts.
const POSTING_ENABLED =
  process.env.NODE_ENV === "production" &&
  process.env.DISABLE_SOCIAL_POSTING !== "true";

export type SocialPostData = {
  video_title: string;
  video_id: string;
};

export type Post = (text: string, data: SocialPostData) => Promise<void>;

export type Platform = {
  // Must equal SocialTypes.name; used to find the member's handle
  name: string;
  enabled: boolean;
  // Throws on failure; called at most once per socialPoster()
  login: () => Promise<Post>;
};

// Handle = last path segment of the member's profile URL
export const handleFor = (socials: Social[], type: string) =>
  socials
    .find((s) => s.type === type)
    ?.url.replace(/\/$/, "")
    .split("/")
    .pop();

// Only status/error/body: the request and headers carry the OAuth Authorization header
export function errorDetail(e: unknown): string {
  if (!(e instanceof Error)) return String(e);
  const { status, code, error, data } = e as Error & {
    status?: unknown;
    code?: unknown;
    error?: unknown;
    data?: unknown;
  };
  const detail = {
    // twitter-api-v2 puts the HTTP status in `code`; Node network errors put a string there
    status: status ?? (typeof code === "number" ? code : undefined),
    code: typeof code === "string" ? code : undefined,
    error: typeof error === "string" ? error : undefined,
    data,
    // fetch's "fetch failed" hides the real reason here
    cause: e.cause instanceof Error ? e.cause.message : undefined,
  };
  if (!Object.values(detail).some((v) => v !== undefined)) return e.message;
  try {
    return `${e.message} ${JSON.stringify(detail)}`;
  } catch {
    // Circular or BigInt body: logging must never throw
    return e.message;
  }
}

export function socialPoster(
  platforms: Platform[],
  postingEnabled = POSTING_ENABLED,
) {
  // One login per platform per cron run, shared across videos. A failed login stays
  // memoized, so later videos fail fast and the next run retries.
  const logins = new Map<Platform, Promise<Post>>();

  // Never rejects: failures are logged per platform
  return async (data: SocialPostData, socials: Social[]) => {
    const jobs = platforms
      .filter((p) => p.enabled)
      .map((p) => {
        const handle = handleFor(socials, p.name);
        return {
          p,
          text: handle ? `${data.video_title} @${handle}` : data.video_title,
        };
      });
    if (!jobs.length) return;

    if (!postingEnabled) {
      console.log(
        `Social posting off, would post: ${jobs.map(({ p, text }) => `[${p.name}] ${text}`).join(" | ")}`,
      );
      return;
    }

    const results = await Promise.allSettled(
      jobs.map(async ({ p, text }) => {
        let login = logins.get(p);
        if (!login) logins.set(p, (login = p.login()));
        const post = await login;
        await post(text, data);
        console.log(`Posted to ${p.name}: ${text}`);
      }),
    );
    results.forEach((r, i) => {
      if (r.status === "rejected")
        console.error(
          `${jobs[i].p.name} post failed for ${data.video_id}: ${errorDetail(r.reason)}`,
        );
    });
  };
}
