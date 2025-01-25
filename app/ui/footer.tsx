import Link from "next/link";

export default function Footer() {
	return (
		<footer>
			Website written and maintained by <Link href="/HumbleHominid" className="hover:underline underline-offset-2 decoration-1">HumbleHominid</Link>.
		</footer>
	)
}