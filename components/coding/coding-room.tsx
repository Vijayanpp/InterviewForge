"use client";

import { useMemo, useState, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { BookOpen, Code2, Loader2, Play, Send } from "lucide-react";
import { toast } from "sonner";
import ReactMarkdown from "react-markdown";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CodeEditor, LanguageSelect } from "@/components/coding/code-editor";
import { TestResultsPanel } from "@/components/coding/test-results-panel";
import { isCodingLanguage, type CodingLanguage } from "@/lib/code-execution/languages";
import { cn } from "@/lib/utils";
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

function ProblemDetails({
  challenge,
  footer,
}: {
  challenge: CandidateFacingChallenge;
  footer?: ReactNode;
}) {
  return (
    <div className="custom-scrollbar h-full overflow-y-auto overflow-x-hidden bg-card p-md sm:p-lg">
      <div className="mb-md flex flex-wrap items-center gap-sm">
        <h1 className="font-headline-md text-lg leading-snug text-foreground sm:text-headline-md">
          {challenge.title}
        </h1>
        <Badge variant="outline" className="capitalize">
          {DIFFICULTY_LEVEL_LABELS[challenge.difficulty]}
        </Badge>
      </div>
      <div className="prose prose-sm max-w-none break-words text-foreground dark:prose-invert">
        <ReactMarkdown>{challenge.problemStatement}</ReactMarkdown>
      </div>

      {challenge.examples.length > 0 && (
        <div className="mt-lg space-y-md">
          <h2 className="font-label-md text-label-md uppercase text-muted-foreground">Examples</h2>
          {challenge.examples.map((ex, i) => (
            <div key={i} className="rounded-lg border border-border bg-muted/30 p-md text-body-sm">
              <p className="break-all">
                <span className="font-semibold">Input:</span>{" "}
                <code className="text-xs">{ex.input}</code>
              </p>
              <p className="mt-1 break-all">
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
          <pre className="whitespace-pre-wrap break-words rounded-lg bg-muted/30 p-md text-body-sm">
            {challenge.constraints}
          </pre>
        </div>
      )}

      {footer}
    </div>
  );
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
  const [mobileTab, setMobileTab] = useState<"problem" | "code">("code");

  function handleLanguageChange(next: CodingLanguage) {
    setLanguage(next);
    setSource(starterFor(challenge, next));
  }

  async function handleRun() {
    setMobileTab("code");
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
    setMobileTab("code");
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

  const toolbar = (
    <div className="flex min-h-12 shrink-0 flex-wrap items-center justify-between gap-sm border-b border-white/5 px-md py-sm">
      <LanguageSelect
        languages={languages.length ? languages : ["javascript"]}
        value={language}
        onChange={handleLanguageChange}
      />
      <div className="flex min-w-0 flex-1 items-center justify-end gap-sm sm:flex-initial">
        <Button
          size="sm"
          variant="secondary"
          onClick={() => void handleRun()}
          disabled={isRunning || isSubmitting}
          className="flex-1 sm:flex-initial"
        >
          {isRunning ? <Loader2 className="h-4 w-4 animate-spin" /> : <Play className="h-4 w-4" />}
          Run
        </Button>
        <Button
          size="sm"
          onClick={() => void handleSubmit()}
          disabled={isRunning || isSubmitting}
          className="flex-1 sm:flex-initial"
        >
          {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
          Submit
        </Button>
      </div>
    </div>
  );

  const editorStack = (
    <div className="flex min-h-0 flex-1 flex-col bg-[#1e1e1e]">
      {toolbar}
      <div className="relative min-h-[14rem] flex-1">
        <div className="absolute inset-0">
          <CodeEditor language={language} value={source} onChange={setSource} />
        </div>
      </div>
      <div className="max-h-40 shrink-0 overflow-y-auto border-t border-white/5 bg-card sm:max-h-[40%]">
        <TestResultsPanel
          results={results}
          passedCount={passedCount}
          totalCount={totalCount}
          score={score}
          mode={mode}
        />
      </div>
    </div>
  );

  const backButton = !sessionId ? (
    <Button variant="ghost" className="mt-lg" onClick={() => router.push("/practice")}>
      ← Back to challenges
    </Button>
  ) : null;

  return (
    <div className="flex h-full min-h-0 min-w-0 flex-col lg:flex-row">
      <div className="flex shrink-0 border-b border-border bg-card p-sm lg:hidden">
        <div className="grid w-full grid-cols-2 gap-sm rounded-lg bg-muted p-[3px]">
          <button
            type="button"
            onClick={() => setMobileTab("problem")}
            className={cn(
              "inline-flex items-center justify-center gap-sm rounded-md px-md py-sm text-sm font-medium",
              mobileTab === "problem" ? "bg-background text-foreground shadow-sm" : "text-muted-foreground"
            )}
          >
            <BookOpen className="size-4" aria-hidden />
            Problem
          </button>
          <button
            type="button"
            onClick={() => setMobileTab("code")}
            className={cn(
              "inline-flex items-center justify-center gap-sm rounded-md px-md py-sm text-sm font-medium",
              mobileTab === "code" ? "bg-background text-foreground shadow-sm" : "text-muted-foreground"
            )}
          >
            <Code2 className="size-4" aria-hidden />
            Editor
          </button>
        </div>
      </div>

      <aside
        className={cn(
          "min-h-0 min-w-0 lg:flex lg:w-[40%] lg:border-r lg:border-border",
          mobileTab === "problem" ? "flex flex-1 flex-col" : "hidden lg:flex"
        )}
      >
        <ProblemDetails
          challenge={challenge}
          footer={
            <>
              {backButton}
              <Button
                className="mt-md w-full lg:hidden"
                onClick={() => setMobileTab("code")}
              >
                <Code2 className="h-4 w-4" />
                Write solution
              </Button>
            </>
          }
        />
      </aside>

      <section
        className={cn(
          "min-h-0 min-w-0 flex-1 flex-col",
          mobileTab === "code" ? "flex" : "hidden lg:flex"
        )}
      >
        {editorStack}
      </section>
    </div>
  );
}
