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
	return (
		<div className="grid grid-cols-[auto_1fr] py-2 gap-4">
			<Link
				href={`https://www.youtube.com/watch?v=${data.video_id}`}
				target="_blank"
				rel="noopener noreferrer"
			>
				<div className={"w-[160px] md:w-[200px] md: flex items-center overflow-hidden"}
				>
					<Image
						src={`https://i.ytimg.com/vi/${data.video_id}/mqdefault.jpg`}
						alt={`Thumbnail for ${data.title}`}
						width={256}
						height={144}
						className="align-middle overflow-hidden"
					/>
				</div>
			</Link>
			<div>
				<h2 className="text-md md:text-xl">{data.title}</h2>
				<p className="text-sm md:text-base">
					<span className="text-gray-600">by: </span>
					<Link
						href={`/member/${data.uploader}`}
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