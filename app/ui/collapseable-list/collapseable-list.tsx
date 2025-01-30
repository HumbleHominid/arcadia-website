'use client';

import { Bars3Icon } from "@heroicons/react/16/solid";
import { useState } from "react";
import CollapseableListItem, { CollapseableListItemData } from "@/app/ui/collapseable-list/collapseable-list-item";
import clsx from "clsx";

export default function CollapseableList({
	data = [],
	title = "",
	numColsOnMobile = 1,
	isExpandedDefault = false,
}:{
	data?: Array<CollapseableListItemData>;
	title: string;
	numColsOnMobile?: number;
	isExpandedDefault?: boolean;
}) {
	const [isExpanded, setIsExpanded] = useState(isExpandedDefault);

	return (
		<div
			className={clsx(
				"flex flex-col p-1 md:p-2 bg-white rounded-sm drop-shadow-sm md:drop-shadow-md",
				{
					"divide-y": isExpanded
				}
			)}
		>
			{/* Title and collapse button */}
			<div
				className={clsx(
					"flex gap-4 items-center hover:cursor-pointer transition-[padding]",
					isExpanded ? "pb-1 md:pb-2" : "pb-0"
				)}
				onClick={()=>setIsExpanded(!isExpanded)}
			>
				<Bars3Icon
					width={20}
					height={20}
					className="w-4 md:w-5 h-auto"
				/>
				<span className="text-base md:text-xl select-none">
					{title}
				</span>
			</div>
			{/* This thing collapses */}
			<div
				className={clsx(
					"overflow-hidden divide-y transition-[max-height]",
					`grid grid-cols-${numColsOnMobile} md:grid-cols-1 gap-x-2`,
					isExpanded ? "max-h-[1000px]" : "max-h-0"
				)}
			>
				{data.map((item, index) => {
					return (
						<CollapseableListItem key={index} data={item} />
					)})}
			</div>
		</div>
	)
}