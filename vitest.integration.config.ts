import path from "node:path";
import { fileURLToPath } from "node:url";
import { defineConfig } from "vitest/config";

const dirname = path.dirname(fileURLToPath(import.meta.url));

/**
 * Separate config for tests that talk to a real local Supabase instance
 * (`supabase start`) instead of pure unit tests. Kept out of the default
 * `vitest run` so CI/unit runs never require a live database.
 */
export default defineConfig({
  resolve: {
    alias: {
      "@": dirname,
    },
  },
  test: {
    environment: "node",
    globals: true,
    include: ["tests/integration/**/*.test.ts"],
    setupFiles: ["tests/integration/setup-env.ts"],
    testTimeout: 30_000,
    hookTimeout: 30_000,
  },
});
