import type { Metadata } from "next";
import "./globals.css";
import Footer from "@/app/ui/footer";
import { inter } from "@/app/ui/font";
import Image from "next/image";
import { Analytics } from "@vercel/analytics/next";
import Link from "next/link";

export const metadata: Metadata = {
  authors: [{name: 'HumbleHominid', url: 'https://github.com/HumbleHominid'}],
  creator: 'HumbleHominid',
  publisher: 'HumbleHominid',
  applicationName: 'Arcadia Website',
  keywords:['arcadia', 'arcadian', 'minecraft', 'mine', 'craft', 'server', 'smp', 'ArcadiaSMP', 'video', 'videos', 'lets', 'let\'s', 'play'],
  description: 'The official website for Arcadia!',
  alternates: {
    canonical: '/'
  },
  robots: {
    index: true,
    follow: true,
    nocache: false,
    googleBot: {
      index: true,
      follow: true,
      noimageindex: false,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    }
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Arcadia',
    site: '@Arcadia_SMP',
    description: 'The official website for Arcadia!',
    images: ['/images/twitter.png']
  },
  openGraph: {
    title: 'Arcadia',
    description: 'The official website for Arcadia!',
    siteName: 'Arcadia',
    url: '/',
    images: [
      {
        url: '/images/twitter.png',
        secureUrl: '/images/twitter.png',
        type: 'image/png',
        width: 1200,
        height: 630
      }
    ],
    locale: 'en_US',
    type: 'website'
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.className} antialiased w-full grid grid-rows-[1fr] grid-cols-[1fr] justify-items-center`}>
        <Analytics />
        {/* Background image */}
        <Image
          src="/images/background.png"
          width={2560}
          height={1440}
          alt="Arcadia Background Image"
          className="sticky top-0 -z-10 h-screen min-w-full object-cover row-span-full col-span-full"
        />
        <main className="grid grid-rows-[auto_auto_1fr_auto] items-center min-h-screen max-w-5xl row-span-full col-span-full mx-0 my-auto">
          {/* Title Image */}
          <div
            className="w-full md:w-8/12 place-self-center"
          >
            <Link
              href="/"
              className=""
            >
              <Image
                src="/images/banner.png"
                width={1500}
                height={500}
                alt="Arcadia Banner Image"
                className=""
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
