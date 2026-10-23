import clsx from "clsx";
import { PIP } from "./config";

type Props = {
  active: boolean;
  cycle: number;
  ms: number;
  label: string;
  onClick: () => void;
  onDone: () => void;
};

// Outer edge of the progress ring; the viewBox is centered on the pip
const half = PIP.r + PIP.s / 2 + PIP.p;

// Pause on hover and on keyboard focus. Not focus-within: a clicked pip keeps focus and
// would stay paused. Tailwind's hover: only applies on devices that can hover.
const progressClass = clsx(
  "announcement-progress",
  "group-hover:[animation-play-state:paused] group-focus-visible:[animation-play-state:paused] group-has-[:focus-visible]:[animation-play-state:paused]",
);

export default function Pip({
  active,
  cycle,
  ms,
  label,
  onClick,
  onDone,
}: Props) {
  return (
    <button
      type="button"
      aria-label={label}
      aria-current={active}
      onClick={onClick}
      className="cursor-pointer p-1"
    >
      <svg
        viewBox={`${-half} ${-half} ${half * 2} ${half * 2}`}
        className="size-4 text-white drop-shadow-sm"
        aria-hidden
      >
        <circle
          r={PIP.r}
          fill={active ? "currentColor" : "none"}
          stroke="currentColor"
          strokeWidth={PIP.s}
        />
        {active && (
          <circle
            key={cycle}
            className={progressClass}
            style={{ "--announcement-ms": `${ms}ms` } as React.CSSProperties}
            r={PIP.r + PIP.s / 2 + PIP.p / 2}
            fill="none"
            stroke="currentColor"
            strokeWidth={PIP.p}
            pathLength={1}
            strokeDasharray={1}
            transform="rotate(-90)"
            onAnimationEnd={onDone}
          />
        )}
      </svg>
    </button>
  );
}
