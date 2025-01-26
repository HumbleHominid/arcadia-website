'use client';

import { Bars3Icon } from "@heroicons/react/16/solid";
import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import clsx from "clsx";

export type CollapseableListData = {
	src: string;
	url: string;
	text: string;
}

export default function CollapseableList({
	data = [],
	title = "",
}:{
	data?: Array<CollapseableListData>;
	title: string;
}) {
	const [isExpanded, setIsExpanded] = useState(false);

	return (
		<div
			className={clsx(
				"flex flex-col p-2 bg-white rounded-sm drop-shadow-sm md:drop-shadow-md",
				{
					"divide-y": isExpanded
				}
			)}
		>
			{/* Title and collapse button */}
			<div
				className={clsx(
					"flex gap-4 items-center hover:cursor-pointer transition-[padding]",
					isExpanded ? "pb-2" : "pb-0"
				)}
				onClick={()=>setIsExpanded(!isExpanded)}
			>
				<Bars3Icon width={20} height={20} />
				<span className="text-xl select-none">
					{title}
				</span>
			</div>
			{/* This thing collapses */}
			<div
				className={clsx(
					"overflow-hidden flex flex-col divide-y transition-[max-height]",
					isExpanded ? "max-h-[500px]" : "max-h-0"
				)}
			>
				{data.map((item, index) => {
					return (
						<Link
							key={index}
							href={item.url}
							target={item.url.startsWith('/') ? "_self" : "_blank"}
							rel="noreferrer noopener"
							className="flex gap-2 items-center py-1 px-2 hover:underline underline-offset-1 decoration-1 hover:bg-slate-100"
						>
							<Image src={item.src} width={20} height={20} alt={`${item.text} Image`}/>
							<span>{item.text}</span>
						</Link>
					)})}
			</div>
		</div>
	)
}