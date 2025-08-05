"use client";

import { Bars3Icon } from "@heroicons/react/16/solid";
import { useState } from "react";
import clsx from "clsx";

export default function Accordion({
  title = "",
  isExpandedDefault = false,
  children,
}: {
  title: string;
  isExpandedDefault?: boolean;
  children: React.ReactNode;
}) {
  const [isExpanded, setIsExpanded] = useState(isExpandedDefault);

  return (
    <div
      className={clsx(
        "flex flex-col rounded-sm bg-white p-1 drop-shadow-sm md:p-2 md:drop-shadow-md",
        {
          "divide-y": isExpanded,
        },
      )}
    >
      {/* Title and collapse button */}
      <div
        className={clsx(
          "flex items-center gap-4 transition-[padding] hover:cursor-pointer",
          isExpanded ? "pb-1 md:pb-2" : "pb-0",
        )}
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <Bars3Icon width={20} height={20} className="h-auto w-4 md:w-5" />
        <span className="select-none text-base md:text-xl">{title}</span>
      </div>
      {/* This thing collapses */}
      <div
        className={clsx(
          "divide-y overflow-hidden transition-[max-height]",
          isExpanded ? "max-h-[1250px]" : "max-h-0",
        )}
      >
        {children}
      </div>
    </div>
  );
}
