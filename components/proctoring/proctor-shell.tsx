"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import type { AntiCheatingSettings } from "@/types/domain/assessment";

type FaceDetector = {
  detectForVideo: (
    video: HTMLVideoElement,
    timestamp: number
  ) => { detections: unknown[] };
  close: () => void;
};

async function createFaceDetector(): Promise<FaceDetector | null> {
  try {
    const vision = await import("@mediapipe/tasks-vision");
    const fileset = await vision.FilesetResolver.forVisionTasks(
      "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@latest/wasm"
    );
    return await vision.FaceDetector.createFromOptions(fileset, {
      baseOptions: {
        modelAssetPath:
          "https://storage.googleapis.com/mediapipe-models/face_detector/blaze_face_short_range/float16/1/blaze_face_short_range.tflite",
        delegate: "GPU",
      },
      runningMode: "VIDEO",
    });
  } catch {
    return null;
  }
}

function ProctorHud({
  warning,
  violationCount,
  showWebcam,
  requireFullscreen,
  bindWebcam,
  onReenterFullscreen,
}: {
  warning: string | null;
  violationCount: number;
  showWebcam: boolean;
  requireFullscreen: boolean;
  bindWebcam: (node: HTMLVideoElement | null) => void;
  onReenterFullscreen: () => void;
}) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  const showFullscreenAction =
    requireFullscreen && !!warning && /fullscreen/i.test(warning);

  return createPortal(
    <aside
      className="pointer-events-none fixed bottom-32 right-6 z-40 flex max-w-[min(16rem,calc(100vw-1.5rem))] flex-col items-end gap-sm"
      aria-live="polite"
    >
      {warning ? (
        <div className="pointer-events-auto w-max max-w-full rounded-lg bg-destructive px-md py-sm text-sm text-destructive-foreground shadow-lg">
          <p className="leading-snug">{warning}</p>
          {showFullscreenAction ? (
            <button
              type="button"
              className="mt-xs font-label-sm text-label-sm underline underline-offset-2"
              onClick={onReenterFullscreen}
            >
              Return to fullscreen
            </button>
          ) : null}
        </div>
      ) : null}

      {showWebcam ? (
        <div className="relative">
          <video
            ref={bindWebcam}
            muted
            playsInline
            className="h-20 w-20 rounded-lg border border-border bg-black object-cover shadow-md"
          />
          {violationCount > 0 ? (
            <span className="absolute -left-1 -top-1 min-w-5 rounded-full bg-destructive px-1.5 py-px text-center text-[10px] font-semibold leading-4 text-destructive-foreground shadow">
              {violationCount}
            </span>
          ) : null}
        </div>
      ) : violationCount > 0 ? (
        <span className="rounded-full bg-background/95 px-sm py-0.5 text-xs text-muted-foreground shadow">
          Violations: {violationCount}
        </span>
      ) : null}
    </aside>,
    document.body
  );
}

export function ProctorShell({
  sessionId,
  settings,
  children,
}: {
  sessionId: string;
  settings: AntiCheatingSettings;
  children: React.ReactNode;
}) {
  const [ready, setReady] = useState(false);
  const [warning, setWarning] = useState<string | null>(null);
  const [violationCount, setViolationCount] = useState(0);
  const webcamRef = useRef<HTMLVideoElement>(null);
  const webcamStreamRef = useRef<MediaStream | null>(null);
  const screenStreamRef = useRef<MediaStream | null>(null);
  const recordersRef = useRef<MediaRecorder[]>([]);
  const chunkIndexRef = useRef({ webcam: 0, screen: 0 });
  const detectorRef = useRef<FaceDetector | null>(null);
  const faceStateRef = useRef<"ok" | "no_face" | "multi_face">("ok");
  const showWebcam = settings.requireWebcam || settings.recordWebcam;

  const postEvent = useCallback(
    async (eventType: string, severity: "info" | "warning" | "critical" = "info") => {
      try {
        const res = await fetch("/api/proctoring/events", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ sessionId, eventType, severity, payload: {} }),
        });
        if (res.ok) {
          const data = await res.json();
          if (data.integrity?.flagged) {
            setWarning("Integrity flagged — unusual activity detected. Continue carefully.");
          }
        }
      } catch {
        // best-effort
      }
    },
    [sessionId]
  );

  const bindWebcam = useCallback((node: HTMLVideoElement | null) => {
    webcamRef.current = node;
    const stream = webcamStreamRef.current;
    if (!node || !stream) return;
    if (node.srcObject !== stream) {
      node.srcObject = stream;
    }
    void node.play().catch(() => undefined);
  }, []);

  const reenterFullscreen = useCallback(async () => {
    try {
      await document.documentElement.requestFullscreen();
      setWarning(null);
      await postEvent("fullscreen_enter");
    } catch {
      setWarning("Fullscreen exited — click to return.");
    }
  }, [postEvent]);

  const uploadChunk = useCallback(
    async (kind: "webcam" | "screen", blob: Blob) => {
      const idx = chunkIndexRef.current[kind]++;
      const form = new FormData();
      form.set(
        "meta",
        JSON.stringify({
          sessionId,
          kind,
          chunkIndex: idx,
          mimeType: blob.type,
          byteSize: blob.size,
        })
      );
      form.set("file", blob, `${kind}-${idx}.webm`);
      await fetch("/api/proctoring/recordings", { method: "POST", body: form });
      await postEvent("recording_chunk", "info");
    },
    [postEvent, sessionId]
  );

  const startRecorder = useCallback(
    (stream: MediaStream, kind: "webcam" | "screen") => {
      if (!MediaRecorder.isTypeSupported("video/webm;codecs=vp8")) return;
      const recorder = new MediaRecorder(stream, {
        mimeType: "video/webm;codecs=vp8",
        videoBitsPerSecond: 600_000,
      });
      recorder.ondataavailable = (ev) => {
        if (ev.data.size > 0) void uploadChunk(kind, ev.data);
      };
      recorder.start(15_000);
      recordersRef.current.push(recorder);
    },
    [uploadChunk]
  );

  async function enableProctoring() {
    try {
      if (settings.requireWebcam || settings.recordWebcam) {
        const cam = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: "user", width: 640, height: 480 },
          audio: false,
        });
        webcamStreamRef.current = cam;
        if (webcamRef.current) {
          webcamRef.current.srcObject = cam;
          await webcamRef.current.play();
        }
        await postEvent("webcam_granted");
        if (settings.recordWebcam) startRecorder(cam, "webcam");
      }

      if (settings.requireScreenShare || settings.recordScreen) {
        const screen = await navigator.mediaDevices.getDisplayMedia({
          video: { displaySurface: "monitor" } as MediaTrackConstraints,
          audio: false,
        });
        screenStreamRef.current = screen;
        screen.getVideoTracks()[0]?.addEventListener("ended", () => {
          void postEvent("fullscreen_exit", "critical");
          setWarning("Screen share stopped — please share your screen again.");
          setViolationCount((c) => c + 1);
        });
        await postEvent("screen_granted");
        if (settings.recordScreen) startRecorder(screen, "screen");
      }

      if (settings.requireFullscreen) {
        await document.documentElement.requestFullscreen().catch(() => undefined);
        await postEvent("fullscreen_enter");
      }

      if (settings.detectMultiFace || settings.detectNoFace) {
        detectorRef.current = await createFaceDetector();
      }

      setReady(true);
      await postEvent("session_start");
      toast.success("Proctoring active");
    } catch (err) {
      toast.error(
        err instanceof Error
          ? err.message
          : "Could not start proctoring. Allow camera and screen share."
      );
    }
  }

  useEffect(() => {
    if (!ready) return;

    function onVisibility() {
      if (!settings.detectTabBlur) return;
      if (document.hidden) {
        void postEvent("tab_blur", "warning");
        setWarning("Tab switch detected");
        setViolationCount((c) => c + 1);
      } else {
        void postEvent("tab_focus");
      }
    }

    function onFsChange() {
      if (!settings.requireFullscreen) return;
      if (!document.fullscreenElement) {
        void postEvent("fullscreen_exit", "critical");
        setWarning("Fullscreen exited");
        setViolationCount((c) => c + 1);
      }
    }

    function onClipboard(e: Event) {
      if (!settings.blockClipboard) return;
      e.preventDefault();
      void postEvent("clipboard_blocked", "warning");
      setViolationCount((c) => c + 1);
    }

    document.addEventListener("visibilitychange", onVisibility);
    document.addEventListener("fullscreenchange", onFsChange);
    document.addEventListener("copy", onClipboard);
    document.addEventListener("cut", onClipboard);
    document.addEventListener("paste", onClipboard);

    const faceTimer = window.setInterval(() => {
      const detector = detectorRef.current;
      const video = webcamRef.current;
      if (!detector || !video || video.readyState < 2) return;
      try {
        const result = detector.detectForVideo(video, performance.now());
        const n = result.detections?.length ?? 0;
        let next: "ok" | "no_face" | "multi_face" = "ok";
        if (settings.detectNoFace && n === 0) next = "no_face";
        if (settings.detectMultiFace && n >= 2) next = "multi_face";
        if (next !== faceStateRef.current) {
          faceStateRef.current = next;
          if (next === "no_face") {
            void postEvent("no_face", "critical");
            setWarning("Face not visible");
            setViolationCount((c) => c + 1);
          } else if (next === "multi_face") {
            void postEvent("multi_face", "critical");
            setWarning("Multiple faces detected");
            setViolationCount((c) => c + 1);
          } else {
            void postEvent("face_ok");
            setWarning(null);
          }
        }
      } catch {
        // ignore detection blips
      }
    }, 1500);

    return () => {
      document.removeEventListener("visibilitychange", onVisibility);
      document.removeEventListener("fullscreenchange", onFsChange);
      document.removeEventListener("copy", onClipboard);
      document.removeEventListener("cut", onClipboard);
      document.removeEventListener("paste", onClipboard);
      window.clearInterval(faceTimer);
    };
  }, [ready, postEvent, settings]);

  useEffect(() => {
    return () => {
      for (const r of recordersRef.current) {
        if (r.state !== "inactive") r.stop();
      }
      webcamStreamRef.current?.getTracks().forEach((t) => t.stop());
      screenStreamRef.current?.getTracks().forEach((t) => t.stop());
      detectorRef.current?.close();
      void postEvent("session_end");
    };
  }, [postEvent]);

  if (!ready) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-lg bg-background px-lg text-center">
        <div className="max-w-md space-y-md">
          <h1 className="font-headline-lg text-headline-lg">Proctored assessment</h1>
          <p className="text-muted-foreground">
            Before you begin you must enable webcam
            {settings.requireScreenShare ? ", share your entire screen" : ""}, and stay in
            fullscreen. Leaving the tab, copying text, or multiple faces will be logged.
          </p>
          <video
            ref={webcamRef}
            muted
            playsInline
            className="mx-auto hidden h-32 w-32 rounded-full object-cover"
          />
          <Button size="lg" onClick={() => void enableProctoring()}>
            Enable camera &amp; screen, then start
          </Button>
        </div>
      </div>
    );
  }

  return (
    <>
      <ProctorHud
        warning={warning}
        violationCount={violationCount}
        showWebcam={showWebcam}
        requireFullscreen={settings.requireFullscreen}
        bindWebcam={bindWebcam}
        onReenterFullscreen={() => void reenterFullscreen()}
      />
      {children}
    </>
  );
}
