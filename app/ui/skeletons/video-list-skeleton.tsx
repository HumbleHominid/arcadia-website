import VideoSkeleton from "@/app/ui/skeletons/video-skeleton"

export default function VideoListSkeleton() {
	return (
			<div className="flex flex-col w-full divide-y px-2">
				{[...Array(4).keys()].map((val) => {
					return (
						<VideoSkeleton key={val} />
					)})}
			</div>
	)
}