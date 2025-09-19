import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
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
