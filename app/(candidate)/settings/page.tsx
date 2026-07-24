import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getAuthContext } from "@/lib/auth/require-role";
import { createSupabaseServerClient } from "@/lib/supabase/server-client";
import { listActiveTechnologies } from "@/lib/repositories/technologies.repo";
import { SettingsForm } from "@/components/settings/settings-form";

export const metadata: Metadata = {
  title: "Settings",
};

export default async function SettingsPage() {
  const ctx = await getAuthContext();
  if (!ctx) redirect("/login");

  const supabase = await createSupabaseServerClient();
  const technologies = await listActiveTechnologies(supabase);

  return (
    <div className="mx-auto w-full max-w-3xl space-y-lg">
      <div>
        <h1 className="font-headline-lg text-headline-lg">Settings</h1>
        <p className="mt-sm text-body-md text-muted-foreground">
          Update your profile so interviews stay calibrated to your experience and goals.
        </p>
      </div>

      <SettingsForm profile={ctx.profile} email={ctx.email ?? ""} technologies={technologies} />
    </div>
  );
}
