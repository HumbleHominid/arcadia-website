import Image from "next/image";
import Link from "next/link";
import { formatDistance } from "date-fns";

export type VideoData = {
	title: string;
	thumbUrl: string;
	videoId: string;
	date: Date; // TODO: Get type for this
	uploader: string;
}

export default function Video({
	data
}: {
	data: VideoData
}) {
	const posted = formatDistance(data.date, new Date(), { addSuffix: true })
	return (
		<div className="grid grid-cols-[auto_1fr] p-4 gap-4">
			<Link
				href={`https://www.youtube.com/watch?v=${data.videoId}`}
				target="_blank"
				rel="noopener noreferrer"
			>
				<div className="h-[144px] flex items-center overflow-hidden">
					<Image
						src={`https://i.ytimg.com/vi/${data.videoId}/mqdefault.jpg`}
						alt={`Thumbnail for ${data.title}`}
						width={256}
						height={144}
						className="align-middle overflow-hidden"
					/>
				</div>
			</Link>
			<div>
				<h2 className="text-xl">{data.title}</h2>
				<p className="text-normal">
					<span className="text-gray-600">by: </span>
					<Link
						href={`/${data.uploader}`}
						className="hover:underline underline-offset-1 decoration-1"
					>
						{data.uploader}
					</Link>
					<span> - {posted}</span>
				</p>
			</div>
		</div>
	)
}