import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  transpilePackages: ["@agentic/ui", "@agentic/schemas", "@agentic/shared"],
};

export default nextConfig;
