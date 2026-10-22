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

export default function VideoFilterSelection({
  filter,
}: {
  filter: FilterType;
}) {
  const href = `/${filter}`;
  const isSelected = usePathname() === href;
  return (
    <Link
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
}
