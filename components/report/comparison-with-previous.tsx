import { TrendingDown, TrendingUp } from "lucide-react";
import { Card } from "@/components/ui/card";
import type { ComparisonWithPrevious } from "@/types/domain/report";
import { cn } from "@/lib/utils";

export function ComparisonWithPreviousCard({
  comparison,
}: {
  comparison: ComparisonWithPrevious | null;
}) {
  if (!comparison || comparison.previousScore === null) return null;

  const improved = (comparison.delta ?? 0) >= 0;

  return (
    <Card className="flex items-center gap-md p-lg">
      <span
        className={cn(
          "flex h-10 w-10 items-center justify-center rounded-full",
          improved ? "bg-success/10 text-success" : "bg-destructive/10 text-destructive"
        )}
      >
        {improved ? <TrendingUp className="h-5 w-5" /> : <TrendingDown className="h-5 w-5" />}
      </span>
      <div>
        <p className="font-label-md text-label-md font-semibold text-foreground">
          {comparison.previousScore} → {comparison.currentScore}{" "}
          <span className={improved ? "text-success" : "text-destructive"}>
            ({improved ? "+" : ""}
            {comparison.delta})
          </span>
        </p>
        <p className="text-body-sm text-muted-foreground">{comparison.narrative}</p>
      </div>
    </Card>
  );
}
