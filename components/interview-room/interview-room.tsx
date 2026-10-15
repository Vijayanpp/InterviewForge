"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, LogOut } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { TopicRail } from "@/components/interview-room/topic-rail";
import { QuestionPanel } from "@/components/interview-room/question-panel";
import { SessionTimer } from "@/components/interview-room/session-timer";
import type { CandidateFacingQuestion } from "@/types/domain/interview";
import { INTERVIEW_TYPE_LABELS } from "@/types/domain/enums";
import type { InterviewType } from "@/types/domain/enums";

interface InterviewRoomProps {
  sessionId: string;
  interviewType: InterviewType;
  durationMinutes: number;
  startedAt: string | null;
  technologyNames: string[];
  topicNames: string[];
}

interface SubmitAnswerResponse {
  action: "follow_up" | "next_question" | "ended" | "coding";
  nextQuestion?: CandidateFacingQuestion;
}

export function InterviewRoom({
  sessionId,
  interviewType,
  durationMinutes,
  startedAt: initialStartedAt,
  technologyNames,
  topicNames,
}: InterviewRoomProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isEnding, setIsEnding] = useState(false);
  const [question, setQuestion] = useState<CandidateFacingQuestion | null>(null);
  const [answerText, setAnswerText] = useState("");
  const [questionsAsked, setQuestionsAsked] = useState(0);
  const [startedAt, setStartedAt] = useState(initialStartedAt);
  const startedRef = useRef(false);
  const questionStartedAtRef = useRef<number>(Date.now());

  useEffect(() => {
    if (startedRef.current) return;
    startedRef.current = true;

    fetch(`/api/interviews/${sessionId}/start`, { method: "POST" })
      .then(async (res) => {
        if (!res.ok) throw new Error("Could not start the interview.");
        return res.json();
      })
      .then((data: { session: { started_at: string | null }; question: CandidateFacingQuestion }) => {
        setQuestion(data.question);
        setStartedAt(data.session.started_at);
        setQuestionsAsked(1);
        questionStartedAtRef.current = Date.now();
      })
      .catch(() => {
        toast.error("Could not start the interview. Please try again.");
      })
      .finally(() => setIsLoading(false));
  }, [sessionId]);

  const goToReport = useCallback(() => {
    router.push(`/interviews/${sessionId}/report`);
  }, [router, sessionId]);

  const handleEnd = useCallback(async () => {
    setIsEnding(true);
    try {
      const res = await fetch(`/api/interviews/${sessionId}/end`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reason: "candidate_ended" }),
      });
      if (!res.ok) throw new Error();
      goToReport();
    } catch {
      toast.error("Could not end the interview. Please try again.");
      setIsEnding(false);
    }
  }, [sessionId, goToReport]);

  async function handleSubmit() {
    if (!question || answerText.trim().length === 0) return;
    setIsSubmitting(true);
    const durationSeconds = Math.round((Date.now() - questionStartedAtRef.current) / 1000);

    try {
      const res = await fetch(`/api/interviews/${sessionId}/answer`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ questionId: question.id, answerText, durationSeconds }),
      });
      if (!res.ok) throw new Error();

      const result: SubmitAnswerResponse = await res.json();

      if (result.action === "coding") {
        toast.success("Text round complete — starting the coding challenge…");
        router.push(`/interviews/${sessionId}/coding`);
        return;
      }

      if (result.action === "ended" || !result.nextQuestion) {
        toast.success("Interview complete — generating your report...");
        goToReport();
        return;
      }

      setQuestion(result.nextQuestion);
      setAnswerText("");
      setQuestionsAsked((n) => n + 1);
      questionStartedAtRef.current = Date.now();
      if (result.action === "follow_up") {
        toast.info("The interviewer wants to dig a bit deeper.");
      }
    } catch {
      toast.error("Could not submit your answer. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  }

  if (isLoading || !question) {
    return (
      <div className="flex flex-1 items-center justify-center">
        <div className="flex flex-col items-center gap-md text-muted-foreground">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p>Preparing your interview...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-0 min-w-0 flex-1 overflow-hidden">
      <TopicRail technologyNames={technologyNames} topicNames={topicNames} questionsAsked={questionsAsked} />

      <section className="flex min-w-0 flex-1 flex-col overflow-y-auto px-md sm:px-lg">
        <div className="mx-auto flex w-full max-w-3xl flex-wrap items-center justify-between gap-sm py-md">
          <span className="font-label-sm text-label-sm uppercase tracking-widest text-muted-foreground">
            {INTERVIEW_TYPE_LABELS[interviewType]} Interview
          </span>
          <div className="flex items-center gap-sm sm:gap-md">
            <SessionTimer durationMinutes={durationMinutes} startedAt={startedAt} onExpire={handleEnd} />
            <AlertDialog>
              <AlertDialogTrigger
                render={
                  <Button variant="outline" size="sm" disabled={isEnding}>
                    <LogOut className="h-4 w-4" />
                    <span className="hidden sm:inline">End Interview</span>
                    <span className="sm:hidden">End</span>
                  </Button>
                }
              />
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>End this interview?</AlertDialogTitle>
                  <AlertDialogDescription>
                    We&apos;ll generate your report based on the questions you&apos;ve answered so far.
                    This can&apos;t be undone.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Keep going</AlertDialogCancel>
                  <AlertDialogAction onClick={handleEnd} disabled={isEnding}>
                    {isEnding && <Loader2 className="h-4 w-4 animate-spin" />}
                    End interview
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </div>

        <div className="mx-auto mb-sm flex w-full max-w-3xl flex-wrap gap-1.5 lg:hidden">
          {technologyNames.map((name) => (
            <span
              key={name}
              className="rounded-full bg-muted px-2.5 py-0.5 text-xs font-medium text-foreground"
            >
              {name}
            </span>
          ))}
          <span className="rounded-full bg-muted px-2.5 py-0.5 text-xs text-muted-foreground">
            Question {questionsAsked}
          </span>
        </div>

        <QuestionPanel
          question={question}
          answerText={answerText}
          onAnswerChange={setAnswerText}
          onSubmit={handleSubmit}
          isSubmitting={isSubmitting}
          isFollowUp={question.title?.startsWith("Follow-up:") ?? false}
        />
      </section>
    </div>
  );
}
