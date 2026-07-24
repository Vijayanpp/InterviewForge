import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server-client";
import { getChallengeById } from "@/lib/repositories/coding-challenges.repo";
import { countVisibleTestCases } from "@/lib/repositories/coding-test-cases.repo";
import { isCodingLanguage } from "@/lib/code-execution/languages";
import { toCandidateFacingChallenge } from "@/types/domain/coding";
import { CodingRoom } from "@/components/coding/coding-room";

export const metadata: Metadata = {
  title: "Practice Challenge",
};

export default async function PracticeChallengePage({
  params,
  searchParams,
}: {
  params: Promise<{ challengeId: string }>;
  searchParams: Promise<{ lang?: string }>;
}) {
  const { challengeId } = await params;
  const { lang } = await searchParams;
  const supabase = await createSupabaseServerClient();
  const challenge = await getChallengeById(supabase, challengeId);

  if (!challenge || challenge.status !== "approved" || challenge.deleted_at) {
    notFound();
  }

  const visibleTestCount = await countVisibleTestCases(supabase, challenge.id);
  const initialLanguage = lang && isCodingLanguage(lang) ? lang : undefined;

  return (
    <div className="-m-lg -mb-0 lg:-m-xl">
      <CodingRoom
        challenge={toCandidateFacingChallenge(challenge, visibleTestCount)}
        initialLanguage={initialLanguage}
      />
    </div>
  );
}
