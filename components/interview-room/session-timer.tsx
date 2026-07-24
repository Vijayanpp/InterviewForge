"use client";

import { useEffect, useState } from "react";

function formatTime(totalSeconds: number): string {
  const clamped = Math.max(0, Math.round(totalSeconds));
  const hours = Math.floor(clamped / 3600);
  const minutes = Math.floor((clamped % 3600) / 60);
  const seconds = clamped % 60;
  const pad = (n: number) => n.toString().padStart(2, "0");
  return hours > 0 ? `${pad(hours)}:${pad(minutes)}:${pad(seconds)}` : `${pad(minutes)}:${pad(seconds)}`;
}

export function SessionTimer({
  durationMinutes,
  startedAt,
  onExpire,
}: {
  durationMinutes: number;
  startedAt: string | null;
  onExpire: () => void;
}) {
  const [remainingSeconds, setRemainingSeconds] = useState(durationMinutes * 60);
  const hasExpired = remainingSeconds <= 0;

  useEffect(() => {
    if (!startedAt) return;

    const totalSeconds = durationMinutes * 60;
    const startedMs = new Date(startedAt).getTime();

    const tick = () => {
      const elapsed = (Date.now() - startedMs) / 1000;
      setRemainingSeconds(Math.max(0, totalSeconds - elapsed));
    };

    tick();
    const interval = setInterval(tick, 1000);
    return () => clearInterval(interval);
  }, [durationMinutes, startedAt]);

  useEffect(() => {
    if (hasExpired) onExpire();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hasExpired]);

  return (
    <div className="flex items-center gap-sm rounded-full bg-destructive/10 px-md py-1.5 text-destructive">
      <span className="h-2 w-2 animate-pulse rounded-full bg-destructive" />
      <span className="font-label-md text-label-md">{formatTime(remainingSeconds)} remaining</span>
    </div>
  );
}
