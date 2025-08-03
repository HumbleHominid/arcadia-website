export default function VideoSkeleton() {
  const titleSizes = ["w-10/12", "w-9/12", "w-8/12"];
  const uploaderSizes = ["w-8/12", "w-7/12", "w-6/12"];
  const getRandomEntry = (arr: string[]) =>
    arr[Math.floor(Math.random() * arr.length)];
  return (
    <div className="tran grid animate-pulse grid-cols-[auto_1fr] gap-4 py-2">
      {/* Skeleton video image */}
      <div className="h-[90px] w-[160px] bg-slate-300 md:h-[112.5px] md:w-[200px]" />
      <div>
        {/* Skeleton title */}
        <div
          className={`h-5 md:h-6 ${getRandomEntry(titleSizes)} mb-2 rounded-md bg-slate-300`}
        />
        {/* Skeleton uploader */}
        <div
          className={`h-4 md:h-5 ${getRandomEntry(uploaderSizes)} rounded-md bg-slate-300`}
        />
      </div>
    </div>
  );
}
