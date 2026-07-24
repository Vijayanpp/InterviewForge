import { Award } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { HIRE_RECOMMENDATION_LABELS } from "@/types/domain/enums";
import { HIRE_RECOMMENDATION_COLOR } from "@/types/domain/report";
import type { InterviewReport } from "@/types/domain/report";
import { cn } from "@/lib/utils";

export function ReportHeader({ report }: { report: InterviewReport }) {
  const score = Math.round(report.overall_score);
  const circumference = 2 * Math.PI * 44;
  const dash = (score / 100) * circumference;

  return (
    <Card className="flex flex-col items-center gap-lg p-xl text-center md:flex-row md:items-center md:text-left">
      <div className="relative h-32 w-32 shrink-0">
        <svg className="h-full w-full -rotate-90" viewBox="0 0 100 100">
          <circle className="stroke-muted" cx="50" cy="50" fill="none" r="44" strokeWidth="8" />
          <circle
            className="stroke-primary"
            cx="50"
            cy="50"
            fill="none"
            r="44"
            strokeWidth="8"
            strokeDasharray={`${dash} ${circumference}`}
            strokeLinecap="round"
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="font-headline-lg text-headline-lg font-bold text-foreground">{score}</span>
          <span className="text-xs text-muted-foreground">/ 100</span>
        </div>
      </div>

      <div className="flex-1 space-y-sm">
        <div className="flex flex-wrap items-center justify-center gap-sm md:justify-start">
          <Badge className={cn("gap-1", HIRE_RECOMMENDATION_COLOR[report.hire_recommendation])} variant="outline">
            <Award className="h-3.5 w-3.5" />
            {HIRE_RECOMMENDATION_LABELS[report.hire_recommendation]}
          </Badge>
        </div>
        <p className="font-body-md text-body-md text-muted-foreground">{report.recommendation_rationale}</p>
      </div>
    </Card>
  );
}
