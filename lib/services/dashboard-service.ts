import "server-only";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/types/database";
import { listCandidateSessions, type SessionWithReport } from "@/lib/repositories/interview-sessions.repo";

type Client = SupabaseClient<Database>;

export interface TopicImprovementArea {
  topicName: string;
  score: number; // 0-100
}

export interface ScoreTrendPoint {
  label: string;
  score: number;
  date: string;
}

export interface DashboardData {
  hasAnySessions: boolean;
  completedSessionsCount: number;
  averageScore: number | null;
  readinessScore: number | null;
  readinessLabel: string;
  scoreTrend: ScoreTrendPoint[];
  topicsToImprove: TopicImprovementArea[];
  recentSessions: SessionWithReport[];
}

function readinessLabelFor(score: number | null): string {
  if (score === null) return "Not enough data";
  if (score >= 85) return "Excellent";
  if (score >= 70) return "Good";
  if (score >= 50) return "Fair";
  return "Needs work";
}

/**
 * Aggregates a candidate's dashboard view purely from real rows — no
 * fabricated numbers. Every metric degrades gracefully to null/empty when
 * there isn't enough history yet, and the UI renders an explicit empty
 * state in that case.
 */
export async function getDashboardData(
  supabase: Client,
  candidateId: string
): Promise<DashboardData> {
  const sessions = await listCandidateSessions(supabase, candidateId, 50);

  const completed = sessions.filter(
    (s) => s.status === "completed" && s.interview_reports && s.interview_reports.length > 0
  );

  const scores = completed
    .map((s) => s.interview_reports?.[0]?.overall_score)
    .filter((s): s is number => typeof s === "number");

  const averageScore =
    scores.length > 0 ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length) : null;

  const mostRecentScore = completed[0]?.interview_reports?.[0]?.overall_score ?? null;
  const readinessScore = mostRecentScore !== null ? Math.round(mostRecentScore) : null;

  const scoreTrend: ScoreTrendPoint[] = [...completed]
    .reverse()
    .slice(-8)
    .map((s, idx) => ({
      label: `#${idx + 1}`,
      score: Math.round(s.interview_reports?.[0]?.overall_score ?? 0),
      date: s.ended_at ?? s.created_at,
    }));

  const topicScoreMap = new Map<string, { total: number; count: number }>();
  for (const session of completed) {
    const topicScores = session.interview_reports?.[0]?.topic_scores;
    if (!Array.isArray(topicScores)) continue;
    for (const entry of topicScores as Array<{ topicName?: string; score?: number }>) {
      if (!entry?.topicName || typeof entry.score !== "number") continue;
      const existing = topicScoreMap.get(entry.topicName) ?? { total: 0, count: 0 };
      existing.total += entry.score;
      existing.count += 1;
      topicScoreMap.set(entry.topicName, existing);
    }
  }

  const topicsToImprove: TopicImprovementArea[] = Array.from(topicScoreMap.entries())
    .map(([topicName, { total, count }]) => ({ topicName, score: Math.round(total / count) }))
    .sort((a, b) => a.score - b.score)
    .slice(0, 3);

  return {
    hasAnySessions: sessions.length > 0,
    completedSessionsCount: completed.length,
    averageScore,
    readinessScore,
    readinessLabel: readinessLabelFor(readinessScore),
    scoreTrend,
    topicsToImprove,
    recentSessions: sessions.slice(0, 5),
  };
}
