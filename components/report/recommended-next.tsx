import Link from "next/link";
import { ArrowRight, Sparkles } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import type { RecommendedNext } from "@/types/domain/report";

export function RecommendedNextCard({ recommendedNext }: { recommendedNext: RecommendedNext | null }) {
  if (!recommendedNext) return null;

  return (
    <Card className="flex flex-col items-start gap-md bg-sidebar p-lg text-sidebar-foreground sm:flex-row sm:items-center sm:justify-between">
      <div className="flex items-start gap-md">
        <span className="mt-1 flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white/10">
          <Sparkles className="h-5 w-5 text-sidebar-primary" />
        </span>
        <div>
          <p className="font-headline-md text-headline-md">What&apos;s next?</p>
          <p className="mt-1 text-body-sm text-sidebar-foreground/70">{recommendedNext.reason}</p>
        </div>
      </div>
      <Button nativeButton={false} render={<Link href="/interviews/new" />} className="shrink-0">
        Start another interview
        <ArrowRight className="h-4 w-4" />
      </Button>
    </Card>
  );
}
