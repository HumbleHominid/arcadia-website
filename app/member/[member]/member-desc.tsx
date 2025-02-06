'use client';

import { Member } from "@/app/lib/definitions";
import { use, useEffect, useRef, useState } from "react";
import Image from "next/image";
import clsx from "clsx";

export default function MemberDesc({
	members,
}:{
	members: Promise<Array<Member>>;
}) {
	const [isExpanded, setIsExpanded] = useState(false);
	const [canExpand, setCanExpand] = useState(false);
	const pRef = useRef<HTMLParagraphElement>(null);

	useEffect(() => {
		const updateExpansion = () => {
			const p = pRef.current
			if (!p) return;
			const isOverflowing = ({clientHeight, scrollHeight}: HTMLElement) => {
				return scrollHeight > clientHeight;
			}
			setCanExpand(isOverflowing(p));
			if (!isOverflowing(p)) setIsExpanded(true);
		}
		const resizeHandler = () => {
			const p = pRef.current
			if (!p) return;
			setIsExpanded(false);
			setTimeout(() => updateExpansion, 500);
		}
		updateExpansion();
		window.addEventListener('resize', resizeHandler);

		return () => {
			window.removeEventListener('resize', resizeHandler);
		}
	}, []);

	const memberData = use(members);
	if (!memberData || memberData.length < 1) return (<></>);
	const member = memberData[0];
	if (!member.description) return (<></>);
	const pfp_uri = member.yt_pfp_url ? member.yt_pfp_url : '/icons/user.svg';

	const handleClick = () => {
		if (canExpand) setIsExpanded(!isExpanded)
	}

	return(
		<div
			className={clsx(
				"relative",
				{
					"hover:cursor-pointer": canExpand
				}
			)}
			onClick={handleClick}
		>
			<div
				className={clsx(
					"absolute bottom-0 left-0 right-0 z-10 w-full",
					"transition-opacity duration-300 ease-in-out",
					{
						"opacity-100": canExpand && !isExpanded,
						"opacity-0": !canExpand || isExpanded,
					}
				)}
			>
				<div className="h-4 bg-gradient-to-t from-white" />
				<div className="h-0.5 bg-white rounded-b-sm" />
			</div>
			<p
				ref={pRef}
				className={clsx(
					"bg-white p-1 md:p-2 rounded-sm drop-shadow-sm md:drop-shadow-md text-sm md:text-lg break-words overflow-hidden",
					"transition-[max-height] ease-in-out duration-300",
					{
						"max-h-20 md:max-h-56": !isExpanded,
						"max-h-[750px]": isExpanded
					}
				)}
			>
				<Image src={pfp_uri} alt={`${member.name} profile picture`} width={32} height={32} className="inline-block align-top mr-1 md:mr-1.5 w-5 md:w-7 h-auto" />
				{member.description}
			</p>
		</div>
	)
}