#!/usr/bin/env node
/**
 * Runs every `supabase/seed/*.sql` file (in filename order) against the
 * local Supabase Postgres database. All seed files use
 * `on conflict do nothing`, so this is safe to re-run at any time.
 *
 * `supabase db query --file` only supports a single statement per call, so
 * multi-statement seed files are piped straight into `psql` inside the
 * local Supabase Postgres container instead (the same container
 * `supabase db reset` uses under the hood).
 *
 * Usage: node scripts/seed.mjs
 */
import { readdirSync, readFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { spawnSync } from "node:child_process";

const projectRoot = dirname(dirname(fileURLToPath(import.meta.url)));
const seedDir = join(projectRoot, "supabase", "seed");
const configPath = join(projectRoot, "supabase", "config.toml");

function getProjectId() {
  const config = readFileSync(configPath, "utf8");
  const match = config.match(/^project_id\s*=\s*"([^"]+)"/m);
  if (!match) throw new Error("Could not find project_id in supabase/config.toml");
  return match[1];
}

const containerName = `supabase_db_${getProjectId()}`;

const seedFiles = readdirSync(seedDir)
  .filter((file) => file.endsWith(".sql"))
  .sort();

if (seedFiles.length === 0) {
  console.log("No seed files found in supabase/seed — nothing to do.");
  process.exit(0);
}

console.log(`Seeding local database (container: ${containerName}) from ${seedFiles.length} file(s):`);

for (const file of seedFiles) {
  const fullPath = join(seedDir, file);
  console.log(`  -> ${file}`);

  const sql = readFileSync(fullPath, "utf8");
  const result = spawnSync(
    "docker",
    ["exec", "-i", containerName, "psql", "-U", "postgres", "-d", "postgres", "-v", "ON_ERROR_STOP=1"],
    { input: sql, stdio: ["pipe", "inherit", "inherit"] }
  );

  if (result.error) {
    console.error(
      `Could not run docker exec — is the local Supabase stack running? (npm run db:start)\n${result.error.message}`
    );
    process.exit(1);
  }

  if (result.status !== 0) {
    console.error(`Seed file failed: ${file}`);
    process.exit(result.status ?? 1);
  }
}

console.log("Seed complete.");
