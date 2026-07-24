import type { Metadata } from "next";
import { createSupabaseServerClient } from "@/lib/supabase/server-client";
import { listAllChallengesAdmin } from "@/lib/repositories/coding-challenges.repo";
import { listAllTechnologiesAdmin } from "@/lib/repositories/technologies.repo";
import { ChallengesManager } from "@/components/admin/challenges-manager";

export const metadata: Metadata = {
  title: "Coding Challenges",
};

export default async function AdminChallengesPage() {
  const supabase = await createSupabaseServerClient();
  const [challenges, technologies] = await Promise.all([
    listAllChallengesAdmin(supabase),
    listAllTechnologiesAdmin(supabase),
  ]);

  return (
    <div className="space-y-lg">
      <div>
        <h1 className="font-headline-lg text-headline-lg text-foreground">Coding Challenges</h1>
        <p className="mt-xs text-body-md text-muted-foreground">
          Manage practice and interview coding problems, starter code, and test cases.
        </p>
      </div>
      <ChallengesManager challenges={challenges} technologies={technologies} />
    </div>
  );
}
