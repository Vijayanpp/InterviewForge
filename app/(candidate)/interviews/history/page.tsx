import type { Metadata } from "next";
import { getAuthContext } from "@/lib/auth/require-role";
import { createSupabaseServerClient } from "@/lib/supabase/server-client";
import { listCandidateSessions } from "@/lib/repositories/interview-sessions.repo";
import { listActiveTechnologies } from "@/lib/repositories/technologies.repo";
import { RecentInterviewsTable } from "@/components/dashboard/recent-interviews-table";

export const metadata: Metadata = {
  title: "Interview History",
};

export default async function InterviewHistoryPage() {
  const ctx = await getAuthContext();
  const supabase = await createSupabaseServerClient();

  const [sessions, technologies] = await Promise.all([
    listCandidateSessions(supabase, ctx!.userId, 100),
    listActiveTechnologies(supabase),
  ]);

  const technologyNames = new Map(technologies.map((t) => [t.id, t.name]));

  return (
    <div className="space-y-lg">
      <div>
        <h1 className="font-headline-lg text-headline-lg text-foreground">Interview History</h1>
        <p className="mt-xs text-body-md text-muted-foreground">
          Every interview you&apos;ve started, in progress or completed.
        </p>
      </div>
      <RecentInterviewsTable sessions={sessions} technologyNames={technologyNames} />
    </div>
  );
}
