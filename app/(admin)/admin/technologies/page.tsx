import type { Metadata } from "next";
import { createSupabaseServerClient } from "@/lib/supabase/server-client";
import { listAllTechnologiesAdmin } from "@/lib/repositories/technologies.repo";
import { TechnologiesManager } from "@/components/admin/technologies-manager";

export const metadata: Metadata = {
  title: "Technologies",
};

export default async function AdminTechnologiesPage() {
  const supabase = await createSupabaseServerClient();
  const technologies = await listAllTechnologiesAdmin(supabase);

  return (
    <div className="space-y-lg">
      <div>
        <h1 className="font-headline-lg text-headline-lg text-foreground">Technologies</h1>
        <p className="mt-xs text-body-md text-muted-foreground">
          Add or manage the technologies available in the interview wizard.
        </p>
      </div>
      <TechnologiesManager technologies={technologies} />
    </div>
  );
}
