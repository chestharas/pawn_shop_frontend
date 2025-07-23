import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  experimental: {
    turbo: undefined,
  },
  // Windows compatibility settings
  distDir: '.next',
  trailingSlash: false,
  // Enable standalone output for Docker
  output: 'standalone',
};

export default nextConfig;
