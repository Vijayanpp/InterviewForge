import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { getAuthContext } from "@/lib/auth/require-role";
import { createSupabaseServerClient } from "@/lib/supabase/server-client";
import { getSessionById, updateSession } from "@/lib/repositories/interview-sessions.repo";
import { pickChallengeForSession, getChallengeById } from "@/lib/repositories/coding-challenges.repo";
import { countVisibleTestCases } from "@/lib/repositories/coding-test-cases.repo";
import { toCandidateFacingChallenge } from "@/types/domain/coding";
import { InterviewCodingRoom } from "@/components/coding/interview-coding-room";

export const metadata: Metadata = {
  title: "Coding Interview",
};

export default async function InterviewCodingPage({
  params,
  searchParams,
}: {
  params: Promise<{ sessionId: string }>;
  searchParams: Promise<{ challengeId?: string }>;
}) {
  const { sessionId } = await params;
  const { challengeId: challengeIdParam } = await searchParams;
  const ctx = await getAuthContext();
  const supabase = await createSupabaseServerClient();

  const session = await getSessionById(supabase, sessionId);
  if (!session || session.candidate_id !== ctx?.userId) notFound();

  if (session.status === "completed") {
    redirect(`/interviews/${sessionId}/report`);
  }

  // Mark coding / mixed-coding phase as in progress
  if (session.status === "draft") {
    await updateSession(supabase, sessionId, {
      status: "in_progress",
      started_at: new Date().toISOString(),
    });
  }

  let challenge = challengeIdParam
    ? await getChallengeById(supabase, challengeIdParam)
    : null;

  if (!challenge || challenge.status !== "approved") {
    challenge = await pickChallengeForSession(supabase, {
      technologyIds: session.technology_ids,
      difficulty: session.difficulty,
    });
  }

  if (!challenge) {
    return (
      <div className="flex flex-1 items-center justify-center p-xl text-center">
        <div className="max-w-md space-y-md">
          <h1 className="font-headline-md text-headline-md">No coding challenge available</h1>
          <p className="text-body-sm text-muted-foreground">
            There are no approved challenges matching this session yet. An admin needs to publish
            challenges, or you can end the interview from the text room.
          </p>
        </div>
      </div>
    );
  }

  const visibleTestCount = await countVisibleTestCases(supabase, challenge.id);

  return (
    <InterviewCodingRoom
      sessionId={sessionId}
      challenge={toCandidateFacingChallenge(challenge, visibleTestCount)}
      durationMinutes={session.duration_minutes}
      startedAt={session.started_at}
    />
  );
}
