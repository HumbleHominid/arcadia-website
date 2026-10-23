import type { Announcement } from "@/app/lib/definitions";

export const TIMING = {
  baseMs: 4000,
  msPerChar: 40,
  minMs: 6000,
  maxMs: 30000,
};

export const displayMs = (a: Pick<Announcement, "title" | "text">) =>
  Math.min(
    TIMING.maxMs,
    Math.max(
      TIMING.minMs,
      TIMING.baseMs + (a.title.length + a.text.length) * TIMING.msPerChar,
    ),
  );

/** SVG geometry (viewBox units): r = outline radius, s = outline stroke, p = ring stroke. */
export const PIP = { r: 4, s: 1.5, p: 1.5 };
