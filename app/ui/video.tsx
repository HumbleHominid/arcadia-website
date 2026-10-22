import Image from "next/image";
import Link from "next/link";
import { Video as VideoData } from "@/app/lib/definitions";

const rtf = new Intl.RelativeTimeFormat("en", { numeric: "auto" });
const UNITS: Array<[Intl.RelativeTimeFormatUnit, number]> = [
  ["year", 31536000],
  ["month", 2592000],
  ["week", 604800],
  ["day", 86400],
  ["hour", 3600],
  ["minute", 60],
];

function timeAgo(date: Date) {
  const secs = (date.getTime() - Date.now()) / 1000;
  const [unit, size] = UNITS.find(([, s]) => Math.abs(secs) >= s) ?? [
    "second",
    1,
  ];
  return rtf.format(Math.trunc(secs / size), unit);
}

// ISO-8601 duration (PT1H2M3S, P1DT2H) -> 1:02:03 / 4:05 / 0:45
function formatDuration(iso: string) {
  const [d, h, m, s] = ["D", "H", "M", "S"].map((u) =>
    Number(iso.match(new RegExp(`(\\d+)${u}`))?.[1] ?? 0),
  );
  const hours = d * 24 + h;
  const pad = (n: number) => String(n).padStart(2, "0");
  return hours ? `${hours}:${pad(m)}:${pad(s)}` : `${m}:${pad(s)}`;
}

export default function Video({ data }: { data: VideoData }) {
  const posted = timeAgo(new Date(data.publish_date));
  const duration = formatDuration(data.duration);
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
            unoptimized
          />
          {/* The duration stamp */}
          <span className="absolute right-0 bottom-0 mr-1 mb-1 bg-slate-800/60 px-1 text-xs text-white">
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
            className="-my-1 inline-block py-1 decoration-1 underline-offset-1 hover:underline"
          >
            {data.uploader_name}
          </Link>
          <span> - {posted}</span>
        </p>
      </div>
    </div>
  );
}
