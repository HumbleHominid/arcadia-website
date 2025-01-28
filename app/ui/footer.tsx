import Link from "next/link";

export default function Footer() {
	return (
		<footer className="rounded-sm px-4 py-2 bg-slate-50 text-slate-800 drop-shadow-sm text-center">
			Website written and maintained by <Link href="/member/@humblehominid" className="hover:underline underline-offset-2 decoration-1">HumbleHominid</Link>.
		</footer>
	)
}