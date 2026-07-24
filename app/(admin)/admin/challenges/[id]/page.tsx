import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server-client";
import { getChallengeById } from "@/lib/repositories/coding-challenges.repo";
import { listAllTestCases } from "@/lib/repositories/coding-test-cases.repo";
import { listAllTechnologiesAdmin } from "@/lib/repositories/technologies.repo";
import { listAllTopicsAdmin } from "@/lib/repositories/topics.repo";
import { ChallengeEditor } from "@/components/admin/challenge-editor";

export const metadata: Metadata = {
  title: "Edit Coding Challenge",
};

export default async function EditChallengePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createSupabaseServerClient();

  const challenge = await getChallengeById(supabase, id);
  if (!challenge || challenge.deleted_at) notFound();

  const [testCases, technologies, topics] = await Promise.all([
    listAllTestCases(supabase, id),
    listAllTechnologiesAdmin(supabase),
    listAllTopicsAdmin(supabase),
  ]);

  return (
    <div className="space-y-lg">
      <div>
        <h1 className="font-headline-lg text-headline-lg text-foreground">{challenge.title}</h1>
        <p className="mt-xs font-mono text-body-sm text-muted-foreground">{challenge.slug}</p>
      </div>
      <ChallengeEditor
        challenge={challenge}
        testCases={testCases}
        technologies={technologies}
        topics={topics}
      />
    </div>
  );
}
