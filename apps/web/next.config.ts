import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  transpilePackages: ["@vetcloud/contracts", "@vetcloud/shared-kernel", "@vetcloud/ui"],
};

export default nextConfig;
