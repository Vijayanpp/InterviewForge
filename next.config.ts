import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Produces a minimal `.next/standalone` server bundle with only the
  // dependencies actually used at runtime — keeps the production Docker
  // image small (see docker/Dockerfile).
  output: "standalone",
};

export default nextConfig;
