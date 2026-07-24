import fs from "node:fs";
import path from "node:path";

/**
 * Integration tests hit a real local Supabase instance (`supabase start`),
 * so they need the same env vars as the app. Next.js loads `.env.local`
 * automatically for the dev/build server, but a standalone Vitest process
 * does not — load it here with a tiny hand-rolled parser rather than
 * pulling in a whole dotenv dependency for a handful of `KEY=VALUE` lines.
 */
function loadEnvLocal() {
  const envPath = path.resolve(__dirname, "../../.env.local");
  if (!fs.existsSync(envPath)) return;

  const contents = fs.readFileSync(envPath, "utf8");
  for (const rawLine of contents.split("\n")) {
    const line = rawLine.trim();
    if (!line || line.startsWith("#")) continue;

    const equalsIndex = line.indexOf("=");
    if (equalsIndex === -1) continue;

    const key = line.slice(0, equalsIndex).trim();
    let value = line.slice(equalsIndex + 1).trim();
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }

    if (process.env[key] === undefined) {
      process.env[key] = value;
    }
  }
}

loadEnvLocal();
