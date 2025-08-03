import type { Metadata } from "next";
import "./globals.css";
import Footer from "@/app/ui/footer";
import { inter } from "@/app/ui/font";
import Image from "next/image";
import { Analytics } from "@vercel/analytics/next";
import Link from "next/link";

const metaDescription =
  "The official website for Arcadia! Come follow along our Minecraft SMP journey as we create stunning builds and whacky games in our blocky world!";

export const metadata: Metadata = {
  title: {
    template: "%s | Arcadia",
    default: "Arcadia",
  },
  authors: [{ name: "HumbleHominid", url: "https://github.com/HumbleHominid" }],
  creator: "HumbleHominid",
  publisher: "HumbleHominid",
  applicationName: "Arcadia Website",
  keywords: [
    "arcadia",
    "arcadian",
    "minecraft",
    "mine",
    "craft",
    "server",
    "smp",
    "ArcadiaSMP",
    "video",
    "videos",
    "lets",
    "let's",
    "play",
  ],
  description: metaDescription,
  alternates: {
    canonical: "/",
  },
  robots: {
    index: true,
    follow: true,
    nocache: false,
    googleBot: {
      index: true,
      follow: true,
      noimageindex: false,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  twitter: {
    card: "summary_large_image",
    title: "Arcadia",
    site: "@Arcadia_SMP",
    description: metaDescription,
    images: ["/images/twitter.png"],
  },
  openGraph: {
    title: "Arcadia",
    description: metaDescription,
    siteName: "Arcadia",
    url: process.env.VERCEL_PROJECT_PRODUCTION_URL
      ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
      : "http://localhost:3000/",
    images: [
      {
        url: "/images/twitter.png",
        secureUrl: "/images/twitter.png",
        type: "image/png",
        width: 1200,
        height: 630,
      },
    ],
    locale: "en_US",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${inter.className} grid w-full grid-cols-[1fr] grid-rows-[1fr] justify-items-center antialiased`}
      >
        <Analytics />
        {/* Background image */}
        <Image
          src="/images/background.png"
          width={2560}
          height={1440}
          alt="Arcadia Background Image"
          className="sticky top-0 -z-10 col-span-full row-span-full h-screen min-w-full object-cover"
        />
        <main className="col-span-full row-span-full mx-0 my-auto grid min-h-screen max-w-5xl grid-rows-[auto_auto_1fr_auto] items-center">
          {/* Title Image */}
          <div className="w-full place-self-center md:w-8/12">
            <Link href="/" className="">
              <Image
                src="/images/banner.png"
                width={1500}
                height={500}
                alt="Arcadia Banner Image"
                className="p-2 md:p-4"
              />
            </Link>
          </div>
          {children}
          {/* Footer */}
          <div className="row-start-4 w-full max-w-5xl p-2">
            <Footer />
          </div>
        </main>
      </body>
    </html>
  );
}
