import Link from "next/link";

export default function Footer() {
	return (
		<footer className="flex flex-col items-center rounded-sm px-4 py-2 bg-slate-50 text-slate-800 drop-shadow-sm">
			<span className="text-sm md:text-lg">
				<Link href="/privacy" className="hover:underline underline-offset-2 decoration-1">Privacy Policy</Link>
			</span>
			<span className="text-xs md:text-base">
				Website written and maintained by <Link href="/member/@humblehominid" className="hover:underline underline-offset-2 decoration-1">HumbleHominid</Link>.
			</span>
		</footer>
	)
}