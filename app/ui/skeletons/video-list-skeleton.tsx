import VideoSkeleton from "@/app/ui/skeletons/video-skeleton";

export default function VideoListSkeleton() {
  return (
    <div className="flex w-full flex-col divide-y px-2">
      {[...Array(10).keys()].map((val) => {
        return <VideoSkeleton key={val} />;
      })}
    </div>
  );
}
