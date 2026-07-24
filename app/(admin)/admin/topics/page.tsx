import type { Metadata } from "next";
import { createSupabaseServerClient } from "@/lib/supabase/server-client";
import { listAllTechnologiesAdmin } from "@/lib/repositories/technologies.repo";
import { listAllTopicsAdmin } from "@/lib/repositories/topics.repo";
import { TopicsManager } from "@/components/admin/topics-manager";

export const metadata: Metadata = {
  title: "Topics",
};

export default async function AdminTopicsPage() {
  const supabase = await createSupabaseServerClient();
  const [technologies, topics] = await Promise.all([
    listAllTechnologiesAdmin(supabase),
    listAllTopicsAdmin(supabase),
  ]);

  return (
    <div className="space-y-lg">
      <div>
        <h1 className="font-headline-lg text-headline-lg text-foreground">Topics</h1>
        <p className="mt-xs text-body-md text-muted-foreground">
          Break each technology down into topics candidates can target in the wizard.
        </p>
      </div>
      <TopicsManager technologies={technologies} topics={topics} />
    </div>
  );
}
