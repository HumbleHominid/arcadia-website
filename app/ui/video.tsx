import Image from "next/image";
import Link from "next/link";
import { formatDistance } from "date-fns";
import { Video as VideoData } from "@/app/lib/definitions";

export default function Video({
	data
}: {
	data: VideoData
}) {
	const posted = formatDistance(new Date(data.publish_date), new Date(), { addSuffix: true });
	let duration = data.duration
		.replace('PT', '')
		.replace('H', ':')
		.replace('M', ':')
		.replace('S', '')
		.split(':')
		.map((t) => {
			const s = '00' + t;
			return s.substring(s.length - 2);
		})
		.join(':')
		.replace(/^0+/,'');
		// If the video is less than a minute, prepend a '0:'
		if (duration.split(':').length === 1) {
			duration = '0:' + duration;
		}

	return (
		<div className="grid grid-cols-[auto_1fr] py-2 gap-4">
			<Link
				href={`https://www.youtube.com/watch?v=${data.video_id}`}
				target="_blank"
				rel="noopener noreferrer"
			>
				<div className={"w-[160px] md:w-[200px] overflow-hidden relative"}
				>
					<Image
						src={`https://i.ytimg.com/vi/${data.video_id}/mqdefault.jpg`}
						alt={`Thumbnail for ${data.title}`}
						width={256}
						height={144}
						className="align-middle overflow-hidden"
					/>
					{/* The duration stamp */}
					<span className="bg-slate-800 bg-opacity-60 text-white absolute bottom-0 right-0 mr-1 mb-1 px-1 text-xs">
						{duration}
					</span>
				</div>
			</Link>
			<div>
				<h2 className="text-md md:text-xl">{data.title}</h2>
				<p className="text-sm md:text-base">
					<span className="text-gray-600">by: </span>
					<Link
						href={`/member/${data.uploader_handle}`}
						className="hover:underline underline-offset-1 decoration-1"
					>
						{data.uploader_name}
					</Link>
					<span> - {posted}</span>
				</p>
			</div>
		</div>
	)
}