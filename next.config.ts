import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  images: {
    remotePatterns: [
      new URL("https://img.clerk.com/*"),
      new URL("https://images.clerk.dev/uploaded/*"),
      new URL("https://fearless-dodo-165.convex.cloud/api/storage/*"),
    ],
  },
};

export default nextConfig;
