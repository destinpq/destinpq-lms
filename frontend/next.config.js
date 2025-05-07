/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  output: 'standalone',
  eslint: {
    ignoreDuringBuilds: true,
  },
  // Skip type checking during build for faster deployments
  typescript: {
    ignoreBuildErrors: true,
  },
  // Configure environment variables
  env: {
    // The API URL will come from environment variables
    API_URL: process.env.NEXT_PUBLIC_API_URL || 'https://polar-lowlands-49166-189f8996c2e7.herokuapp.com/lms',
  },
};

module.exports = nextConfig; 