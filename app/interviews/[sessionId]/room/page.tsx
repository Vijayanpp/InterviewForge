import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { getAuthContext } from "@/lib/auth/require-role";
import { createSupabaseServerClient } from "@/lib/supabase/server-client";
import { getSessionById } from "@/lib/repositories/interview-sessions.repo";
import { getTechnologiesByIds, getTopicsByIds } from "@/lib/repositories/technologies.repo";
import { InterviewRoom } from "@/components/interview-room/interview-room";

export const metadata: Metadata = {
  title: "Interview in Progress",
};

export default async function InterviewRoomPage({
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

  if (session.mode === "voice") {
    redirect(`/interviews/${sessionId}/voice`);
  }

  const [technologies, topics] = await Promise.all([
    getTechnologiesByIds(supabase, session.technology_ids),
    getTopicsByIds(supabase, session.topic_ids),
  ]);

  return (
    <InterviewRoom
      sessionId={sessionId}
      interviewType={session.interview_type}
      durationMinutes={session.duration_minutes}
      startedAt={session.started_at}
      technologyNames={technologies.map((t) => t.name)}
      topicNames={topics.map((t) => t.name)}
    />
  );
}
