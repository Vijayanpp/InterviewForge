"use client";

import { useCallback, useEffect, useRef, useState } from "react";
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
    <div className="relative min-h-screen">
      <div className="pointer-events-none fixed right-4 top-4 z-50 flex flex-col items-end gap-sm">
        <video
          ref={webcamRef}
          muted
          playsInline
          className="pointer-events-none h-24 w-24 rounded-lg border border-border object-cover shadow-md"
        />
        {warning ? (
          <div className="pointer-events-none max-w-xs rounded-lg bg-destructive px-md py-sm text-sm text-destructive-foreground shadow">
            {warning}
          </div>
        ) : null}
        {violationCount > 0 ? (
          <span className="rounded-full bg-background/90 px-sm py-0.5 text-xs text-muted-foreground shadow">
            Violations: {violationCount}
          </span>
        ) : null}
      </div>
      {children}
    </div>
  );
}
