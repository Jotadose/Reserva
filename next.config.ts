import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  // Disable ESLint during build for faster deployment
  eslint: {
    ignoreDuringBuilds: true,
  },
  // Set output file tracing root to silence workspace warning
  outputFileTracingRoot: __dirname,
  // Exclude api-backend directory from Next.js compilation
  webpack: (config, { isServer }) => {
    config.watchOptions = {
      ...config.watchOptions,
      ignored: ['**/api-backend/**', '**/node_modules/**'],
    };
    return config;
  },
};

export default nextConfig;
