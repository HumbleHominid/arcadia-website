"use client";

import { Member } from "@/app/lib/definitions";
import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import clsx from "clsx";

export default function MemberDesc({ member }: { member: Member }) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [canExpand, setCanExpand] = useState(false);
  const pRef = useRef<HTMLParagraphElement>(null);

  useEffect(() => {
    const p = pRef.current;
    // Only measure while collapsed: when expanded, scrollHeight == clientHeight
    if (!p || isExpanded) return;
    // ResizeObserver fires once on observe, so this also does the initial measure
    const observer = new ResizeObserver(() =>
      setCanExpand(p.scrollHeight > p.clientHeight),
    );
    observer.observe(p);
    return () => observer.disconnect();
  }, [isExpanded]);

  const description = member.description || `${member.name} on Arcadia!`;
  const pfp_uri = member.yt_pfp_url || "/icons/user.svg";

  const handleClick = () => {
    if (canExpand) setIsExpanded(!isExpanded);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key !== "Enter" && e.key !== " ") return;
    e.preventDefault();
    handleClick();
  };

  return (
    <div
      className={clsx("relative rounded-sm", {
        "hover:cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2":
          canExpand,
      })}
      onClick={handleClick}
      {...(canExpand && {
        role: "button",
        tabIndex: 0,
        "aria-expanded": isExpanded,
        onKeyDown: handleKeyDown,
      })}
    >
      <div
        className={clsx(
          "absolute right-0 bottom-0 left-0 z-10 w-full",
          "transition-opacity duration-300 ease-in-out",
          {
            "opacity-100": canExpand && !isExpanded,
            "opacity-0": !canExpand || isExpanded,
          },
        )}
      >
        <div className="h-4 bg-gradient-to-t from-white" />
        <div className="h-0.5 rounded-b-sm bg-white" />
      </div>
      <p
        ref={pRef}
        className={clsx(
          "overflow-hidden rounded-sm bg-white p-1 text-sm break-words drop-shadow-sm md:p-2 md:drop-shadow-md",
          "transition-[max-height] duration-300 ease-in-out [interpolate-size:allow-keywords]",
          {
            "max-h-20 md:max-h-56": !isExpanded,
            "max-h-max": isExpanded,
          },
        )}
      >
        <Image
          src={pfp_uri}
          alt={`${member.name} profile picture`}
          width={32}
          height={32}
          unoptimized
          referrerPolicy="no-referrer"
          className="float-left mr-1 inline-block h-auto w-8 md:mr-1.5"
        />
        {description}
      </p>
    </div>
  );
}
