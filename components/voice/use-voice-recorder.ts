"use client";

import { useCallback, useEffect, useRef, useState } from "react";

export type RecorderStatus = "idle" | "recording" | "paused";

export interface UseVoiceRecorderResult {
  status: RecorderStatus;
  level: number;
  error: string | null;
  supported: boolean;
  start: () => Promise<void>;
  pause: () => void;
  resume: () => void;
  stop: () => Promise<{ blob: Blob; durationSeconds: number } | null>;
  mute: (muted: boolean) => void;
  isMuted: boolean;
}

function pickMimeType(): string | undefined {
  if (typeof MediaRecorder === "undefined") return undefined;
  const candidates = [
    "audio/webm;codecs=opus",
    "audio/webm",
    "audio/mp4",
    "audio/ogg;codecs=opus",
  ];
  return candidates.find((t) => MediaRecorder.isTypeSupported(t));
}

export function useVoiceRecorder(opts?: {
  maxSeconds?: number;
  silenceMs?: number;
  onAutoStop?: () => void;
}): UseVoiceRecorderResult {
  const [status, setStatus] = useState<RecorderStatus>("idle");
  const [level, setLevel] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [isMuted, setIsMuted] = useState(false);
  const [supported] = useState(
    () => typeof window !== "undefined" && typeof MediaRecorder !== "undefined"
  );

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const startedAtRef = useRef(0);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const rafRef = useRef<number | null>(null);
  const silenceStartedRef = useRef<number | null>(null);
  const maxSeconds = opts?.maxSeconds ?? 180;
  const silenceMs = opts?.silenceMs ?? 2500;
  const onAutoStopRef = useRef(opts?.onAutoStop);
  onAutoStopRef.current = opts?.onAutoStop;

  const cleanupMeter = useCallback(() => {
    if (rafRef.current != null) {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    }
    setLevel(0);
  }, []);

  const stopTracks = useCallback(() => {
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
    void audioCtxRef.current?.close().catch(() => undefined);
    audioCtxRef.current = null;
    analyserRef.current = null;
  }, []);

  useEffect(() => {
    return () => {
      cleanupMeter();
      mediaRecorderRef.current?.state !== "inactive" && mediaRecorderRef.current?.stop();
      stopTracks();
    };
  }, [cleanupMeter, stopTracks]);

  const tickMeter = useCallback(() => {
    const analyser = analyserRef.current;
    if (!analyser) return;
    const data = new Uint8Array(analyser.fftSize);
    analyser.getByteTimeDomainData(data);
    let sum = 0;
    for (let i = 0; i < data.length; i++) {
      const v = (data[i]! - 128) / 128;
      sum += v * v;
    }
    const rms = Math.sqrt(sum / data.length);
    setLevel(rms);

    if (mediaRecorderRef.current?.state === "recording") {
      const elapsed = (Date.now() - startedAtRef.current) / 1000;
      if (elapsed >= maxSeconds) {
        onAutoStopRef.current?.();
        return;
      }
      if (rms < 0.02) {
        if (silenceStartedRef.current == null) silenceStartedRef.current = Date.now();
        else if (Date.now() - silenceStartedRef.current >= silenceMs && elapsed > 2) {
          onAutoStopRef.current?.();
          return;
        }
      } else {
        silenceStartedRef.current = null;
      }
    }

    rafRef.current = requestAnimationFrame(tickMeter);
  }, [maxSeconds, silenceMs]);

  const start = useCallback(async () => {
    setError(null);
    if (!supported) {
      setError("Recording is not supported in this browser.");
      return;
    }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;
      const mimeType = pickMimeType();
      const recorder = mimeType
        ? new MediaRecorder(stream, { mimeType })
        : new MediaRecorder(stream);
      chunksRef.current = [];
      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data);
      };
      mediaRecorderRef.current = recorder;
      startedAtRef.current = Date.now();
      silenceStartedRef.current = null;

      const ctx = new AudioContext();
      audioCtxRef.current = ctx;
      const source = ctx.createMediaStreamSource(stream);
      const analyser = ctx.createAnalyser();
      analyser.fftSize = 256;
      source.connect(analyser);
      analyserRef.current = analyser;
      rafRef.current = requestAnimationFrame(tickMeter);

      recorder.start(250);
      setStatus("recording");
    } catch {
      setError("Microphone permission is required for voice interviews.");
      stopTracks();
    }
  }, [supported, stopTracks, tickMeter]);

  const pause = useCallback(() => {
    const rec = mediaRecorderRef.current;
    if (rec?.state === "recording") {
      rec.pause();
      setStatus("paused");
    }
  }, []);

  const resume = useCallback(() => {
    const rec = mediaRecorderRef.current;
    if (rec?.state === "paused") {
      rec.resume();
      setStatus("recording");
    }
  }, []);

  const mute = useCallback((muted: boolean) => {
    streamRef.current?.getAudioTracks().forEach((t) => {
      t.enabled = !muted;
    });
    setIsMuted(muted);
  }, []);

  const stop = useCallback(async () => {
    const rec = mediaRecorderRef.current;
    if (!rec || rec.state === "inactive") {
      cleanupMeter();
      stopTracks();
      setStatus("idle");
      return null;
    }

    const durationSeconds = (Date.now() - startedAtRef.current) / 1000;
    const blob = await new Promise<Blob>((resolve) => {
      rec.onstop = () => {
        resolve(new Blob(chunksRef.current, { type: rec.mimeType || "audio/webm" }));
      };
      rec.stop();
    });

    cleanupMeter();
    stopTracks();
    mediaRecorderRef.current = null;
    setStatus("idle");
    return { blob, durationSeconds };
  }, [cleanupMeter, stopTracks]);

  return { status, level, error, supported, start, pause, resume, stop, mute, isMuted };
}
