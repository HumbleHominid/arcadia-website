import { Metadata } from "next";
import PageLayout from "@/app/ui/page-layout";
import Link from "next/link";

export const metadata: Metadata = {
	title: 'Privacy'
}

export default function Page() {
	let hostname: string = '';
	switch (process.env.NODE_ENV) {
		case "production":
			const vercelUrl = process.env.VERCEL_PROJECT_PRODUCTION_URL;
			if (vercelUrl) {
				hostname = vercelUrl;
				break;
			}
		// fallthrough intended
		case "development":
		case "test":
		default:
			hostname = "localhost:3000"
	}
	return (
		<PageLayout>
			<div className="w-full bg-white rounded-sm drop-shadow-sm md:drop-shadow-xl p-4">
				<h1 className="text-4xl md:text-6xl font-thin mb-4">Privacy Policy</h1>
				<h2 className="text-xl font-light mb-2">YouTube Client API</h2>
				<p className="text-sm md:text-base">{hostname} uses a YouTube API Client that uses YouTube API Services. By using {hostname} users are agreeing to be bound by the YouTube Terms of Service. The API Client is internal and does not use visitor information. The API Client retrieves publicly accessible data about videos and stores this data in it&apos;s database. This information is used to display video information on this website and is not shared externally.</p>
				<p>
					<Link
						href="https://www.youtube.com/t/terms"
						target="_blank"
						className="text-blue-700 hover:underline underline-offset-1 decoration-1 text-xs md:text-sm"
					>
						Youtube&apos;s Terms of Service
					</Link>
					<br/>
					<Link
						href="https://www.google.com/policies/privacy"
						target="_blank"
						className="text-blue-700 hover:underline underline-offset-1 decoration-1 text-xs md:text-sm"
					>
						Google Privacy Policy
					</Link>
				</p>
			</div>
		</PageLayout>
	)
}