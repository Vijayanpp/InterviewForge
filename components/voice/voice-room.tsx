"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, NotebookText, Timer } from "lucide-react";
import { toast } from "sonner";

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
import { BrandLogo } from "@/components/brand/brand-logo";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { VoiceAvatar } from "@/components/voice/voice-avatar";
import { VoiceControls } from "@/components/voice/voice-controls";
import { ThemePicker } from "@/components/theme/theme-picker";
import {
  VoiceQuestionCard,
  VoiceStatusPills,
  type VoiceUiState,
} from "@/components/voice/voice-question-card";
import {
  VoiceTranscriptSidebar,
  type TranscriptEntry,
} from "@/components/voice/voice-transcript-sidebar";
import { useVoiceRecorder } from "@/components/voice/use-voice-recorder";
import type { CandidateFacingQuestion } from "@/types/domain/interview";
import type { VoiceTranscript } from "@/types/domain/voice";
import { INTERVIEW_TYPE_LABELS, type InterviewType } from "@/types/domain/enums";

interface VoiceRoomProps {
  sessionId: string;
  interviewType: InterviewType;
  durationMinutes: number;
  startedAt: string | null;
  technologyNames: string[];
  topicNames: string[];
  maxAnswerSeconds?: number;
  silenceMs?: number;
}

interface SubmitAnswerResponse {
  action: "follow_up" | "next_question" | "ended" | "coding";
  nextQuestion?: CandidateFacingQuestion;
}

type FinalizeRecordingFn = () => Promise<void>;
type StartListeningFn = () => Promise<void>;

function formatElapsed(totalSeconds: number): string {
  const m = Math.floor(totalSeconds / 60);
  const s = totalSeconds % 60;
  return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}

export function VoiceRoom({
  sessionId,
  interviewType,
  durationMinutes,
  startedAt: initialStartedAt,
  technologyNames,
  topicNames,
  maxAnswerSeconds = 180,
  silenceMs = 0,
}: VoiceRoomProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [isEnding, setIsEnding] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [isTtsPlaying, setIsTtsPlaying] = useState(false);
  const [question, setQuestion] = useState<CandidateFacingQuestion | null>(null);
  const [startedAt, setStartedAt] = useState(initialStartedAt);
  const [elapsed, setElapsed] = useState(0);
  const [entries, setEntries] = useState<TranscriptEntry[]>([]);
  const [draftText, setDraftText] = useState("");
  const [pendingTranscript, setPendingTranscript] = useState<VoiceTranscript | null>(null);
  const [micGranted, setMicGranted] = useState<boolean | null>(null);

  const startedRef = useRef(false);
  const endingRef = useRef(false);
  const submittingRef = useRef(false);
  const questionStartedAtRef = useRef(Date.now());
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const objectUrlRef = useRef<string | null>(null);
  const questionRef = useRef<CandidateFacingQuestion | null>(null);
  const draftTextRef = useRef("");
  const pendingTranscriptRef = useRef<VoiceTranscript | null>(null);

  const finalizeRecordingRef = useRef<FinalizeRecordingFn>(async () => undefined);
  const startListeningRef = useRef<StartListeningFn>(async () => undefined);

  const recorder = useVoiceRecorder({
    maxSeconds: maxAnswerSeconds,
    silenceMs,
    onAutoStop: () => {
      void finalizeRecordingRef.current();
    },
  });

  questionRef.current = question;
  draftTextRef.current = draftText;
  pendingTranscriptRef.current = pendingTranscript;

  const focusLine =
    topicNames.length > 0
      ? `Focus: ${topicNames.slice(0, 2).join(" & ")}`
      : technologyNames.length > 0
        ? `Focus: ${technologyNames.slice(0, 2).join(" & ")}`
        : INTERVIEW_TYPE_LABELS[interviewType];

  const uiState: VoiceUiState = isTranscribing
    ? "processing"
    : isTtsPlaying
      ? "ai_speaking"
      : recorder.status === "recording"
        ? "listening"
        : pendingTranscript || draftText.trim()
          ? "ready_to_submit"
          : "idle";

  const stopAudio = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
    }
    if (objectUrlRef.current) {
      URL.revokeObjectURL(objectUrlRef.current);
      objectUrlRef.current = null;
    }
    setIsTtsPlaying(false);
  }, []);

  const startListening = useCallback(async () => {
    if (endingRef.current || submittingRef.current) return;
    if (recorder.status === "recording" || recorder.status === "paused") return;
    try {
      await recorder.start();
    } catch {
      toast.error("Could not start the microphone. Tap the mic to try again.");
    }
  }, [recorder]);

  startListeningRef.current = startListening;

  const playTts = useCallback(
    async (text: string, opts?: { autoListen?: boolean }) => {
      stopAudio();
      let playedOk = false;
      try {
        setIsTtsPlaying(true);
        const res = await fetch(`/api/interviews/${sessionId}/voice/tts`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ text }),
        });
        if (!res.ok) throw new Error("TTS failed");
        const blob = await res.blob();
        const url = URL.createObjectURL(blob);
        objectUrlRef.current = url;
        const audio = new Audio(url);
        audioRef.current = audio;
        await new Promise<void>((resolve, reject) => {
          audio.onended = () => resolve();
          audio.onerror = () => reject(new Error("Audio playback failed"));
          void audio.play().catch(reject);
        });
        playedOk = true;
      } catch {
        toast.error("Could not play the question audio.");
      } finally {
        setIsTtsPlaying(false);
      }

      if (playedOk && opts?.autoListen && !endingRef.current && !submittingRef.current) {
        await startListeningRef.current();
      }
    },
    [sessionId, stopAudio]
  );

  const appendAiEntry = useCallback((text: string) => {
    setEntries((prev) => [
      ...prev.filter((e) => !e.editable),
      { id: `ai-${Date.now()}`, role: "ai", text },
      {
        id: `you-draft-${Date.now()}`,
        role: "you",
        text: "",
        editable: true,
      },
    ]);
    setDraftText("");
    setPendingTranscript(null);
  }, []);

  useEffect(() => {
    if (startedRef.current) return;
    startedRef.current = true;

    async function boot() {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        stream.getTracks().forEach((t) => t.stop());
        setMicGranted(true);
      } catch {
        setMicGranted(false);
        setIsLoading(false);
        return;
      }

      try {
        const res = await fetch(`/api/interviews/${sessionId}/start`, { method: "POST" });
        if (!res.ok) throw new Error("start failed");
        const data = (await res.json()) as {
          session: { started_at: string | null };
          question: CandidateFacingQuestion;
        };
        setQuestion(data.question);
        setStartedAt(data.session.started_at);
        questionStartedAtRef.current = Date.now();
        appendAiEntry(data.question.body);
        void playTts(data.question.body, { autoListen: true });
      } catch {
        toast.error("Could not start the interview. Please try again.");
      } finally {
        setIsLoading(false);
      }
    }

    void boot();
  }, [sessionId, appendAiEntry, playTts]);

  const goToReport = useCallback(() => {
    router.push(`/interviews/${sessionId}/report`);
  }, [router, sessionId]);

  const recorderStatusRef = useRef(recorder.status);
  const recorderStopRef = useRef(recorder.stop);
  recorderStatusRef.current = recorder.status;
  recorderStopRef.current = recorder.stop;

  const handleEnd = useCallback(
    async (reason: "candidate_ended" | "time_expired" = "candidate_ended") => {
      if (endingRef.current) return;
      endingRef.current = true;
      setIsEnding(true);
      stopAudio();
      const status = recorderStatusRef.current;
      if (status === "recording" || status === "paused") {
        try {
          await recorderStopRef.current();
        } catch {
          // Best-effort stop; ending the session takes priority.
        }
      }
      try {
        const res = await fetch(`/api/interviews/${sessionId}/end`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ reason }),
        });
        if (!res.ok) throw new Error();
        toast.success("Interview ended — opening your report…");
        goToReport();
      } catch {
        toast.error("Could not end the interview. Please try again.");
        endingRef.current = false;
        setIsEnding(false);
      }
    },
    [sessionId, goToReport, stopAudio]
  );

  useEffect(() => {
    if (!startedAt) return;
    const tick = () => {
      const seconds = Math.max(
        0,
        Math.floor((Date.now() - new Date(startedAt).getTime()) / 1000)
      );
      setElapsed(seconds);
      if (seconds >= durationMinutes * 60) {
        void handleEnd("time_expired");
      }
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [startedAt, durationMinutes, handleEnd]);

  const submitAnswer = useCallback(async () => {
      const currentQuestion = questionRef.current;
      const answerText = draftTextRef.current.trim();
      if (!currentQuestion || !answerText || submittingRef.current || endingRef.current) return;

      submittingRef.current = true;
      setIsSubmitting(true);
      const durationSeconds = Math.round((Date.now() - questionStartedAtRef.current) / 1000);
      const sourceTranscript = pendingTranscriptRef.current;
      const transcript: VoiceTranscript = sourceTranscript
        ? { ...sourceTranscript, finalText: answerText }
        : {
            provider: "mock",
            language: "en",
            finalText: answerText,
            rawText: answerText,
            segments: [],
          };

      try {
        const res = await fetch(`/api/interviews/${sessionId}/answer`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            questionId: currentQuestion.id,
            answerText,
            durationSeconds,
            transcript,
          }),
        });
        if (!res.ok) throw new Error();

        const result: SubmitAnswerResponse = await res.json();

        setEntries((prev) => [
          ...prev.map((e) => (e.editable ? { ...e, editable: false, text: answerText } : e)),
        ]);
        setDraftText("");
        setPendingTranscript(null);

        if (result.action === "ended") {
          endingRef.current = true;
          setIsEnding(true);
          toast.success("Interview complete — opening your report…");
          goToReport();
          return;
        }

        if (result.action === "coding") {
          toast.success("Text round complete — starting the coding challenge…");
          router.push(`/interviews/${sessionId}/coding`);
          return;
        }

        if (result.nextQuestion) {
          setQuestion(result.nextQuestion);
          questionStartedAtRef.current = Date.now();
          appendAiEntry(result.nextQuestion.body);
          void playTts(result.nextQuestion.body, { autoListen: true });
        }
      } catch {
        toast.error("Could not submit your answer. Please try again.");
      } finally {
        submittingRef.current = false;
        setIsSubmitting(false);
      }
  }, [sessionId, goToReport, router, appendAiEntry, playTts]);

  const finalizeRecording = useCallback(async () => {
    if (recorder.status === "idle") return;
    setIsTranscribing(true);
    try {
      const result = await recorder.stop();
      if (!result || result.blob.size === 0) {
        toast.error("No speech detected. Tap the mic to try again.");
        return;
      }
      const form = new FormData();
      form.append("audio", result.blob, "answer.webm");
      form.append("durationSeconds", String(Math.round(result.durationSeconds)));
      const res = await fetch(`/api/interviews/${sessionId}/voice/transcribe`, {
        method: "POST",
        body: form,
      });
      if (!res.ok) {
        const body = await res.json().catch(() => null);
        throw new Error(body?.error?.message ?? "Transcription failed");
      }
      const data = (await res.json()) as { transcript: VoiceTranscript };
      setPendingTranscript(data.transcript);
      setDraftText(data.transcript.finalText);
      if (!data.transcript.finalText.trim()) {
        toast.error("No speech detected. Edit the draft or tap the mic to re-record.");
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not transcribe audio.");
    } finally {
      setIsTranscribing(false);
    }
  }, [recorder, sessionId]);

  finalizeRecordingRef.current = finalizeRecording;

  async function handleMicToggle() {
    if (recorder.status === "recording" || recorder.status === "paused") {
      // Stop → STT into editable draft; candidate Finish Answer to submit
      await finalizeRecording();
      return;
    }
    stopAudio();
    await startListening();
  }

  async function handleFinishAnswer() {
    await submitAnswer();
  }

  if (micGranted === false) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center gap-md p-xl text-center">
        <BrandLogo variant="mark" href={null} />
        <h1 className="font-headline-md text-headline-md">Microphone access needed</h1>
        <p className="max-w-md text-body-sm text-muted-foreground">
          Allow microphone permission in your browser, then refresh this page to continue the voice
          interview.
        </p>
      </div>
    );
  }

  if (isLoading || !question) {
    return (
      <div className="flex flex-1 items-center justify-center gap-sm text-muted-foreground">
        <Loader2 className="size-5 animate-spin" />
        Starting voice interview…
      </div>
    );
  }

  const busy = isSubmitting || isTranscribing || isEnding;

  return (
    <div className="relative flex h-full min-h-0 flex-col overflow-hidden bg-background text-foreground">
      <header className="z-40 flex min-h-16 w-full flex-wrap items-center justify-between gap-sm border-b border-border bg-background/80 px-md py-sm backdrop-blur-md sm:px-lg">
        <div className="flex min-w-0 items-center gap-sm sm:gap-md">
          <BrandLogo variant="mark" href="/dashboard" />
          <div className="min-w-0">
            <h1 className="truncate font-headline-md text-base leading-none text-foreground sm:text-headline-md">
              {INTERVIEW_TYPE_LABELS[interviewType]} Interview
            </h1>
            <p className="hidden truncate font-label-md text-label-md text-muted-foreground sm:block">
              {focusLine}
            </p>
          </div>
        </div>
        <div className="flex flex-wrap items-center justify-end gap-sm sm:gap-md">
          <Sheet>
            <SheetTrigger
              render={
                <Button type="button" variant="outline" size="sm" className="md:hidden" aria-label="Open transcript">
                  <NotebookText className="size-4" aria-hidden />
                  Transcript
                </Button>
              }
            />
            <SheetContent side="right" className="w-[min(100%,22rem)] bg-background p-md">
              <SheetHeader>
                <SheetTitle>Live transcript</SheetTitle>
                <SheetDescription className="sr-only">Spoken answers for this question</SheetDescription>
              </SheetHeader>
              <VoiceTranscriptSidebar
                entries={entries}
                draftText={draftText}
                onDraftChange={setDraftText}
                draftEditable={!busy}
              />
            </SheetContent>
          </Sheet>
          <ThemePicker variant="topbar" />
          <div className="flex items-center gap-sm rounded-lg border border-border bg-muted/50 px-sm py-sm sm:px-md">
            <Timer className="size-4 text-primary sm:size-5" aria-hidden />
            <span className="font-label-md text-label-md tabular-nums">{formatElapsed(elapsed)}</span>
          </div>
            <AlertDialog>
              <AlertDialogTrigger
                render={
                  <button
                    type="button"
                    disabled={isEnding}
                    className="inline-flex items-center gap-sm rounded-lg bg-destructive px-md py-sm font-label-md text-label-md text-destructive-foreground shadow-sm transition-all hover:bg-destructive/90 active:scale-95 disabled:opacity-50 sm:px-lg"
                  >
                    {isEnding && <Loader2 className="size-4 animate-spin" aria-hidden />}
                    <span className="hidden sm:inline">End Interview</span>
                    <span className="sm:hidden">End</span>
                  </button>
                }
              />
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>End this interview?</AlertDialogTitle>
                  <AlertDialogDescription>
                    You will receive a report based on the answers submitted so far.
                    Generating the report may take a moment.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel disabled={isEnding}>Keep going</AlertDialogCancel>
                  <AlertDialogAction
                    disabled={isEnding}
                    onClick={() => void handleEnd("candidate_ended")}
                  >
                    {isEnding && <Loader2 className="size-4 animate-spin" aria-hidden />}
                    End interview
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
        </div>
      </header>

      {isEnding && (
        <div
          className="absolute inset-0 z-50 flex flex-col items-center justify-center gap-md bg-background/90 px-lg text-center backdrop-blur-sm"
          role="status"
          aria-live="polite"
          aria-busy="true"
        >
          <Loader2 className="size-10 animate-spin text-primary" aria-hidden />
          <div className="space-y-xs">
            <p className="font-headline-md text-headline-md text-foreground">
              Ending interview…
            </p>
            <p className="max-w-sm text-body-sm text-muted-foreground">
              Generating your feedback report. This can take up to a minute — please keep this tab
              open.
            </p>
          </div>
        </div>
      )}

      <main className="relative flex min-h-0 flex-1 flex-col gap-md overflow-hidden px-md pt-md sm:gap-lg sm:px-lg sm:pt-lg md:flex-row md:pb-lg">
        <div className="flex min-h-0 min-w-0 flex-1 flex-col items-center gap-md overflow-hidden">
          {/* Avatar pinned — never scrolls away when the question is long */}
          <div className="flex w-full max-w-2xl shrink-0 flex-col items-center">
            <VoiceAvatar
              speaking={isTtsPlaying}
              listening={recorder.status === "recording"}
              size="sm"
            />
          </div>
          <div className="flex min-h-0 w-full max-w-2xl flex-1 flex-col items-center">
            <VoiceQuestionCard questionBody={question.body} uiState={uiState} />
          </div>
        </div>
        <div className="hidden min-h-0 md:flex">
          <VoiceTranscriptSidebar
            entries={entries}
            draftText={draftText}
            onDraftChange={setDraftText}
            draftEditable={!busy}
          />
        </div>
        <div className="hidden md:block">
          <VoiceStatusPills uiState={uiState} />
        </div>
      </main>

      <VoiceControls
        micActive={recorder.status === "recording" || recorder.status === "paused"}
        isMuted={recorder.isMuted}
        isPaused={recorder.status === "paused"}
        canFinish={draftText.trim().length > 0 && !busy}
        isBusy={busy}
        isAiSpeaking={isTtsPlaying}
        onReplay={() => {
          if (question) void playTts(question.body);
        }}
        onPauseToggle={() => {
          if (recorder.status === "recording") recorder.pause();
          else if (recorder.status === "paused") recorder.resume();
        }}
        onMicToggle={() => void handleMicToggle()}
        onMuteToggle={() => recorder.mute(!recorder.isMuted)}
        onFinish={() => void handleFinishAnswer()}
      />

      {recorder.error && (
        <p className="bg-destructive/10 px-lg py-sm text-center text-body-sm text-destructive">
          {recorder.error}
        </p>
      )}
    </div>
  );
}
