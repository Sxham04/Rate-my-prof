import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    domains: ['www.dituniversity.edu.in'],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'www.dituniversity.edu.in',
        pathname: '/**',
      },
    ],
  },
};



export default nextConfig;