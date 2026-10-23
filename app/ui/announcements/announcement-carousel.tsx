"use client";

import { use, useEffect, useRef, useState } from "react";
import Image from "next/image";
import clsx from "clsx";
import type { Announcement } from "@/app/lib/definitions";
import { displayMs } from "./config";
import Pip from "./pip";

const card = "rounded-sm bg-white drop-shadow-sm md:drop-shadow-xl";

type Props = { announcements: Promise<Announcement[]>; now: number };

export default function AnnouncementCarousel({
  announcements,
  now: initialNow,
}: Props) {
  const all = use(announcements);
  // The page may be cached, so filter against the client's clock after mount
  const [now, setNow] = useState(initialNow);
  useEffect(() => setNow(Date.now()), []);
  // Tracked by id, not index, so an announcement expiring mid-cycle can't shift which slide
  // is showing. cycle restarts the timer on every advance, even if the same slide is re-picked.
  const [currentId, setCurrentId] = useState<number | null>(null);
  const [cycle, setCycle] = useState(0);
  const touchX = useRef<number | null>(null);

  const active = all.filter(
    (a) =>
      Date.parse(a.starts_at) <= now &&
      (a.ends_at === null || now < Date.parse(a.ends_at)),
  );
  const n = active.length;
  if (n === 0) return null;
  const current = Math.max(
    0,
    active.findIndex((a) => a.id === currentId),
  );

  const go = (to: number) => {
    setNow(Date.now());
    setCurrentId(active[((to % n) + n) % n].id);
    setCycle((c) => c + 1);
  };

  return (
    <div
      role="region"
      aria-roledescription="carousel"
      aria-label="Announcements"
      tabIndex={0}
      className="group order-first touch-pan-y md:order-none"
      onKeyDown={(e) => {
        if (n < 2) return;
        if (e.key === "ArrowLeft") go(current - 1);
        if (e.key === "ArrowRight") go(current + 1);
      }}
      onPointerDown={(e) => {
        if (e.pointerType === "touch") touchX.current = e.clientX;
      }}
      onPointerUp={(e) => {
        if (touchX.current === null || n < 2) return;
        const dx = e.clientX - touchX.current;
        touchX.current = null;
        if (Math.abs(dx) > 50) go(current + (dx < 0 ? 1 : -1));
      }}
      onPointerCancel={() => (touchX.current = null)}
    >
      {/* The side padding is where the deck layers peek out, so only a deck needs it */}
      <div className={clsx("relative", n > 1 && "px-3")}>
        {n > 1 && (
          <>
            <div className={clsx(card, "absolute inset-x-0 inset-y-4")} />
            <div className={clsx(card, "absolute inset-x-1.5 inset-y-2")} />
          </>
        )}
        <div className={clsx(card, "relative grid p-4")}>
          {active.map((a, i) => (
            <div
              key={a.id}
              inert={i !== current}
              aria-hidden={i !== current}
              className={clsx(
                "col-start-1 row-start-1 transition-[opacity,translate,visibility] duration-300",
                i !== current &&
                  "invisible translate-x-2 opacity-0 motion-reduce:translate-x-0",
              )}
            >
              <h2 className="text-2xl font-bold md:text-4xl">{a.title}</h2>
              <div className="mt-2 flow-root whitespace-pre-line">
                {a.has_image && (
                  <Image
                    src={`/api/announcements/${a.id}/image`}
                    alt={a.title}
                    unoptimized
                    width={0}
                    height={0}
                    className="float-left mr-4 mb-2 h-auto w-1/3 max-w-60 rounded-sm"
                  />
                )}
                {a.text}
              </div>
            </div>
          ))}
        </div>
      </div>
      {n > 1 && (
        <div className="flex justify-center">
          {active.map((a, i) => (
            <Pip
              key={a.id}
              active={i === current}
              cycle={cycle}
              ms={displayMs(a)}
              label={`Show announcement ${i + 1} of ${n}`}
              onClick={() => go(i)}
              onDone={() => go(current + 1)}
            />
          ))}
        </div>
      )}
    </div>
  );
}
