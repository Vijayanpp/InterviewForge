"use client";

import { NotebookText } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";

export interface TranscriptEntry {
  id: string;
  role: "ai" | "you";
  text: string;
  editable?: boolean;
}

export function VoiceTranscriptSidebar({
  entries,
  draftText,
  onDraftChange,
  draftEditable,
}: {
  entries: TranscriptEntry[];
  draftText: string;
  onDraftChange: (value: string) => void;
  draftEditable: boolean;
}) {
  return (
    <aside className="flex w-full flex-col gap-md md:w-80">
      <div className="flex items-center justify-between px-md">
        <h3 className="flex items-center gap-xs font-label-md text-label-md text-muted-foreground">
          <NotebookText className="size-[18px]" aria-hidden />
          LIVE TRANSCRIPT
        </h3>
      </div>
      <div className="custom-scrollbar flex-1 space-y-md overflow-y-auto pr-md">
        {entries.map((entry) => (
          <div key={entry.id} className="space-y-sm">
            <span
              className={cn(
                "ml-xs font-label-sm text-label-sm uppercase",
                entry.role === "ai" ? "text-primary" : "text-muted-foreground"
              )}
            >
              {entry.role === "ai" ? "InterviewForge AI" : "You"}
            </span>
            {entry.editable && draftEditable ? (
              <Textarea
                value={draftText}
                onChange={(e) => onDraftChange(e.target.value)}
                rows={5}
                className="rounded-xl border border-border bg-white p-md text-body-sm shadow-sm"
                placeholder="Your spoken answer will appear here — edit before finishing."
              />
            ) : (
              <div
                className={cn(
                  "rounded-xl p-md font-body-sm text-body-sm text-foreground",
                  entry.role === "ai"
                    ? "border-l-4 border-primary bg-primary/5 italic"
                    : "border border-border bg-white shadow-sm"
                )}
              >
                {entry.text}
              </div>
            )}
          </div>
        ))}
      </div>
    </aside>
  );
}
