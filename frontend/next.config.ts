import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  reactStrictMode: true,
  eslint: {
    ignoreDuringBuilds: true,
  },
  // Skip type checking during build
  typescript: {
    ignoreBuildErrors: true,
  },
  // Configure environment variables
  env: {
    // Local authentication is now used instead of Firebase
    API_URL: process.env.API_URL || 'http://localhost:23001/api',
  },
};

export default nextConfig;
