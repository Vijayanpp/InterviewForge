"use client";

import { Bot, Loader2, Send } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { DIFFICULTY_LEVEL_LABELS, QUESTION_TYPE_LABELS } from "@/types/domain/enums";
import type { CandidateFacingQuestion } from "@/types/domain/interview";

export function QuestionPanel({
  question,
  answerText,
  onAnswerChange,
  onSubmit,
  isSubmitting,
  isFollowUp,
}: {
  question: CandidateFacingQuestion;
  answerText: string;
  onAnswerChange: (value: string) => void;
  onSubmit: () => void;
  isSubmitting: boolean;
  isFollowUp: boolean;
}) {
  return (
    <div className="mx-auto flex h-full w-full max-w-3xl flex-col justify-center gap-lg py-lg">
      <div className="rounded-2xl border border-border bg-card p-lg shadow-lg">
        <div className="mb-md flex items-center justify-between">
          <div className="flex items-center gap-sm">
            <span className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10">
              <Bot className="h-4 w-4 text-primary" />
            </span>
            <span className="font-label-sm text-label-sm uppercase tracking-wide text-primary">
              Interview Co-pilot
            </span>
          </div>
          <div className="flex gap-sm">
            {isFollowUp && <Badge variant="secondary">Follow-up</Badge>}
            <Badge variant="outline">{QUESTION_TYPE_LABELS[question.questionType]}</Badge>
            <Badge variant="outline" className="capitalize">
              {DIFFICULTY_LEVEL_LABELS[question.difficulty]}
            </Badge>
          </div>
        </div>
        <p className="font-body-lg text-body-lg leading-relaxed text-foreground">{question.body}</p>
      </div>

      <div className="rounded-2xl border border-border bg-card p-lg shadow-sm">
        <Textarea
          value={answerText}
          onChange={(e) => onAnswerChange(e.target.value)}
          placeholder="Type your answer here — be as thorough as you would in a real interview..."
          rows={8}
          className="resize-none border-none bg-transparent px-0 shadow-none focus-visible:ring-0"
          autoFocus
        />
        <div className="mt-md flex items-center justify-between">
          <p className="text-xs text-muted-foreground">{answerText.trim().length} characters</p>
          <Button onClick={onSubmit} disabled={isSubmitting || answerText.trim().length === 0} size="lg">
            {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
            Submit Answer
          </Button>
        </div>
      </div>
    </div>
  );
}
