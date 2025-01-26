export default function VideoSkeleton() {
	return (
		<div className="grid grid-cols-[auto_1fr] py-2 gap-4 tran animate-pulse">
			{/* Skeleton video image */}
			<div className="w-[160px] h-[90px] md:w-[200px] md:h-[112.5px] bg-slate-300" />
			<div>
				{/* Skeleton title */}
				<div className="h-5 md:h-6 w-10/12 bg-slate-300 rounded-md mb-2" />
				{/* Skeleton by */}
				<div className="h-4 md:h-5 w-7/12 bg-slate-300 rounded-md" />
			</div>
		</div>
	)
}