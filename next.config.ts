import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // This tells Vercel to build even if there are TypeScript errors
  typescript: {
    ignoreBuildErrors: true,
  },
  // This tells Vercel to build even if there are ESLint warnings
  eslint: {
    ignoreDuringBuilds: true,
  },
};

export default nextConfig;