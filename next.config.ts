import type { NextConfig } from "next";
import { externalSites as ES } from "@/app/lib/external-sites";

const nextConfig: NextConfig = {
  images: {
    minimumCacheTTL: 24 * 60 * 60,
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
