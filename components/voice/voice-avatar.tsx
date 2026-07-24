"use client";

import Image from "next/image";
import { cn } from "@/lib/utils";

export function VoiceAvatar({
  speaking,
  listening,
  /** Compact keeps the avatar visible when the question card needs vertical space. */
  size = "md",
}: {
  speaking: boolean;
  listening: boolean;
  size?: "sm" | "md";
}) {
  const dim = size === "sm" ? "h-28 w-28" : "h-40 w-40";
  const px = size === "sm" ? 112 : 160;

  return (
    <div className={cn("relative", size === "sm" ? "mb-md" : "mb-lg")}>
      {(speaking || listening) && (
        <div className="absolute inset-0 animate-[pulse_2s_cubic-bezier(0.4,0,0.6,1)_infinite] rounded-full bg-primary/10" />
      )}
      <div
        className={cn(
          "relative overflow-hidden rounded-full border-4 border-card shadow-xl",
          dim
        )}
      >
        <Image
          src="/images/ai-avatar.jpg"
          alt="InterviewForge AI interviewer avatar"
          width={px}
          height={px}
          className="h-full w-full object-cover"
          priority
        />
      </div>
      <div
        className={cn(
          "absolute -bottom-3 left-1/2 flex -translate-x-1/2 items-end gap-1 rounded-full border border-border bg-card px-3 py-2 shadow-lg",
          !speaking && "opacity-40"
        )}
        aria-hidden
      >
        {[0.1, 0.3, 0.2, 0.5, 0.4, 0.6].map((delay, i) => (
          <div
            key={i}
            className={cn(
              "w-1 rounded-full bg-primary",
              speaking && "animate-[bounce_1.2s_ease-in-out_infinite]"
            )}
            style={{
              height: speaking ? 12 + (i % 3) * 3 : 6,
              animationDelay: `${delay}s`,
            }}
          />
        ))}
      </div>
    </div>
  );
}
