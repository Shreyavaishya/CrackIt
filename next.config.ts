import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  webpack(config) {
    config.ignoreWarnings = [
      // Suppress Firebase and Google Cloud source map warnings
      /Failed to parse source map/,
    ];
    return config;
  },
};

export default nextConfig;
