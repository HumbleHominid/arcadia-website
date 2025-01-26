'use client';

import { FilterType } from "@/app/lib/definitions";
import clsx from "clsx";
import Link from "next/link";
import { usePathname } from "next/navigation";

export default function VideoFilterSelection({
	filter,
}:{
	filter: FilterType;
}) {
	const href = `/${filter}`;
	const isSelected = usePathname() === href;
	const getLabel = (filter: FilterType): string => {
		switch (filter) {
			case FilterType.Latest:
				return "Latest";
			case FilterType.All:
				return "All Videos";
			case FilterType.Arcadia:
				return "Arcadia";
		}
	}
	const label = getLabel(filter);
	return (
			<Link
				href={href}
				className={clsx(
					"first:rounded-l-md last:rounded-r-md h-full w-full border flex justify-center items-center hover:underline underline-offset-1 decoration-1",
					{
						"bg-slate-300": isSelected,
						"bg-slate-100 hover:bg-slate-200": !isSelected
					}
				)}
			>
				{label}
			</Link>
	)
}