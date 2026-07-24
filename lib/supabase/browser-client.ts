"use client";

import { createBrowserClient } from "@supabase/ssr";
import type { Database } from "@/types/database";
import { getClientEnv } from "@/lib/env";

/**
 * Supabase client for Client Components. Uses only the anon key — RLS is
 * the enforcement boundary for every query made through this client.
 */
export function createSupabaseBrowserClient() {
  const env = getClientEnv();
  return createBrowserClient<Database>(
    env.NEXT_PUBLIC_SUPABASE_URL,
    env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  );
}
