"use client";

import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { CodingRoom } from "@/components/coding/coding-room";
import type { CandidateFacingChallenge, SubmitChallengeResult } from "@/types/domain/coding";

export function InterviewCodingRoom({
  sessionId,
  challenge,
  durationMinutes,
  startedAt,
}: {
  sessionId: string;
  challenge: CandidateFacingChallenge;
  durationMinutes: number;
  startedAt: string | null;
}) {
  const router = useRouter();

  async function handleSubmitted(_result: SubmitChallengeResult) {
    toast.success("Coding round submitted — generating your report…");
    try {
      const res = await fetch(`/api/interviews/${sessionId}/end`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reason: "candidate_ended" }),
      });
      if (!res.ok) throw new Error();
      router.push(`/interviews/${sessionId}/report`);
    } catch {
      toast.error("Submission saved, but ending the session failed. Open your report from History.");
      router.push(`/interviews/${sessionId}/report`);
    }
  }

  void durationMinutes;
  void startedAt;

  return (
    <CodingRoom challenge={challenge} sessionId={sessionId} onSubmitted={handleSubmitted} />
  );
}
