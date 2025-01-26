export default function VideoSkeleton() {
	const titleSizes = ["w-10/12", "w-9/12", "w-8/12"];
	const uploaderSizes = ["w-8/12", "w-7/12", "w-6/12"]
	const getRandomEntry = (arr:string[]) => arr[Math.floor(Math.random()*arr.length)]
	return (
		<div className="grid grid-cols-[auto_1fr] py-2 gap-4 tran animate-pulse">
			{/* Skeleton video image */}
			<div className="w-[160px] h-[90px] md:w-[200px] md:h-[112.5px] bg-slate-300" />
			<div>
				{/* Skeleton title */}
				<div className={`h-5 md:h-6 ${getRandomEntry(titleSizes)} bg-slate-300 rounded-md mb-2`} />
				{/* Skeleton uploader */}
				<div className={`h-4 md:h-5 ${getRandomEntry(uploaderSizes)} bg-slate-300 rounded-md`} />
			</div>
		</div>
	)
}