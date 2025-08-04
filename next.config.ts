import type { NextConfig } from "next";

// Auto-detect basePath from GitHub repository name
const getBasePath = () => {
  if (process.env.NODE_ENV !== 'production') {
    return undefined; // No basePath in development
  }
  
  // Try to get from GitHub environment
  const ghRepo = process.env.GITHUB_REPOSITORY?.split('/')[1];
  if (ghRepo && process.env.GITHUB_ACTIONS) {
    return `/${ghRepo}`;
  }
  
  // Check for custom basePath environment variable
  if (process.env.NEXT_PUBLIC_BASE_PATH) {
    return process.env.NEXT_PUBLIC_BASE_PATH;
  }
  
  // No basePath for other production deployments
  return undefined;
};

const basePath = getBasePath();

const nextConfig: NextConfig = {
  // Enable static export only for production build
  ...(process.env.NODE_ENV === 'production' && { output: 'export' }),
  
  // Configure basePath automatically for GitHub Pages
  ...(basePath && { basePath }),
  
  // Disable server-side image optimization for static export
  images: {
    unoptimized: true,
  },
  
  // Add trailing slash for better GitHub Pages compatibility in production
  ...(process.env.NODE_ENV === 'production' && { trailingSlash: true }),
  
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
