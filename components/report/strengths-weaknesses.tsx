import { CheckCircle2, AlertTriangle, XCircle } from "lucide-react";
import { Card } from "@/components/ui/card";

export function StrengthsWeaknesses({
  strengths,
  weaknesses,
  criticalGaps,
}: {
  strengths: string[];
  weaknesses: string[];
  criticalGaps: string[];
}) {
  return (
    <div className="grid grid-cols-1 gap-gutter md:grid-cols-2">
      <Card className="p-lg">
        <div className="mb-md flex items-center gap-sm">
          <CheckCircle2 className="h-5 w-5 text-success" />
          <h3 className="font-headline-md text-headline-md text-foreground">Strengths</h3>
        </div>
        {strengths.length === 0 ? (
          <p className="text-body-sm text-muted-foreground">No standout strengths identified yet.</p>
        ) : (
          <ul className="space-y-sm">
            {strengths.map((item, i) => (
              <li key={i} className="flex gap-sm text-body-sm text-foreground">
                <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-success" />
                {item}
              </li>
            ))}
          </ul>
        )}
      </Card>

      <Card className="p-lg">
        <div className="mb-md flex items-center gap-sm">
          <AlertTriangle className="h-5 w-5 text-warning" />
          <h3 className="font-headline-md text-headline-md text-foreground">Areas to Improve</h3>
        </div>
        {weaknesses.length === 0 ? (
          <p className="text-body-sm text-muted-foreground">No major gaps identified.</p>
        ) : (
          <ul className="space-y-sm">
            {weaknesses.map((item, i) => (
              <li key={i} className="flex gap-sm text-body-sm text-foreground">
                <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-warning" />
                {item}
              </li>
            ))}
          </ul>
        )}
        {criticalGaps.length > 0 && (
          <div className="mt-lg border-t border-border pt-md">
            <div className="mb-sm flex items-center gap-sm text-destructive">
              <XCircle className="h-4 w-4" />
              <span className="font-label-sm text-label-sm uppercase">Critical Gaps</span>
            </div>
            <ul className="space-y-sm">
              {criticalGaps.map((item, i) => (
                <li key={i} className="text-body-sm text-destructive">
                  {item}
                </li>
              ))}
            </ul>
          </div>
        )}
      </Card>
    </div>
  );
}
