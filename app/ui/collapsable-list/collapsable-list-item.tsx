"use client";

import Link from "next/link";
import Image from "next/image";
import clsx from "clsx";
import { CSSProperties, useEffect, useRef, useState } from "react";

export type CollapsableListItemData = {
  src: string;
  url: string;
  text: string;
};

export default function CollapsableListItem({
  data,
}: {
  data: CollapsableListItemData;
}) {
  const divRef = useRef<HTMLDivElement>(null);
  const linkRef = useRef<HTMLAnchorElement>(null);
  const [overflow, setOverflow] = useState(0);

  useEffect(() => {
    const div = divRef.current;
    const link = linkRef.current;
    if (!div || !link) return;
    // ResizeObserver fires once on observe, so this also does the initial measure
    const observer = new ResizeObserver(() =>
      setOverflow(
        Math.max(
          0,
          div.getBoundingClientRect().right -
            link.getBoundingClientRect().right,
        ),
      ),
    );
    observer.observe(link);
    return () => observer.disconnect();
  }, []);

  return (
    <Link
      ref={linkRef}
      href={data.url}
      target={data.url.startsWith("/") ? "_self" : "_blank"}
      rel="noreferrer noopener"
      className="flex items-center gap-2 px-1 py-0.5 decoration-1 underline-offset-1 hover:bg-slate-100 hover:underline md:px-2 md:py-1"
    >
      <Image
        src={data.src}
        width={20}
        height={20}
        alt={`${data.text} Image`}
        // YouTube avatars are served no-transform, so load them as-is; ggpht rate-limits
        // hotlinked requests that carry a Referer
        unoptimized={data.src.startsWith("http")}
        referrerPolicy="no-referrer"
        className="size-4 object-contain md:size-5"
      />
      <div className="overflow-clip" ref={divRef}>
        <div
          className={clsx(
            "text-sm md:text-base",
            overflow > 0 && "animate-marquee motion-reduce:animate-none",
          )}
          style={{ "--marquee-dist": `-${overflow}px` } as CSSProperties}
        >
          {data.text}
        </div>
      </div>
    </Link>
  );
}
