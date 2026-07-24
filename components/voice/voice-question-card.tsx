"use client";

import { Brain, Loader2, Mic } from "lucide-react";
import { cn } from "@/lib/utils";

export type VoiceUiState = "idle" | "ai_speaking" | "listening" | "processing" | "ready_to_submit";

const STATE_LABEL: Record<VoiceUiState, string> = {
  idle: "Ready",
  ai_speaking: "AI Speaking",
  listening: "Listening",
  processing: "Processing",
  ready_to_submit: "Review transcript",
};

export function VoiceQuestionCard({
  questionBody,
  uiState,
}: {
  questionBody: string;
  uiState: VoiceUiState;
}) {
  return (
    <div className="flex min-h-0 w-full max-w-xl flex-1 flex-col overflow-hidden rounded-xl border border-border bg-card shadow-sm transition-all duration-300">
      <div className="flex shrink-0 justify-center px-lg pt-lg">
        <div className="inline-flex items-center gap-sm rounded-full bg-primary/10 px-sm py-xs text-primary">
          <Brain className="size-4" aria-hidden />
          <span className="font-label-sm text-label-sm uppercase tracking-wider">
            {STATE_LABEL[uiState]}
          </span>
        </div>
      </div>
      <div className="custom-scrollbar min-h-0 flex-1 overflow-y-auto overscroll-contain scroll-pb-lg px-lg pb-xl pt-md">
        <h2 className="text-center font-headline-md text-headline-md leading-snug text-foreground">
          &ldquo;{questionBody}&rdquo;
        </h2>
      </div>
    </div>
  );
}

/** Status pills — left side of the room, above the control bar. Equal width. */
export function VoiceStatusPills({ uiState }: { uiState: VoiceUiState }) {
  const isListening = uiState === "listening";
  const isProcessing = uiState === "processing";

  return (
    <div
      className="pointer-events-none absolute bottom-32 left-lg z-30 flex w-[148px] flex-col items-stretch gap-sm"
      role="status"
      aria-live="polite"
    >
      <div
        className={cn(
          "pointer-events-auto flex h-10 w-full items-center justify-center gap-sm rounded-full border-2 px-md shadow-md transition-all",
          isListening
            ? "border-success bg-success text-success-foreground"
            : "border-border bg-card text-muted-foreground"
        )}
      >
        {isListening ? (
          <Mic className="size-4 shrink-0 animate-pulse" aria-hidden />
        ) : (
          <span className="size-2 shrink-0 rounded-full bg-muted-foreground/40" />
        )}
        <span className="font-label-md text-label-md font-semibold">Listening</span>
      </div>

      <div
        className={cn(
          "pointer-events-auto flex h-10 w-full items-center justify-center gap-sm rounded-full border-2 px-md shadow-md transition-all",
          isProcessing
            ? "border-warning bg-warning text-warning-foreground"
            : "border-border bg-card text-muted-foreground"
        )}
      >
        {isProcessing ? (
          <Loader2 className="size-4 shrink-0 animate-spin" aria-hidden />
        ) : (
          <span className="size-2 shrink-0 rounded-full bg-muted-foreground/40" />
        )}
        <span className="font-label-md text-label-md font-semibold">Processing</span>
      </div>
    </div>
  );
}
