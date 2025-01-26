'use client';

import { default as VideoComp } from "@/app/ui/video";
import { Video } from "@/app/lib/definitions";
import { use } from "react";

export default function VideoList({
	videos
}:{
	videos: Promise<Array<Video>>;
}) {
	const allVideos = use(videos);
	return (
		<div className="flex flex-col w-full divide-y px-2">
			{allVideos.map((video) => {
				return (
					<VideoComp
						key={video.video_id}
						data={video}
					/>
				)})}
		</div>
	)
}