"use client";

import { CheckCheck, Mic, MicOff, Pause, RotateCcw } from "lucide-react";
import { cn } from "@/lib/utils";

export function VoiceControls({
  micActive,
  isMuted,
  isPaused,
  canFinish,
  isBusy,
  isAiSpeaking,
  onReplay,
  onPauseToggle,
  onMicToggle,
  onMuteToggle,
  onFinish,
}: {
  micActive: boolean;
  isMuted: boolean;
  isPaused: boolean;
  canFinish: boolean;
  isBusy: boolean;
  isAiSpeaking?: boolean;
  onReplay: () => void;
  onPauseToggle: () => void;
  onMicToggle: () => void;
  onMuteToggle: () => void;
  onFinish: () => void;
}) {
  return (
    <footer className="relative z-40 flex h-28 w-full shrink-0 flex-col items-center justify-center gap-sm border-t border-border bg-card/90 px-lg backdrop-blur-md">
      {isAiSpeaking && (
        <p className="font-label-md text-label-md text-muted-foreground">
          AI is speaking — listening starts automatically when it finishes
        </p>
      )}
      {!micActive && !isBusy && !isAiSpeaking && (
        <p className="font-label-md text-label-md text-muted-foreground">
          Listening starts automatically — or tap the mic anytime. Review the transcript, then Finish Answer.
        </p>
      )}
      {micActive && (
        <p className="font-label-md text-label-md font-semibold text-primary">
          Listening — the mic stays on until you pause or tap it, then review and Finish Answer
        </p>
      )}

      <div className="flex items-center gap-xl">
        <div className="flex items-center gap-md">
          <button
            type="button"
            title="Repeat question"
            onClick={onReplay}
            disabled={isBusy}
            className="flex size-12 items-center justify-center rounded-full border border-border text-muted-foreground transition-all hover:bg-muted active:scale-95 disabled:opacity-50"
          >
            <RotateCcw className="size-5" />
          </button>
          <button
            type="button"
            title={isPaused ? "Resume recording" : "Pause recording"}
            onClick={onPauseToggle}
            disabled={!micActive || isBusy}
            className="flex size-12 items-center justify-center rounded-full border border-border text-muted-foreground transition-all hover:bg-muted active:scale-95 disabled:opacity-50"
          >
            <Pause className="size-5" />
          </button>
        </div>

        <div className="group relative">
          <div
            className={cn(
              "absolute -inset-4 rounded-full bg-primary/20 blur-xl transition-opacity",
              micActive ? "animate-pulse opacity-100" : "animate-pulse opacity-80"
            )}
          />
          {!micActive && !isBusy && !isAiSpeaking && (
            <span className="pointer-events-none absolute -top-11 left-1/2 z-10 -translate-x-1/2 whitespace-nowrap rounded-md bg-foreground px-md py-xs font-label-sm text-label-sm text-background shadow-md">
              Tap mic to speak
              <span className="absolute left-1/2 top-full -translate-x-1/2 border-4 border-transparent border-t-foreground" />
            </span>
          )}
          {micActive && (
            <div className="absolute -top-11 left-1/2 z-10 -translate-x-1/2 whitespace-nowrap rounded-md bg-success px-md py-xs font-label-sm text-label-sm font-semibold text-success-foreground shadow-md">
              Mic is Active
            </div>
          )}
          <button
            type="button"
            title={micActive ? "Stop recording" : "Start recording"}
            aria-label={micActive ? "Stop recording" : "Start recording"}
            onClick={onMicToggle}
            disabled={isBusy || !!isAiSpeaking}
            className={cn(
              "relative flex size-20 items-center justify-center rounded-full text-primary-foreground shadow-lg transition-all hover:scale-105 active:scale-95 disabled:opacity-50",
              micActive
                ? "bg-destructive hover:shadow-destructive/40"
                : "bg-primary ring-4 ring-primary/30 hover:shadow-primary/40"
            )}
          >
            <Mic className="size-10" fill="currentColor" />
          </button>
        </div>

        <div className="flex items-center gap-md">
          <button
            type="button"
            title={isMuted ? "Unmute mic" : "Mute mic"}
            onClick={onMuteToggle}
            disabled={!micActive || isBusy}
            className={cn(
              "flex size-12 items-center justify-center rounded-full border border-border text-muted-foreground transition-all hover:bg-muted active:scale-95 disabled:opacity-50",
              isMuted && "border-destructive text-destructive"
            )}
          >
            <MicOff className="size-5" />
          </button>
          <button
            type="button"
            onClick={onFinish}
            disabled={!canFinish || isBusy}
            className="flex h-12 items-center gap-sm rounded-full bg-secondary px-lg font-label-md text-label-md text-secondary-foreground shadow-md transition-all hover:opacity-90 active:scale-95 disabled:opacity-50"
          >
            <CheckCheck className="size-5" />
            Finish Answer
          </button>
        </div>
      </div>
    </footer>
  );
}
