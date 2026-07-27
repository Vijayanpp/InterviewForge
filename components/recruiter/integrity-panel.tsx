"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

type EventRow = {
  id: string;
  event_type: string;
  severity: string;
  created_at: string;
  payload: Record<string, unknown>;
};

type RecordingRow = {
  id: string;
  kind: string;
  chunk_index: number;
  url: string | null;
  mime_type: string | null;
};

export function IntegrityPanel({
  sessionId,
  integrityScore,
  integrityFlagged,
}: {
  sessionId: string;
  integrityScore: number | null;
  integrityFlagged: boolean;
}) {
  const [events, setEvents] = useState<EventRow[]>([]);
  const [recordings, setRecordings] = useState<RecordingRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      setLoading(true);
      const [evRes, recRes] = await Promise.all([
        fetch(`/api/proctoring/events?sessionId=${sessionId}`),
        fetch(`/api/proctoring/recordings?sessionId=${sessionId}`),
      ]);
      if (!cancelled) {
        if (evRes.ok) {
          const data = await evRes.json();
          setEvents(data.events ?? []);
        }
        if (recRes.ok) {
          const data = await recRes.json();
          setRecordings(data.recordings ?? []);
        }
        setLoading(false);
      }
    }
    void load();
    return () => {
      cancelled = true;
    };
  }, [sessionId]);

  return (
    <div className="space-y-md rounded-xl border border-border p-lg">
      <div className="flex flex-wrap items-center justify-between gap-md">
        <h3 className="font-label-md text-label-md font-semibold">Integrity</h3>
        <div className="flex items-center gap-sm text-sm">
          {integrityScore != null ? (
            <span>
              Score: <strong>{Math.round(integrityScore)}</strong>
            </span>
          ) : null}
          {integrityFlagged ? (
            <span className="rounded-full bg-destructive/15 px-sm py-0.5 text-xs text-destructive">
              Flagged
            </span>
          ) : (
            <span className="rounded-full bg-emerald-500/15 px-sm py-0.5 text-xs text-emerald-700">
              Clear
            </span>
          )}
          <Button
            size="sm"
            variant="outline"
            nativeButton={false}
            render={<Link href={`/interviews/${sessionId}/report`}>Open report</Link>}
          />
        </div>
      </div>

      {loading ? (
        <p className="text-sm text-muted-foreground">Loading integrity data…</p>
      ) : (
        <>
          <div>
            <p className="mb-sm text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Event timeline
            </p>
            {events.length === 0 ? (
              <p className="text-sm text-muted-foreground">No events recorded.</p>
            ) : (
              <ul className="max-h-48 space-y-1 overflow-y-auto text-sm">
                {events.map((e) => (
                  <li key={e.id} className="flex gap-sm border-b border-border/60 py-1">
                    <span className="w-16 shrink-0 text-xs uppercase text-muted-foreground">
                      {e.severity}
                    </span>
                    <span className="flex-1 font-mono text-xs">{e.event_type}</span>
                    <span className="text-xs text-muted-foreground">
                      {new Date(e.created_at).toLocaleTimeString()}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div>
            <p className="mb-sm text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Recordings
            </p>
            {recordings.length === 0 ? (
              <p className="text-sm text-muted-foreground">No recordings uploaded.</p>
            ) : (
              <div className="grid gap-md md:grid-cols-2">
                {recordings.map((r) => (
                  <div key={r.id} className="space-y-sm">
                    <p className="text-xs capitalize text-muted-foreground">
                      {r.kind} · chunk {r.chunk_index}
                    </p>
                    {r.url ? (
                      <video src={r.url} controls className="w-full rounded-lg bg-black" />
                    ) : (
                      <p className="text-xs text-muted-foreground">URL unavailable</p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
