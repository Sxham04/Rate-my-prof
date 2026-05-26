import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
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