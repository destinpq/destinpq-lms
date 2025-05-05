/** @type {import('next').NextConfig} */
const nextConfig = {
  /* config options here */
  basePath: process.env.NODE_ENV === 'production' ? '/lms' : '',
  assetPrefix: process.env.NODE_ENV === 'production' ? '/lms' : '',
  trailingSlash: true, // Add trailing slashes to all routes for consistency
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
    API_URL: process.env.API_URL || 'http://localhost:4001',
    NEXT_PUBLIC_BASE_PATH: process.env.NODE_ENV === 'production' ? '/lms' : '', // Make basePath available to client
  },
  // Add image configuration
  images: {
    unoptimized: true, // Disable image optimization for development
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'drakanksha.co',
      },
    ],
  },
  // Ensure client-side navigation works with basePath
  async rewrites() {
    return [
      {
        source: '/lms/:path*',
        destination: '/:path*',
      },
    ];
  },
  experimental: {
    // Improve error handling for React components
    largePageDataBytes: 128 * 100000, // Increase limit for large page data
  },
  // Add custom webpack config for better error highlighting
  webpack: (config, { dev, isServer }) => {
    if (dev && !isServer) {
      // Improve error messages in development
      config.devtool = 'eval-source-map';
    }
    return config;
  },
};

module.exports = nextConfig; 