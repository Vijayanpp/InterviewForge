"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card } from "@/components/ui/card";
import type { StudyPlanItem } from "@/types/domain/report";

function PlanList({ items }: { items: StudyPlanItem[] }) {
  if (items.length === 0) {
    return <p className="py-lg text-center text-body-sm text-muted-foreground">No plan generated.</p>;
  }

  return (
    <ol className="space-y-md">
      {items.map((item) => (
        <li key={item.day} className="rounded-lg border border-border p-md">
          <div className="mb-sm flex items-center gap-sm">
            <span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary">
              {item.day}
            </span>
            <span className="font-label-md text-label-md font-semibold text-foreground">{item.focus}</span>
          </div>
          <ul className="ml-8 list-disc space-y-1 text-body-sm text-muted-foreground">
            {item.tasks.map((task, i) => (
              <li key={i}>{task}</li>
            ))}
          </ul>
        </li>
      ))}
    </ol>
  );
}

export function StudyPlan({
  sevenDayPlan,
  thirtyDayPlan,
}: {
  sevenDayPlan: StudyPlanItem[];
  thirtyDayPlan: StudyPlanItem[];
}) {
  return (
    <Card className="p-lg">
      <h3 className="mb-lg font-headline-md text-headline-md text-foreground">Your Improvement Plan</h3>
      <Tabs defaultValue="seven">
        <TabsList>
          <TabsTrigger value="seven">7-Day Plan</TabsTrigger>
          <TabsTrigger value="thirty">30-Day Plan</TabsTrigger>
        </TabsList>
        <TabsContent value="seven" className="mt-md">
          <PlanList items={sevenDayPlan} />
        </TabsContent>
        <TabsContent value="thirty" className="mt-md">
          <PlanList items={thirtyDayPlan} />
        </TabsContent>
      </Tabs>
    </Card>
  );
}
