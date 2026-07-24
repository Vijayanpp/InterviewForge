import type { Metadata } from "next";
import Link from "next/link";
import { createSupabaseServerClient } from "@/lib/supabase/server-client";
import { listApprovedChallenges } from "@/lib/repositories/coding-challenges.repo";
import { countVisibleTestCases } from "@/lib/repositories/coding-test-cases.repo";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AiChallengeGenerator } from "@/components/coding/ai-challenge-generator";
import { DIFFICULTY_LEVEL_LABELS } from "@/types/domain/enums";

export const metadata: Metadata = {
  title: "Coding Challenges",
};

export default async function PracticePage() {
  const supabase = await createSupabaseServerClient();
  const challenges = await listApprovedChallenges(supabase);

  // Curated catalog only — AI-generated slugs start with "ai-".
  const curated = challenges.filter((c) => !c.slug.startsWith("ai-"));

  const withCounts = await Promise.all(
    curated.map(async (c) => ({
      challenge: c,
      visibleTests: await countVisibleTestCases(supabase, c.id),
    }))
  );

  return (
    <div className="space-y-lg">
      <div>
        <h1 className="font-headline-lg text-headline-lg text-foreground">Coding Challenges</h1>
        <p className="mt-xs text-body-md text-muted-foreground">
          Generate an AI coding challenge and solve it in your language of choice — or practice from
          the curated catalog below.
        </p>
      </div>

      <AiChallengeGenerator />

      <div>
        <h2 className="font-headline-md text-headline-md text-foreground">Catalog</h2>
        <p className="mt-xs text-body-sm text-muted-foreground">
          Curated problems with fixed test suites.
        </p>
      </div>

      {withCounts.length === 0 ? (
        <Card className="p-2xl text-center text-body-sm text-muted-foreground">
          No curated challenges yet. Use AI generate above to start practicing immediately.
        </Card>
      ) : (
        <div className="grid gap-md sm:grid-cols-2 lg:grid-cols-3">
          {withCounts.map(({ challenge, visibleTests }) => (
            <Link key={challenge.id} href={`/practice/${challenge.id}`}>
              <Card className="h-full gap-sm p-lg transition-shadow hover:shadow-md">
                <div className="flex items-start justify-between gap-sm">
                  <h2 className="font-headline-md text-base font-semibold text-foreground">
                    {challenge.title}
                  </h2>
                  <Badge variant="outline" className="shrink-0 capitalize">
                    {DIFFICULTY_LEVEL_LABELS[challenge.difficulty]}
                  </Badge>
                </div>
                <p className="line-clamp-3 text-body-sm text-muted-foreground">
                  {challenge.problem_statement.slice(0, 160)}
                  {challenge.problem_statement.length > 160 ? "…" : ""}
                </p>
                <p className="text-xs text-muted-foreground">
                  {challenge.supported_languages.join(", ")} · {visibleTests} sample test
                  {visibleTests === 1 ? "" : "s"}
                </p>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
