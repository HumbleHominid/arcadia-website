import Video from "@/app/ui/video"
import { Video as VideoData } from "@/app/lib/definitions";

export default function VideoList({
	videos = []
}:{
	videos: Array<VideoData>
}) {
	return (
		<div className="flex flex-col divide-y p-4 bg-white rounded-sm drop-shadow-sm md:drop-shadow-xl">
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