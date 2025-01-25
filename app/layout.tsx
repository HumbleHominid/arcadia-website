import type { Metadata } from "next";
import "./globals.css";
import Footer from "@/app/ui/footer";
import { inter } from "@/app/ui/font";
import Image from "next/image";
import { Analytics } from "@vercel/analytics/next";
import Link from "next/link";

export const metadata: Metadata = {
  title: {
    template: "%s | ArcadiaSMP",
    default: "Arcadia"
  },
  description: "The official website for ArcadiaSMP!",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.className} antialiased w-full grid items-center justify-items-center`}>
        <Analytics />
        <main className="grid grid-rows-[auto_auto_1fr_auto] items-center justify-items-center min-h-screen max-w-5xl">
          {/* Title Image */}
          <Link
            href="/"
          >
            <Image
              src="/images/banner.png"
              width={1500}
              height={500}
              alt="Arcadia Banner Image"
            />
          </Link>
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
