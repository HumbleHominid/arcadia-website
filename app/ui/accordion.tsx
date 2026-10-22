import { Bars3Icon } from "@heroicons/react/16/solid";

export default function Accordion({
  title,
  isExpandedDefault = false,
  children,
}: {
  title: string;
  isExpandedDefault?: boolean;
  children: React.ReactNode;
}) {
  return (
    <details
      open={isExpandedDefault}
      className="group divide-gray-200 rounded-sm bg-white p-1 drop-shadow-sm [interpolate-size:allow-keywords] details-content:h-0 details-content:overflow-hidden details-content:transition-[height,content-visibility] details-content:transition-discrete open:divide-y open:details-content:h-auto md:p-2 md:drop-shadow-md"
    >
      <summary className="flex min-h-8 list-none items-center gap-4 transition-[padding] select-none group-open:pb-1 hover:cursor-pointer md:min-h-0 md:group-open:pb-2 [&::-webkit-details-marker]:hidden">
        <Bars3Icon width={20} height={20} className="h-auto w-4 md:w-5" />
        <span className="text-base md:text-xl">{title}</span>
      </summary>
      <div className="divide-y divide-gray-200">{children}</div>
    </details>
  );
}
