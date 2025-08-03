import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  typescript: {
    // Allow build to complete even with TypeScript warnings (not errors)
    ignoreBuildErrors: false,
  },
  eslint: {
    // Allow build to complete even with ESLint warnings
    ignoreDuringBuilds: false,
  },
  // Add support for static assets caching
  async headers() {
    return [
      {
        source: '/data/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=3600, stale-while-revalidate=86400',
          },
        ],
      },
    ];
  },
  // Enable experimental features for better performance
  experimental: {
    optimizePackageImports: ['lucide-react'],
  },
};

export default nextConfig;
