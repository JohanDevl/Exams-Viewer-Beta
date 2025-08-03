import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Enable static export for GitHub Pages
  output: 'export',
  
  // Configure basePath for GitHub Pages (repository name)
  basePath: '/Exams-Viewer-Beta',
  
  // Disable server-side image optimization for static export
  images: {
    unoptimized: true,
  },
  
  // Add trailing slash for better GitHub Pages compatibility
  trailingSlash: true,
  
  typescript: {
    // Allow build to complete even with TypeScript warnings (not errors)
    ignoreBuildErrors: false,
  },
  eslint: {
    // Allow build to complete even with ESLint warnings
    ignoreDuringBuilds: false,
  },
  
  // Enable experimental features for better performance
  experimental: {
    optimizePackageImports: ['lucide-react'],
  },
};

export default nextConfig;
