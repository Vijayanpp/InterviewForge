"use server";

import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server-client";
import { getServerEnv } from "@/lib/env";
import { logger } from "@/lib/logger";
import {
  forgotPasswordSchema,
  resetPasswordSchema,
  signInSchema,
  signUpSchema,
  type ForgotPasswordInput,
  type ResetPasswordInput,
  type SignInInput,
  type SignUpInput,
} from "@/lib/validation/auth";

export interface AuthActionResult {
  success: boolean;
  error?: string;
  needsEmailConfirmation?: boolean;
}

export async function signInAction(
  input: SignInInput,
  next?: string
): Promise<AuthActionResult> {
  const parsed = signInSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message ?? "Invalid input" };
  }

  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.auth.signInWithPassword(parsed.data);

  if (error) {
    logger.warn({ err: error.message }, "sign-in failed");
    return { success: false, error: "Incorrect email or password." };
  }

  // Redirecting from within the Server Action (rather than letting the
  // client call router.push after the fact) guarantees the redirect is
  // delivered in the same response as the Set-Cookie for the new session,
  // so the next request is never racing the cookie write.
  redirect(next && next.startsWith("/") ? next : "/dashboard");
}

export async function signUpAction(input: SignUpInput): Promise<AuthActionResult> {
  const parsed = signUpSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message ?? "Invalid input" };
  }

  const env = getServerEnv();
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase.auth.signUp({
    email: parsed.data.email,
    password: parsed.data.password,
    options: {
      data: { full_name: parsed.data.fullName },
      emailRedirectTo: `${env.APP_URL}/auth/confirm`,
    },
  });

  if (error) {
    logger.warn({ err: error.message }, "sign-up failed");
    if (error.message.toLowerCase().includes("already registered")) {
      return { success: false, error: "An account with this email already exists." };
    }
    return { success: false, error: "We couldn't create your account. Please try again." };
  }

  if (!data.session) {
    return { success: true, needsEmailConfirmation: true };
  }

  // See the comment in signInAction: redirecting server-side keeps the
  // Set-Cookie and the redirect atomic.
  redirect("/onboarding");
}

export async function requestPasswordResetAction(
  input: ForgotPasswordInput
): Promise<AuthActionResult> {
  const parsed = forgotPasswordSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message ?? "Invalid input" };
  }

  const env = getServerEnv();
  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.auth.resetPasswordForEmail(parsed.data.email, {
    redirectTo: `${env.APP_URL}/reset-password`,
  });

  if (error) {
    logger.warn({ err: error.message }, "password reset request failed");
    // Intentionally do not reveal whether the email exists.
  }

  return { success: true };
}

export async function updatePasswordAction(input: ResetPasswordInput): Promise<AuthActionResult> {
  const parsed = resetPasswordSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message ?? "Invalid input" };
  }

  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.auth.updateUser({ password: parsed.data.password });

  if (error) {
    logger.warn({ err: error.message }, "password update failed");
    return { success: false, error: "Could not update your password. The reset link may have expired." };
  }

  return { success: true };
}

export async function signOutAction(): Promise<void> {
  const supabase = await createSupabaseServerClient();
  await supabase.auth.signOut();
  redirect("/login");
}
