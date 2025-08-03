"use client";

import Link from "next/link";
import Image from "next/image";
import { CSSProperties, useEffect, useRef, useState } from "react";

export type CollapsableListItemData = {
  src: string;
  url: string;
  text: string;
};

enum Dir {
  Left,
  Right,
}

export default function CollapsableListItem({
  data,
}: {
  data: CollapsableListItemData;
}) {
  const divRef = useRef<HTMLDivElement>(null);
  const linkRef = useRef<HTMLAnchorElement>(null);
  const [spanStyle, setSpanStyle] = useState<CSSProperties>({});
  const [windowSizeUpdate, setWindowSizeUpdate] = useState(0);

  useEffect(() => {
    const div = divRef.current;
    const link = linkRef.current;
    if (!div || !link) return;
    const getBB = (el: HTMLElement) => el.getBoundingClientRect();
    // only enable the scrolling effect if the span is too big
    if (getBB(div).right <= getBB(link).right) {
      setSpanStyle({
        translate: "0px",
      });
      return;
    }
    const dist = getBB(div).right - getBB(link).right;
    let dir = Dir.Left;

    const scrollSpan = () => {
      if (dir === Dir.Left) {
        setSpanStyle({
          translate: `-${dist}px`,
        });
        dir = Dir.Right;
      } else {
        setSpanStyle({
          translate: "0px",
        });
        dir = Dir.Left;
      }
    };

    scrollSpan();
    const intervalId = setInterval(scrollSpan, 4 * 1000);

    return () => clearInterval(intervalId);
  }, [windowSizeUpdate]);

  useEffect(() => {
    const windowSizeUpdateHandler = () => {
      setWindowSizeUpdate((c) => c + 1);
    };
    window.addEventListener("resize", windowSizeUpdateHandler);

    return () => {
      window.removeEventListener("resize", windowSizeUpdateHandler);
    };
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
        className="h-auto w-4 md:w-5"
      />
      <div className="overflow-clip" ref={divRef}>
        <div
          className="text-sm transition-[translate] duration-[3000ms] ease-in-out md:text-base"
          style={spanStyle}
        >
          {data.text}
        </div>
      </div>
    </Link>
  );
}
