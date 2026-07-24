import type { Metadata } from "next";
import { createSupabaseServerClient } from "@/lib/supabase/server-client";
import { listAllTechnologiesAdmin } from "@/lib/repositories/technologies.repo";
import { listAllTopicsAdmin } from "@/lib/repositories/topics.repo";
import { ChallengeEditor } from "@/components/admin/challenge-editor";

export const metadata: Metadata = {
  title: "New Coding Challenge",
};

export default async function NewChallengePage() {
  const supabase = await createSupabaseServerClient();
  const [technologies, topics] = await Promise.all([
    listAllTechnologiesAdmin(supabase),
    listAllTopicsAdmin(supabase),
  ]);

  return (
    <div className="space-y-lg">
      <div>
        <h1 className="font-headline-lg text-headline-lg text-foreground">New challenge</h1>
        <p className="mt-xs text-body-md text-muted-foreground">
          Create a draft challenge, then add test cases on the detail page.
        </p>
      </div>
      <ChallengeEditor
        challenge={null}
        testCases={[]}
        technologies={technologies}
        topics={topics}
      />
    </div>
  );
}
