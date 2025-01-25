import type { Metadata } from "next";
import "./globals.css";
import Footer from "@/app/ui/footer";
import { inter } from "@/app/ui/font";

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
      <body
        className={`${inter.className} antialiased`}
      >
        {children}
        <Footer />
      </body>
    </html>
  );
}
