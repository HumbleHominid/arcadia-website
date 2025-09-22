import type { NextConfig } from "next";
import { externalSites as ES } from "@/app/lib/external-sites";

const nextConfig: NextConfig = {
  /* config options here */
  images: {
    minimumCacheTTL: 24 * 60 * 60,
    remotePatterns: [
      {
        protocol: "https",
        hostname: "*.ytimg.com",
        port: "",
        pathname: "/**",
        search: "",
      },
      {
        protocol: "https",
        hostname: "*.ggpht.com",
        port: "",
        pathname: "/**",
        search: "",
      },
    ],
  },
  async redirects() {
    return [
      {
        source: "/discord",
        destination: ES.discord,
        permanent: false,
      },
    ];
  },
};

export default nextConfig;
