import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/types/database";
import { getServerEnv } from "@/lib/env";

/**
 * Privileged Supabase client using the service-role key. This BYPASSES
 * Row Level Security entirely.
 *
 * Rules:
 *  - Server-only. Never import this file from a Client Component or any
 *    module that could be bundled for the browser.
 *  - Only use inside route handlers / services that have already performed
 *    an explicit authorization check (e.g. admin role verification, DB
 *    triggers, background jobs).
 *  - Prefer the regular server client (`createSupabaseServerClient`) which
 *    is scoped by RLS; reach for this only when RLS cannot express the
 *    required operation (e.g. writing audit logs, cross-user admin edits).
 */
export function createSupabaseAdminClient() {
  const env = getServerEnv();
  return createClient<Database>(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}
