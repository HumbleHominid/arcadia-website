import VideoFilterSelection from "@/app/ui/video-filter/video-filter-selection";
import { FilterType } from "@/app/lib/definitions";

export default function VideoFilter() {
  const filters = [FilterType.Latest, FilterType.All, FilterType.Arcadia];
  return (
    <div className="my-2 flex h-7 w-full justify-evenly divide-x px-2 drop-shadow-md hover:cursor-pointer sm:h-8 md:h-10 md:w-8/12">
      {filters.map((filter) => {
        return <VideoFilterSelection key={filter} filter={filter} />;
      })}
    </div>
  );
}
