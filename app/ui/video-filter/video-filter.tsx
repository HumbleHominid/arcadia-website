"use client";

import { FilterType } from "@/app/lib/definitions";
import clsx from "clsx";
import Link from "next/link";
import { usePathname } from "next/navigation";

const LABELS: Record<FilterType, string> = {
  [FilterType.Latest]: "Latest",
  [FilterType.All]: "All Videos",
  [FilterType.Arcadia]: "Arcadia",
};

export default function VideoFilter() {
  const pathname = usePathname();
  return (
    <div className="my-2 flex h-7 w-full justify-evenly divide-x divide-gray-200 px-2 drop-shadow-md hover:cursor-pointer sm:h-8 md:h-10 md:w-8/12">
      {Object.values(FilterType).map((filter) => {
        const href = `/${filter}`;
        const isSelected = pathname === href;
        return (
          <Link
            key={filter}
            href={href}
            className={clsx(
              "flex h-full w-full items-center justify-center border border-gray-200 text-sm decoration-1 underline-offset-1 first:rounded-l-md last:rounded-r-md hover:underline md:text-base",
              {
                "bg-slate-300": isSelected,
                "bg-slate-100 hover:bg-slate-200": !isSelected,
              },
            )}
          >
            {LABELS[filter]}
          </Link>
        );
      })}
    </div>
  );
}
