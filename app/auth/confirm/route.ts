import { NextResponse, type NextRequest } from "next/server";
import type { EmailOtpType } from "@supabase/supabase-js";
import { getPublicAppOriginFromRequest } from "@/lib/app-url";
import { createSupabaseServerClient } from "@/lib/supabase/server-client";

/**
 * Target of the "Confirm your email" link Supabase sends on sign-up, and
 * of password-recovery links. Verifies the OTP token hash and redirects.
 *
 * Uses APP_URL / forwarded Host — never raw nextUrl.origin (Docker 0.0.0.0).
 */
export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const origin = getPublicAppOriginFromRequest(request);
  const tokenHash = searchParams.get("token_hash");
  const type = searchParams.get("type") as EmailOtpType | null;
  const rawNext = searchParams.get("next") ?? "/dashboard";
  const next =
    rawNext.startsWith("/") && !rawNext.startsWith("//") ? rawNext : "/dashboard";

  if (tokenHash && type) {
    const supabase = await createSupabaseServerClient();
    const { error } = await supabase.auth.verifyOtp({ token_hash: tokenHash, type });
    if (!error) {
      const redirectTo = type === "recovery" ? "/reset-password" : next;
      return NextResponse.redirect(`${origin}${redirectTo}`);
    }
  }

  return NextResponse.redirect(`${origin}/login?error=confirmation_failed`);
}
