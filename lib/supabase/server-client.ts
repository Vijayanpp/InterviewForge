import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import type { Database } from "@/types/database";
import { getServerEnv } from "@/lib/env";

/**
 * Supabase client for Server Components, Server Actions, and Route
 * Handlers. Reads/writes the session via Next.js cookies and is subject
 * to RLS via the anon key + the caller's session, never the service role.
 */
export async function createSupabaseServerClient() {
  const env = getServerEnv();
  const cookieStore = await cookies();

  return createServerClient<Database>(
    env.NEXT_PUBLIC_SUPABASE_URL,
    env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            for (const { name, value, options } of cookiesToSet) {
              cookieStore.set(name, value, options);
            }
          } catch {
            // Called from a Server Component render pass where cookies are
            // read-only; middleware.ts is responsible for refreshing the
            // session cookie in that case.
          }
        },
      },
    }
  );
}
