import { Card } from "@/components/ui/card";
import type { TopicImprovementArea } from "@/lib/services/dashboard-service";
import { cn } from "@/lib/utils";

function toneFor(score: number): { bar: string; text: string; bg: string } {
  if (score < 50) return { bar: "bg-destructive", text: "text-destructive", bg: "bg-destructive/10" };
  if (score < 70) return { bar: "bg-warning", text: "text-warning", bg: "bg-warning/10" };
  return { bar: "bg-primary", text: "text-primary", bg: "bg-muted" };
}

export function TopicsToImprove({ topics }: { topics: TopicImprovementArea[] }) {
  return (
    <Card className="flex flex-col p-lg">
      <h3 className="font-headline-md text-headline-md text-foreground">Topics to Improve</h3>
      <p className="mb-lg mt-xs text-body-sm text-muted-foreground">
        AI-identified areas where you can boost your score.
      </p>

      {topics.length === 0 ? (
        <p className="flex-1 text-body-sm text-muted-foreground">
          Complete a few interviews and we&apos;ll surface your weakest topics here.
        </p>
      ) : (
        <div className="space-y-md">
          {topics.map((topic) => {
            const tone = toneFor(topic.score);
            return (
              <div key={topic.topicName} className={cn("rounded-lg p-md", tone.bg)}>
                <div className="mb-sm flex items-center justify-between">
                  <span className="font-label-md text-label-md text-foreground">{topic.topicName}</span>
                  <span className={cn("font-bold", tone.text)}>{topic.score}%</span>
                </div>
                <div className="h-1.5 w-full overflow-hidden rounded-full bg-black/5">
                  <div className={cn("h-full", tone.bar)} style={{ width: `${topic.score}%` }} />
                </div>
              </div>
            );
          })}
        </div>
      )}
    </Card>
  );
}
