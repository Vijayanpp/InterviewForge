import { NextResponse, type NextRequest } from "next/server";
import { getPublicAppOriginFromRequest } from "@/lib/app-url";
import { updateSupabaseSession } from "@/lib/supabase/middleware-client";

const PUBLIC_PATHS = [
  "/",
  "/login",
  "/register",
  "/forgot-password",
  "/reset-password",
  "/features",
  "/technologies",
  "/pricing",
  "/about",
  "/contact",
  "/privacy",
  "/terms",
  "/robots.txt",
  "/sitemap.xml",
  "/manifest.webmanifest",
  "/llms.txt",
];

const ROLE_ROUTE_PREFIXES: Record<string, "candidate" | "interviewer" | "admin"> = {
  "/dashboard": "candidate",
  "/onboarding": "candidate",
  "/interviews": "candidate",
  "/practice": "candidate",
  "/profile": "candidate",
  "/settings": "candidate",
  "/become-recruiter": "candidate",
  "/recruiter": "interviewer",
  "/admin": "admin",
};

function isPublicPath(pathname: string): boolean {
  if (PUBLIC_PATHS.includes(pathname)) return true;
  if (pathname.startsWith("/auth/")) return true;
  if (pathname.startsWith("/invite/")) return true;
  if (pathname.startsWith("/_next") || pathname.startsWith("/api/")) return true;
  if (pathname.match(/\.(png|jpg|jpeg|svg|ico|css|js|map|webmanifest|txt)$/)) return true;
  if (pathname.startsWith("/opengraph-image") || pathname.startsWith("/icon") || pathname.startsWith("/apple-icon")) {
    return true;
  }
  return false;
}

function matchProtectedPrefix(pathname: string): "candidate" | "interviewer" | "admin" | null {
  for (const [prefix, role] of Object.entries(ROLE_ROUTE_PREFIXES)) {
    if (pathname === prefix || pathname.startsWith(`${prefix}/`)) return role;
  }
  return null;
}

function absoluteRedirect(path: string, request: NextRequest): NextResponse {
  const origin = getPublicAppOriginFromRequest(request);
  return NextResponse.redirect(new URL(path, `${origin}/`));
}

/**
 * Network-boundary proxy (formerly "middleware" pre-Next.js 16): refreshes
 * the Supabase session cookie on every request and enforces coarse
 * role-based route protection. Deliberately "thin" — it only reads the
 * cookie-derived user/role for redirect decisions. Fine-grained
 * authorization (and the source of truth) always lives in RLS policies and
 * the `requireRole` server helper used by route handlers/Server Components.
 */
export async function proxy(request: NextRequest) {
  const { pathname, searchParams } = request.nextUrl;

  // Supabase falls back to Site URL (often `/`) with `?code=` when
  // `redirectTo` is missing from the allowlist. Forward to the PKCE callback.
  if (
    searchParams.has("code") &&
    !pathname.startsWith("/auth/callback") &&
    !pathname.startsWith("/auth/confirm")
  ) {
    const origin = getPublicAppOriginFromRequest(request);
    const callback = new URL("/auth/callback", `${origin}/`);
    searchParams.forEach((value, key) => {
      callback.searchParams.set(key, value);
    });
    if (!callback.searchParams.has("next")) {
      callback.searchParams.set("next", "/dashboard");
    }
    return NextResponse.redirect(callback);
  }

  const { response, user, supabase } = await updateSupabaseSession(request);

  if (isPublicPath(pathname)) {
    return response;
  }

  const requiredRole = matchProtectedPrefix(pathname);
  if (!requiredRole) return response;

  if (!user) {
    const origin = getPublicAppOriginFromRequest(request);
    const redirectUrl = new URL("/login", `${origin}/`);
    redirectUrl.searchParams.set("next", pathname);
    return NextResponse.redirect(redirectUrl);
  }

  if (requiredRole === "candidate") {
    return response;
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("role_id, roles(name)")
    .eq("id", user.id)
    .single();

  const roleName = (profile?.roles as { name?: string } | null)?.name;

  if (requiredRole === "admin" && roleName !== "admin") {
    return absoluteRedirect("/dashboard", request);
  }

  if (requiredRole === "interviewer" && roleName !== "interviewer" && roleName !== "admin") {
    return absoluteRedirect("/dashboard", request);
  }

  return response;
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
