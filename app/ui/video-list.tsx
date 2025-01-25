import Video, { VideoData } from "@/app/ui/video"

// TODO: DB schema

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