import { Metadata } from "next";
import PageLayout from "@/app/ui/page-layout";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Privacy",
};

export default function Page() {
  let hostname: string = "";
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
      hostname = "localhost:3000";
  }
  return (
    <PageLayout>
      <div className="w-full rounded-sm bg-white p-4 drop-shadow-sm md:drop-shadow-xl">
        <h1 className="mb-4 text-4xl font-thin md:text-6xl">Privacy Policy</h1>
        <h2 className="mb-2 text-xl font-light">YouTube Client API</h2>
        <p className="text-sm md:text-base">
          {hostname} uses a YouTube API Client that uses YouTube API Services.
          By using {hostname} users are agreeing to be bound by the YouTube
          Terms of Service. The API Client is internal and does not use visitor
          information. The API Client retrieves publicly accessible data about
          videos and stores this data in it&apos;s database. This information is
          used to display video information on this website and is not shared
          externally.
        </p>
        <p>
          <Link
            href="https://www.youtube.com/t/terms"
            target="_blank"
            className="text-xs text-blue-700 decoration-1 underline-offset-1 hover:underline md:text-sm"
          >
            Youtube&apos;s Terms of Service
          </Link>
          <br />
          <Link
            href="https://www.google.com/policies/privacy"
            target="_blank"
            className="text-xs text-blue-700 decoration-1 underline-offset-1 hover:underline md:text-sm"
          >
            Google Privacy Policy
          </Link>
        </p>
      </div>
    </PageLayout>
  );
}
