"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Play, Send } from "lucide-react";
import { toast } from "sonner";
import ReactMarkdown from "react-markdown";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CodeEditor, LanguageSelect } from "@/components/coding/code-editor";
import { TestResultsPanel } from "@/components/coding/test-results-panel";
import { isCodingLanguage, type CodingLanguage } from "@/lib/code-execution/languages";
import { DIFFICULTY_LEVEL_LABELS } from "@/types/domain/enums";
import type {
  CandidateFacingChallenge,
  RunChallengeResult,
  SubmitChallengeResult,
  TestCaseRunResult,
} from "@/types/domain/coding";

function pickInitialLanguage(challenge: CandidateFacingChallenge): CodingLanguage {
  const first = challenge.supportedLanguages.find(isCodingLanguage);
  return first ?? "javascript";
}

function starterFor(challenge: CandidateFacingChallenge, language: CodingLanguage): string {
  return challenge.starterCode[language] ?? `// Write your ${language} solution here\n`;
}

export function CodingRoom({
  challenge,
  sessionId,
  initialLanguage,
  onSubmitted,
}: {
  challenge: CandidateFacingChallenge;
  sessionId?: string;
  /** Preferred language when opening from AI accept step. */
  initialLanguage?: CodingLanguage;
  /** Called after a successful full submit (e.g. end interview). */
  onSubmitted?: (result: SubmitChallengeResult) => void | Promise<void>;
}) {
  const router = useRouter();
  const languages = useMemo(
    () => challenge.supportedLanguages.filter(isCodingLanguage) as CodingLanguage[],
    [challenge.supportedLanguages]
  );

  const startLang =
    initialLanguage && languages.includes(initialLanguage)
      ? initialLanguage
      : pickInitialLanguage(challenge);

  const [language, setLanguage] = useState<CodingLanguage>(startLang);
  const [source, setSource] = useState(() => starterFor(challenge, startLang));
  const [isRunning, setIsRunning] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [results, setResults] = useState<TestCaseRunResult[]>([]);
  const [passedCount, setPassedCount] = useState(0);
  const [totalCount, setTotalCount] = useState(challenge.visibleTestCount);
  const [score, setScore] = useState<number | undefined>();
  const [mode, setMode] = useState<"run" | "submit">("run");

  function handleLanguageChange(next: CodingLanguage) {
    setLanguage(next);
    setSource(starterFor(challenge, next));
  }

  async function handleRun() {
    setIsRunning(true);
    setMode("run");
    setScore(undefined);
    try {
      const res = await fetch(`/api/coding/challenges/${challenge.id}/run`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ language, sourceCode: source }),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => null);
        throw new Error(body?.error?.message ?? "Run failed.");
      }
      const data: RunChallengeResult = await res.json();
      setResults(data.results);
      setPassedCount(data.passedCount);
      setTotalCount(data.totalCount);
      if (data.passedCount === data.totalCount && data.totalCount > 0) {
        toast.success("All visible tests passed.");
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not run code.");
    } finally {
      setIsRunning(false);
    }
  }

  async function handleSubmit() {
    setIsSubmitting(true);
    setMode("submit");
    try {
      const res = await fetch(`/api/coding/challenges/${challenge.id}/submit`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ language, sourceCode: source, sessionId }),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => null);
        throw new Error(body?.error?.message ?? "Submit failed.");
      }
      const data: SubmitChallengeResult = await res.json();
      setResults(data.results);
      setPassedCount(data.passedCount);
      setTotalCount(data.totalCount);
      setScore(data.score);

      if (data.status === "passed") {
        toast.success(`Accepted — ${data.score}/100`);
      } else {
        toast.message(`Submitted — ${data.passedCount}/${data.totalCount} tests · ${data.score}/100`);
      }

      if (onSubmitted) {
        await onSubmitted(data);
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not submit.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="flex h-[calc(100vh-4rem)] flex-col lg:flex-row">
      {/* Problem panel */}
      <aside className="custom-scrollbar w-full overflow-y-auto border-b border-border bg-card p-lg lg:w-[40%] lg:border-b-0 lg:border-r">
        <div className="mb-md flex flex-wrap items-center gap-sm">
          <h1 className="font-headline-md text-headline-md text-foreground">{challenge.title}</h1>
          <Badge variant="outline" className="capitalize">
            {DIFFICULTY_LEVEL_LABELS[challenge.difficulty]}
          </Badge>
        </div>
        <div className="prose prose-sm max-w-none text-foreground dark:prose-invert">
          <ReactMarkdown>{challenge.problemStatement}</ReactMarkdown>
        </div>

        {challenge.examples.length > 0 && (
          <div className="mt-lg space-y-md">
            <h2 className="font-label-md text-label-md uppercase text-muted-foreground">Examples</h2>
            {challenge.examples.map((ex, i) => (
              <div key={i} className="rounded-lg border border-border bg-muted/30 p-md text-body-sm">
                <p>
                  <span className="font-semibold">Input:</span>{" "}
                  <code className="text-xs">{ex.input}</code>
                </p>
                <p className="mt-1">
                  <span className="font-semibold">Output:</span>{" "}
                  <code className="text-xs">{ex.output}</code>
                </p>
                {ex.explanation && (
                  <p className="mt-1 text-muted-foreground">{ex.explanation}</p>
                )}
              </div>
            ))}
          </div>
        )}

        {challenge.constraints && (
          <div className="mt-lg">
            <h2 className="mb-sm font-label-md text-label-md uppercase text-muted-foreground">
              Constraints
            </h2>
            <pre className="whitespace-pre-wrap rounded-lg bg-muted/30 p-md text-body-sm">
              {challenge.constraints}
            </pre>
          </div>
        )}

        {!sessionId && (
          <Button variant="ghost" className="mt-lg" onClick={() => router.push("/practice")}>
            ← Back to challenges
          </Button>
        )}
      </aside>

      {/* Editor + results */}
      <section className="flex min-h-0 flex-1 flex-col bg-[#1e1e1e]">
        <div className="flex h-12 items-center justify-between border-b border-white/5 px-md">
          <LanguageSelect languages={languages.length ? languages : ["javascript"]} value={language} onChange={handleLanguageChange} />
          <div className="flex items-center gap-sm">
            <Button
              size="sm"
              variant="secondary"
              onClick={handleRun}
              disabled={isRunning || isSubmitting}
            >
              {isRunning ? <Loader2 className="h-4 w-4 animate-spin" /> : <Play className="h-4 w-4" />}
              Run
            </Button>
            <Button size="sm" onClick={handleSubmit} disabled={isRunning || isSubmitting}>
              {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
              Submit
            </Button>
          </div>
        </div>
        <div className="min-h-0 flex-1">
          <CodeEditor language={language} value={source} onChange={setSource} />
        </div>
        <div className="max-h-[40%] overflow-y-auto border-t border-white/5 bg-card">
          <TestResultsPanel
            results={results}
            passedCount={passedCount}
            totalCount={totalCount}
            score={score}
            mode={mode}
          />
        </div>
      </section>
    </div>
  );
}
