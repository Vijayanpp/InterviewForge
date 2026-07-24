"use client";

import { CheckCircle2, XCircle } from "lucide-react";
import type { TestCaseRunResult } from "@/types/domain/coding";
import { cn } from "@/lib/utils";

export function TestResultsPanel({
  results,
  passedCount,
  totalCount,
  score,
  mode,
}: {
  results: TestCaseRunResult[];
  passedCount: number;
  totalCount: number;
  score?: number;
  mode: "run" | "submit";
}) {
  if (results.length === 0 && totalCount === 0) {
    return (
      <p className="p-md text-body-sm text-muted-foreground">
        Run your code against the visible sample tests, then submit for the full suite (including hidden cases).
      </p>
    );
  }

  return (
    <div className="space-y-md p-md">
      <div className="flex items-center justify-between">
        <p className="font-label-md text-label-md text-foreground">
          {mode === "run" ? "Visible tests" : "Submission"}: {passedCount}/{totalCount} passed
          {typeof score === "number" && (
            <span className="ml-2 text-primary">· Score {score}/100</span>
          )}
        </p>
      </div>
      <ul className="space-y-sm">
        {results.map((r, index) => (
          <li
            key={r.testCaseId}
            className={cn(
              "rounded-lg border p-md text-body-sm",
              r.passed ? "border-success/30 bg-success/5" : "border-destructive/30 bg-destructive/5"
            )}
          >
            <div className="mb-1 flex items-center gap-sm">
              {r.passed ? (
                <CheckCircle2 className="h-4 w-4 text-success" />
              ) : (
                <XCircle className="h-4 w-4 text-destructive" />
              )}
              <span className="font-medium">
                Case {index + 1}
                {r.input === undefined && mode === "submit" ? " (hidden)" : ""}
              </span>
              <span className="text-xs text-muted-foreground">{r.status}</span>
            </div>
            {r.input !== undefined && (
              <pre className="mt-1 overflow-x-auto rounded bg-muted/50 p-2 text-xs">
                Input: {r.input}
                {r.stdout !== undefined && `\nStdout: ${r.stdout}`}
                {r.stderr ? `\nStderr: ${r.stderr}` : ""}
              </pre>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}
