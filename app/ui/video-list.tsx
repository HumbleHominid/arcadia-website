import Link from "next/link"
import Video, { VideoData } from "@/app/ui/video"

// TODO: DB schema

export default function VideoList({
	videos = []
}:{
	videos: Array<VideoData>
}) {
	return (
		<div
			className="flex flex-col divide-y p-4"
		>
			{videos.map((video) => {
				return (
					<Video
						key={video.videoId}
						data={video}
					/>
				)})}
		</div>
	)
}