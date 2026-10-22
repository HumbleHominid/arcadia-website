import { Metadata } from "next";
import PageLayout from "@/app/ui/page-layout";
import Link from "next/link";
import { externalSites, siteUrl } from "@/app/lib/external-sites";

export const metadata: Metadata = {
  title: "Privacy & Terms",
};

export default function Page() {
  const hostname = new URL(siteUrl).host;
  return (
    <PageLayout>
      <div className="w-full rounded-sm bg-white p-4 drop-shadow-sm md:drop-shadow-xl">
        <h1 className="mb-4 text-4xl font-thin md:text-6xl">
          Privacy Policy &amp; Terms of Use
        </h1>
        <h2 id="terms" className="mb-2 text-xl font-light">
          Terms of Use
        </h2>
        <p className="mb-4 text-sm md:text-base">
          By using {hostname} users are agreeing to be bound by the{" "}
          <Link
            href="https://www.youtube.com/t/terms"
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-700 decoration-1 underline-offset-1 hover:underline"
          >
            YouTube Terms of Service
          </Link>
          .
        </p>
        <h2 className="mb-2 text-xl font-light">YouTube Client API</h2>
        <p className="text-sm md:text-base">
          {hostname} uses a YouTube API Client that uses YouTube API Services.
          The API Client is internal and does not use visitor information. It
          retrieves publicly available data about our members&apos; YouTube
          channels and videos and stores this data in its database to display it
          on this website. The data is refreshed daily, and data for videos or
          channels removed from YouTube is deleted.
        </p>
        <p className="mb-4">
          <Link
            href="https://www.youtube.com/t/terms"
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs text-blue-700 decoration-1 underline-offset-1 hover:underline md:text-sm"
          >
            YouTube Terms of Service
          </Link>
          <br />
          <Link
            href="https://policies.google.com/privacy"
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs text-blue-700 decoration-1 underline-offset-1 hover:underline md:text-sm"
          >
            Google Privacy Policy
          </Link>
        </p>
        <h2 className="mb-2 text-xl font-light">Analytics</h2>
        <p className="mb-4 text-sm md:text-base">
          {hostname} uses Vercel Web Analytics to count page views. It does not
          use third-party cookies or collect personal identifiers. It records
          anonymous data such as the page visited, referrer, browser, operating
          system, device type and approximate location, used only for aggregated
          statistics. Visitors are counted using a hash of the request that is
          discarded after 24 hours.
        </p>
        <h2 className="mb-2 text-xl font-light">Contact</h2>
        <p className="text-sm md:text-base">
          Send questions, complaints or requests to remove data through the{" "}
          <Link
            href={externalSites.discord}
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-700 decoration-1 underline-offset-1 hover:underline"
          >
            Arcadia Discord
          </Link>
          . Removal requests are handled within 7 days.
        </p>
      </div>
    </PageLayout>
  );
}
