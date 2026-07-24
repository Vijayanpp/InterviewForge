import { Card } from "@/components/ui/card";
import type { InterviewReport } from "@/types/domain/report";

const LABELS: Array<{ key: keyof InterviewReport; label: string }> = [
  { key: "technical_score", label: "Technical" },
  { key: "communication_score", label: "Communication" },
  { key: "problem_solving_score", label: "Problem Solving" },
  { key: "coding_score", label: "Coding" },
];

export function SubScores({ report }: { report: InterviewReport }) {
  const scores = LABELS.filter(({ key }) => typeof report[key] === "number");
  if (scores.length === 0) return null;

  return (
    <Card className="grid grid-cols-2 gap-lg p-lg sm:grid-cols-4">
      {scores.map(({ key, label }) => {
        const value = Math.round(report[key] as number);
        return (
          <div key={key}>
            <p className="mb-sm text-body-sm text-muted-foreground">{label}</p>
            <p className="mb-sm font-headline-md text-headline-md font-bold text-foreground">{value}</p>
            <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
              <div className="h-full bg-primary" style={{ width: `${value}%` }} />
            </div>
          </div>
        );
      })}
    </Card>
  );
}
