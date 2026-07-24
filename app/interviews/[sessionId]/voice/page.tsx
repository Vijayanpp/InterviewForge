import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { getAuthContext } from "@/lib/auth/require-role";
import { createSupabaseServerClient } from "@/lib/supabase/server-client";
import { getSessionById } from "@/lib/repositories/interview-sessions.repo";
import { getTechnologiesByIds, getTopicsByIds } from "@/lib/repositories/technologies.repo";
import { getServerEnv } from "@/lib/env";
import { VoiceRoom } from "@/components/voice/voice-room";

export const metadata: Metadata = {
  title: "Voice Interview",
};

export default async function InterviewVoicePage({
  params,
}: {
  params: Promise<{ sessionId: string }>;
}) {
  const { sessionId } = await params;
  const ctx = await getAuthContext();
  const supabase = await createSupabaseServerClient();

  const session = await getSessionById(supabase, sessionId);
  if (!session || session.candidate_id !== ctx?.userId) notFound();

  if (session.status === "completed") {
    redirect(`/interviews/${sessionId}/report`);
  }

  if (session.mode === "coding" || session.interview_type === "coding") {
    redirect(`/interviews/${sessionId}/coding`);
  }

  if (session.mode !== "voice") {
    redirect(`/interviews/${sessionId}/room`);
  }

  const env = getServerEnv();
  const [technologies, topics] = await Promise.all([
    getTechnologiesByIds(supabase, session.technology_ids),
    getTopicsByIds(supabase, session.topic_ids),
  ]);

  return (
    <VoiceRoom
      sessionId={sessionId}
      interviewType={session.interview_type}
      durationMinutes={session.duration_minutes}
      startedAt={session.started_at}
      technologyNames={technologies.map((t) => t.name)}
      topicNames={topics.map((t) => t.name)}
      maxAnswerSeconds={env.VOICE_MAX_ANSWER_SECONDS}
      silenceMs={env.VOICE_SILENCE_MS}
    />
  );
}
