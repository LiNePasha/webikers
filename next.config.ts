import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: false, // Disable double rendering in development
  output: 'standalone',
  images: {
    // Disable optimization to avoid Vercel payment requirement and loader issues
    unoptimized: true,
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'spare2app.com',
        port: '',
        pathname: '/wp-content/uploads/**',
      },
      {
        protocol: 'https',
        hostname: 'spare2app.com',
        port: '',
        pathname: '/wp-content/plugins/**',
      },
      {
        protocol: 'https',
        hostname: 'api.spare2app.com',
        port: '',
        pathname: '/wp-content/uploads/**',
      },
      {
        protocol: 'https',
        hostname: 'api.spare2app.com',
        port: '',
        pathname: '/wp-content/plugins/**',
      },
      {
        protocol: 'https',
        hostname: 'res.cloudinary.com',
        port: '',
        pathname: '/**',
      },
    ],
    // Performance optimizations
    formats: ['image/avif', 'image/webp'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    minimumCacheTTL: 60,
    dangerouslyAllowSVG: true,
    contentDispositionType: 'attachment',
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
  },
};

export default nextConfig;
