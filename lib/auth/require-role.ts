import "server-only";
import { createSupabaseServerClient } from "@/lib/supabase/server-client";
import { createSupabaseAdminClient } from "@/lib/supabase/admin-client";
import { ForbiddenError, UnauthorizedError } from "@/lib/errors";
import type { RoleName } from "@/types/domain/enums";
import type { Profile } from "@/types/domain/profile";

export interface AuthContext {
  userId: string;
  email: string | undefined;
  profile: Profile;
  role: RoleName;
}

/**
 * Resolves the current session's profile + role. Uses the admin client only
 * to join `roles` (a public lookup table) for the role name — the profile
 * row itself is still fetched under the caller's own RLS-scoped client.
 */
export async function getAuthContext(): Promise<AuthContext | null> {
  const supabase = await createSupabaseServerClient();
  const { data: userData, error: userError } = await supabase.auth.getUser();

  if (userError || !userData.user) return null;

  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", userData.user.id)
    .single();

  if (profileError || !profile) return null;

  const admin = createSupabaseAdminClient();
  const { data: role } = await admin.from("roles").select("name").eq("id", profile.role_id).single();

  return {
    userId: userData.user.id,
    email: userData.user.email,
    profile,
    role: (role?.name as RoleName) ?? "candidate",
  };
}

/** Throws UnauthorizedError/ForbiddenError — for use in API route handlers. */
export async function requireRole(...roles: RoleName[]): Promise<AuthContext> {
  const ctx = await getAuthContext();
  if (!ctx) throw new UnauthorizedError();
  if (roles.length > 0 && !roles.includes(ctx.role)) {
    throw new ForbiddenError(`This action requires one of the following roles: ${roles.join(", ")}.`);
  }
  return ctx;
}

/** Same as requireRole but returns null instead of throwing — for Server Components. */
export async function requireRoleOrNull(...roles: RoleName[]): Promise<AuthContext | null> {
  const ctx = await getAuthContext();
  if (!ctx) return null;
  if (roles.length > 0 && !roles.includes(ctx.role)) return null;
  return ctx;
}
