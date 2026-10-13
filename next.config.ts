import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  devIndicators: false,
  productionBrowserSourceMaps: false,
  poweredByHeader: false,
  compress: true,
  experimental: {
    optimizePackageImports: ["lucide-react"],
  },
  images: {
    formats: ["image/avif", "image/webp"],
  },
};

export default nextConfig;
