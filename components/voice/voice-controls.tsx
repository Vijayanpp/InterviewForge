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
    <footer className="relative z-40 flex h-auto min-h-24 w-full shrink-0 flex-col items-center justify-center gap-sm border-t border-border bg-card/90 px-md py-sm backdrop-blur-md sm:min-h-28 sm:px-lg sm:py-md">
      {isAiSpeaking && (
        <p className="max-w-full px-sm text-center font-label-md text-xs text-muted-foreground sm:text-label-md">
          AI is speaking — listening starts automatically when it finishes
        </p>
      )}
      {!micActive && !isBusy && !isAiSpeaking && (
        <p className="hidden max-w-full px-sm text-center font-label-md text-xs text-muted-foreground sm:block sm:text-label-md">
          Listening starts automatically — or tap the mic anytime. Review the transcript, then Finish Answer.
        </p>
      )}
      {micActive && (
        <p className="max-w-full px-sm text-center font-label-md text-xs font-semibold text-primary sm:text-label-md">
          Listening — pause or tap the mic, then Finish Answer
        </p>
      )}

      <div className="flex flex-wrap items-center justify-center gap-md sm:gap-xl">
        <div className="flex items-center gap-sm sm:gap-md">
          <button
            type="button"
            title="Repeat question"
            onClick={onReplay}
            disabled={isBusy}
            className="flex size-10 items-center justify-center rounded-full border border-border text-muted-foreground transition-all hover:bg-muted active:scale-95 disabled:opacity-50 sm:size-12"
          >
            <RotateCcw className="size-5" />
          </button>
          <button
            type="button"
            title={isPaused ? "Resume recording" : "Pause recording"}
            onClick={onPauseToggle}
            disabled={!micActive || isBusy}
            className="flex size-10 items-center justify-center rounded-full border border-border text-muted-foreground transition-all hover:bg-muted active:scale-95 disabled:opacity-50 sm:size-12"
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
            <span className="pointer-events-none absolute -top-11 left-1/2 z-10 hidden -translate-x-1/2 whitespace-nowrap rounded-md bg-foreground px-md py-xs font-label-sm text-label-sm text-background shadow-md sm:block">
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
              "relative flex size-14 items-center justify-center rounded-full text-primary-foreground shadow-lg transition-all hover:scale-105 active:scale-95 disabled:opacity-50 sm:size-20",
              micActive
                ? "bg-destructive hover:shadow-destructive/40"
                : "bg-primary ring-4 ring-primary/30 hover:shadow-primary/40"
            )}
          >
            <Mic className="size-7 sm:size-10" fill="currentColor" />
          </button>
        </div>

        <div className="flex items-center gap-md">
          <button
            type="button"
            title={isMuted ? "Unmute mic" : "Mute mic"}
            onClick={onMuteToggle}
            disabled={!micActive || isBusy}
            className={cn(
              "flex size-10 items-center justify-center rounded-full border border-border text-muted-foreground transition-all hover:bg-muted active:scale-95 disabled:opacity-50 sm:size-12",
              isMuted && "border-destructive text-destructive"
            )}
          >
            <MicOff className="size-5" />
          </button>
          <button
            type="button"
            onClick={onFinish}
            disabled={!canFinish || isBusy}
            className="flex h-10 items-center gap-sm rounded-full bg-secondary px-md font-label-md text-xs text-secondary-foreground shadow-md transition-all hover:opacity-90 active:scale-95 disabled:opacity-50 sm:h-12 sm:px-lg sm:text-label-md"
          >
            <CheckCheck className="size-5" />
            Finish Answer
          </button>
        </div>
      </div>
    </footer>
  );
}
