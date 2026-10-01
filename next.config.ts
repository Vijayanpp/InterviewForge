import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Produces a minimal `.next/standalone` server bundle with only the
  // dependencies actually used at runtime — keeps the production Docker
  // image small (see docker/Dockerfile).
  output: "standalone",
  // Keep LangGraph / LangChain on the server. Never ship them to the client bundle.
  serverExternalPackages: [
    "@langchain/core",
    "@langchain/langgraph",
    "@langchain/openai",
    "langsmith",
  ],
};

export default nextConfig;
