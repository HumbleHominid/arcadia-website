import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '*.ytimg.com',
        port: '',
        pathname: '/**',
        search: ''
      },
      {
        protocol: 'https',
        hostname: '*.ggpht.com',
        port: '',
        pathname: '/**',
        search: ''
      }
    ]
  }
};

export default nextConfig;
