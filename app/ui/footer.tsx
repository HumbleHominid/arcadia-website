import Link from "next/link";

export default function Footer() {
  return (
    <footer className="flex flex-col items-center rounded-sm bg-slate-50 px-4 py-2 text-slate-800 drop-shadow-sm">
      <span className="text-sm md:text-lg">
        <Link
          href="/privacy"
          className="decoration-1 underline-offset-2 hover:underline"
        >
          Privacy Policy
        </Link>
      </span>
      <span className="text-xs md:text-base">
        Website written and maintained by{" "}
        <Link
          href="/member/@humblehominid"
          className="decoration-1 underline-offset-2 hover:underline"
        >
          HumbleHominid
        </Link>
        .
      </span>
    </footer>
  );
}
