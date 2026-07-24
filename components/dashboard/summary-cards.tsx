import Link from "next/link";
import { Activity, Code2, MessageSquare, Trophy } from "lucide-react";
import { Card } from "@/components/ui/card";
import type { DashboardData } from "@/lib/services/dashboard-service";

function ReadinessRing({ score }: { score: number }) {
  const circumference = 2 * Math.PI * 16;
  const dash = (score / 100) * circumference;

  return (
    <div className="relative h-16 w-16">
      <svg className="h-full w-full -rotate-90" viewBox="0 0 36 36">
        <circle
          className="stroke-muted"
          cx="18"
          cy="18"
          fill="none"
          r="16"
          strokeWidth="4"
        />
        <circle
          className="stroke-primary"
          cx="18"
          cy="18"
          fill="none"
          r="16"
          strokeWidth="4"
          strokeDasharray={`${dash} ${circumference}`}
          strokeLinecap="round"
        />
      </svg>
      <span className="absolute inset-0 flex items-center justify-center font-label-md text-headline-md font-bold text-primary">
        {score}
      </span>
    </div>
  );
}

export function SummaryCards({
  data,
  approvedChallengeCount = 0,
}: {
  data: DashboardData;
  approvedChallengeCount?: number;
}) {
  return (
    <section className="grid grid-cols-1 gap-gutter sm:grid-cols-2 lg:grid-cols-4">
      <Card className="flex flex-col gap-sm p-lg">
        <div className="flex items-start justify-between">
          <span className="text-body-sm font-semibold uppercase tracking-wider text-muted-foreground">
            Readiness Score
          </span>
          <Activity className="h-5 w-5 text-primary" />
        </div>
        {data.readinessScore !== null ? (
          <div className="flex items-center gap-lg">
            <ReadinessRing score={data.readinessScore} />
            <div>
              <p className="font-headline-md text-headline-md font-bold text-foreground">
                {data.readinessLabel}
              </p>
              <p className="text-body-sm text-muted-foreground">Based on latest interview</p>
            </div>
          </div>
        ) : (
          <p className="py-sm text-body-sm text-muted-foreground">
            Complete an interview to see your readiness score.
          </p>
        )}
      </Card>

      <Card className="flex flex-col gap-sm p-lg">
        <div className="flex items-start justify-between">
          <span className="text-body-sm font-semibold uppercase tracking-wider text-muted-foreground">
            Avg Interview Score
          </span>
          <Trophy className="h-5 w-5 text-chart-2" />
        </div>
        {data.averageScore !== null ? (
          <div>
            <p className="font-headline-xl text-headline-xl font-bold text-foreground">
              {data.averageScore}
              <span className="text-headline-md font-medium text-muted-foreground">/100</span>
            </p>
            <div className="mt-sm h-2 w-full rounded-full bg-muted">
              <div
                className="h-2 rounded-full bg-chart-2"
                style={{ width: `${data.averageScore}%` }}
              />
            </div>
          </div>
        ) : (
          <p className="py-sm text-body-sm text-muted-foreground">No completed interviews yet.</p>
        )}
      </Card>

      <Card className="flex flex-col gap-sm p-lg">
        <div className="flex items-start justify-between">
          <span className="text-body-sm font-semibold uppercase tracking-wider text-muted-foreground">
            Interviews
          </span>
          <MessageSquare className="h-5 w-5 text-chart-3" />
        </div>
        <div>
          <p className="font-headline-xl text-headline-xl font-bold text-foreground">
            {data.completedSessionsCount}
          </p>
          <p className="text-body-sm text-muted-foreground">Completed so far</p>
        </div>
      </Card>

      <Card className="flex flex-col gap-sm p-lg">
        <div className="flex items-start justify-between">
          <span className="text-body-sm font-semibold uppercase tracking-wider text-muted-foreground">
            Coding Challenges
          </span>
          <Code2 className="h-5 w-5 text-chart-4" />
        </div>
        <div>
          <p className="font-headline-xl text-headline-xl font-bold text-foreground">
            {approvedChallengeCount}
          </p>
          <p className="text-body-sm text-muted-foreground">
            <Link href="/practice" className="text-primary hover:underline">
              Practice now →
            </Link>
          </p>
        </div>
      </Card>
    </section>
  );
}
