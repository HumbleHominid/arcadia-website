import Image from "next/image";
import Link from "next/link";
import { formatDistance } from "date-fns";
import { Video as VideoData } from "@/app/lib/definitions";

export default function Video({ data }: { data: VideoData }) {
  const posted = formatDistance(new Date(data.publish_date), new Date(), {
    addSuffix: true,
  });
  let duration = data.duration
    .replace("PT", "")
    .replace("P", "")
    .replace("D", ":")
    .replace("H", ":")
    .replace("M", ":")
    .replace("S", "")
    .split(":")
    .map((t) => {
      const s = "00" + t;
      return s.substring(s.length - 2);
    })
    .join(":")
    .replace(/^0+/, "");
  // If the video is less than a minute, prepend a '0:'
  if (duration.split(":").length === 1) {
    duration = "0:" + duration;
  }
  // If we still have a leading colon something is really wrong so just set the time to 00:00
  if (duration.charAt(0) === ":") {
    duration = "00:00";
  }
  // Strip hashtags if people put them in the title (this is really only here for shorts)
  const title = data.title.replace(/#([^0-9]+)/g, "").trim();

  return (
    <div className="grid grid-cols-[auto_1fr] gap-4 py-2">
      <Link
        href={`https://youtu.be/${data.video_id}`}
        target="_blank"
        rel="noopener noreferrer"
        className="self-center"
      >
        <div className={"relative w-[160px] overflow-hidden md:w-[200px]"}>
          <Image
            src={`https://i.ytimg.com/vi/${data.video_id}/mqdefault.jpg`}
            alt={`Thumbnail for ${title}`}
            width={256}
            height={144}
            className="overflow-hidden align-middle"
          />
          {/* The duration stamp */}
          <span className="absolute bottom-0 right-0 mb-1 mr-1 bg-slate-800 bg-opacity-60 px-1 text-xs text-white">
            {duration}
          </span>
        </div>
      </Link>
      <div>
        <h2 className="sm:text-md text-sm md:text-xl">{title}</h2>
        <p className="text-xs sm:text-sm md:text-base">
          <span className="text-gray-600">by: </span>
          <Link
            href={`/member/${data.uploader_handle}`}
            className="decoration-1 underline-offset-1 hover:underline"
          >
            {data.uploader_name}
          </Link>
          <span> - {posted}</span>
        </p>
      </div>
    </div>
  );
}
