'use client';

import Link from "next/link";
import Image from "next/image";
import { CSSProperties, useEffect, useRef, useState } from "react";

export type CollapseableListItemData = {
	src: string;
	url: string;
	text: string;
}

enum Dir {
	Left,
	Right
}

export default function CollapseableListItem({
	data,
} : {
	data: CollapseableListItemData,
}) {
	const divRef = useRef<HTMLDivElement>(null);
	const linkRef = useRef<HTMLAnchorElement>(null);
	const [spanStyle, setSpanStyle] = useState<CSSProperties>({});
	const [windowSizeUpdate, setWindowSizeUpdate] = useState(0);

	useEffect(() => {
		const div = divRef.current;
		const link = linkRef.current
		if (!div || !link) return;
		const getBB = (el: HTMLElement) => el.getBoundingClientRect();
		// only enable the scrolling effect if the span is too big
		if (getBB(div).right <= getBB(link).right) {
			setSpanStyle({
				translate: '0px'
			});
			return;
		}
		const dist = getBB(div).right - getBB(link).right;
		let dir = Dir.Left;

		const scrollSpan = () => {
			if (dir === Dir.Left) {
				setSpanStyle({
					translate: `-${dist}px`
				});
				dir = Dir.Right;
			}
			else {
				setSpanStyle({
					translate: '0px'
				});
				dir = Dir.Left;
			}
		}

		scrollSpan();
		const intervalId = setInterval(scrollSpan, 4 * 1000);

		return () => clearInterval(intervalId);
	}, [windowSizeUpdate]);

	useEffect(() => {
		const windowSizeUpdateHandler = () => {
			setWindowSizeUpdate(c => c + 1);
		}
		window.addEventListener('resize', windowSizeUpdateHandler);

		return () => {
			window.removeEventListener('resize', windowSizeUpdateHandler);
		}
	},[])

	return (
		<Link
			ref={linkRef}
			href={data.url}
			target={data.url.startsWith('/') ? "_self" : "_blank"}
			rel="noreferrer noopener"
			className="flex gap-2 items-center py-0.5 md:py-1 px-1 md:px-2 hover:underline underline-offset-1 decoration-1 hover:bg-slate-100"
		>
			<Image
				src={data.src}
				width={20}
				height={20}
				alt={`${data.text} Image`}
				className="w-4 md:w-5 h-auto"
			/>
			<div
				className="overflow-clip"
				ref={divRef}
			>
				<div
					className="text-sm md:text-base transition-all ease-in-out duration-[3000ms]"
					style={spanStyle}
				>
					{data.text}
				</div>
			</div>
		</Link>
	)
}