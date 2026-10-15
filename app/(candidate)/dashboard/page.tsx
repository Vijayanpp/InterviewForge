import type { Metadata } from "next";
import Link from "next/link";
import { Plus, PlayCircle } from "lucide-react";
import { getAuthContext } from "@/lib/auth/require-role";
import { createSupabaseServerClient } from "@/lib/supabase/server-client";
import { getDashboardData } from "@/lib/services/dashboard-service";
import { listActiveTechnologies } from "@/lib/repositories/technologies.repo";
import { countApprovedChallenges } from "@/lib/repositories/coding-challenges.repo";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { SummaryCards } from "@/components/dashboard/summary-cards";
import { ScoreTrendChart } from "@/components/dashboard/score-trend-chart";
import { TopicsToImprove } from "@/components/dashboard/topics-to-improve";
import { RecentInterviewsTable } from "@/components/dashboard/recent-interviews-table";

export const metadata: Metadata = {
  title: "Dashboard",
};

function firstName(fullName: string | null): string {
  if (!fullName) return "there";
  return fullName.trim().split(" ")[0] ?? "there";
}

export default async function DashboardPage() {
  const ctx = await getAuthContext();
  const supabase = await createSupabaseServerClient();

  const [data, technologies, approvedChallengeCount] = await Promise.all([
    getDashboardData(supabase, ctx!.userId),
    listActiveTechnologies(supabase),
    countApprovedChallenges(supabase),
  ]);

  const technologyNames = new Map(technologies.map((t) => [t.id, t.name]));

  return (
    <div className="space-y-lg">
      <section className="flex flex-col gap-lg md:flex-row md:items-end md:justify-between">
        <div className="space-y-xs">
          <h1 className="font-headline-lg text-headline-lg text-foreground">
            Good to see you, {firstName(ctx!.profile.full_name)}.
          </h1>
          <p className="font-body-lg text-body-lg text-muted-foreground">
            {data.hasAnySessions ? "Ready for your next interview?" : "Let's get your first interview started."}
          </p>
        </div>
        <div className="flex flex-wrap gap-md">
          <Button size="lg" className="w-full sm:w-auto" nativeButton={false} render={<Link href="/interviews/new" />}>
            <Plus className="h-5 w-5" />
            Start New Interview
          </Button>
        </div>
      </section>

      <SummaryCards data={data} approvedChallengeCount={approvedChallengeCount} />

      {data.hasAnySessions ? (
        <section className="grid grid-cols-1 gap-gutter lg:grid-cols-3">
          <Card className="p-lg lg:col-span-2">
            <div className="mb-lg flex items-center justify-between">
              <h3 className="font-headline-md text-headline-md text-foreground">Score Improvement</h3>
            </div>
            {data.scoreTrend.length >= 2 ? (
              <ScoreTrendChart data={data.scoreTrend} />
            ) : (
              <div className="flex h-64 items-center justify-center text-body-sm text-muted-foreground">
                Complete at least two interviews to see your trend.
              </div>
            )}
          </Card>
          <TopicsToImprove topics={data.topicsToImprove} />
        </section>
      ) : (
        <Card className="flex flex-col items-center gap-md p-2xl text-center">
          <PlayCircle className="h-12 w-12 text-primary" />
          <h3 className="font-headline-md text-headline-md text-foreground">
            No interviews yet
          </h3>
          <p className="max-w-md text-body-sm text-muted-foreground">
            Kick off a short, AI-driven mock interview tailored to your target role. It only
            takes a few minutes to get your first readiness score.
          </p>
          <Button nativeButton={false} render={<Link href="/interviews/new" />}>
            <Plus className="h-4 w-4" />
            Start your first interview
          </Button>
        </Card>
      )}

      <section className="space-y-md">
        <div className="flex items-center justify-between">
          <h3 className="font-headline-md text-headline-md text-foreground">Recent Interviews</h3>
          {data.hasAnySessions && (
            <Link href="/interviews/history" className="text-body-sm font-semibold text-primary hover:underline">
              View All
            </Link>
          )}
        </div>
        <RecentInterviewsTable sessions={data.recentSessions} technologyNames={technologyNames} />
      </section>
    </div>
  );
}
