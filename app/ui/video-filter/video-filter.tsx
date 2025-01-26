import VideoFilterSelection from "@/app/ui/video-filter/video-filter-selection";
import { FilterType } from "@/app/lib/definitions";

export default function VideoFilter() {
	const filters = [
		FilterType.Latest,
		FilterType.All,
		FilterType.Arcadia
	];
	return (
		<div className="flex h-10 w-full md:w-8/12 my-2 px-2 divide-x hover:cursor-pointer justify-evenly drop-shadow-md">
			{filters.map((filter) => {
				return (
					<VideoFilterSelection key={filter} filter={filter} />
				);
			})}
		</div>
	)
}