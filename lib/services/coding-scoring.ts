import type { CodingTestCase } from "@/types/domain/coding";

/** Weighted pass rate as a 0–100 score. */
export function computeWeightedScore(
  cases: Pick<CodingTestCase, "id" | "weight">[],
  passedIds: Set<string>
): number {
  if (cases.length === 0) return 0;
  const totalWeight = cases.reduce((sum, c) => sum + Number(c.weight), 0);
  if (totalWeight <= 0) return 0;
  const earned = cases
    .filter((c) => passedIds.has(c.id))
    .reduce((sum, c) => sum + Number(c.weight), 0);
  return Math.round((earned / totalWeight) * 100);
}
