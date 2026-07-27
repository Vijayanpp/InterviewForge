"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import type { AntiCheatingSettings } from "@/types/domain/assessment";

type InviteInfo = {
  organizationName: string;
  title: string;
  jobRole: string | null;
  durationMinutes: number;
  interviewMode: string;
  status: string;
  expired: boolean;
  assessmentStatus: string;
  antiCheating: AntiCheatingSettings;
  candidateEmail: string;
  sessionId: string | null;
};

export function InviteRedeemClient({ token }: { token: string }) {
  const router = useRouter();
  const [info, setInfo] = useState<InviteInfo | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [starting, setStarting] = useState(false);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      const res = await fetch(`/api/invite/${token}`);
      const data = await res.json();
      if (cancelled) return;
      if (!res.ok) {
        setError(data.error ?? "Invite not found");
        setLoading(false);
        return;
      }
      setInfo(data);
      setLoading(false);
    }
    void load();
    return () => {
      cancelled = true;
    };
  }, [token]);

  async function start() {
    setStarting(true);
    const res = await fetch(`/api/invite/${token}`, { method: "POST" });
    const data = await res.json();
    setStarting(false);
    if (!res.ok) {
      if (res.status === 401 || res.status === 403) {
        toast.error(data.error ?? "Sign in required");
        router.push(`/login?next=/invite/${token}`);
        return;
      }
      toast.error(data.error ?? "Could not start assessment");
      return;
    }

    const href =
      data.mode === "voice"
        ? `/interviews/${data.sessionId}/voice`
        : `/interviews/${data.sessionId}/room`;
    router.push(href);
  }

  if (loading) {
    return <p className="p-xl text-center text-muted-foreground">Loading invite…</p>;
  }

  if (error || !info) {
    return (
      <div className="mx-auto max-w-md space-y-md p-xl text-center">
        <h1 className="font-headline-lg text-headline-lg">Invite unavailable</h1>
        <p className="text-muted-foreground">{error}</p>
        <Button nativeButton={false} render={<Link href="/dashboard">Go to dashboard</Link>} />
      </div>
    );
  }

  return (
    <div className="mx-auto flex min-h-screen max-w-lg flex-col justify-center gap-lg px-lg py-2xl">
      <div className="space-y-sm">
        <p className="text-sm uppercase tracking-wide text-muted-foreground">
          {info.organizationName}
        </p>
        <h1 className="font-headline-lg text-headline-lg">{info.title}</h1>
        <p className="text-muted-foreground">
          {info.jobRole ? `${info.jobRole} · ` : ""}
          {info.durationMinutes} minutes · {info.interviewMode} · proctored
        </p>
        <p className="text-sm text-muted-foreground">
          Invited as <strong>{info.candidateEmail}</strong>. Sign in with that email.
        </p>
      </div>

      {info.expired ? (
        <p className="text-destructive">This invite has expired.</p>
      ) : info.assessmentStatus !== "approved" ? (
        <p className="text-muted-foreground">This assessment is not open yet.</p>
      ) : (
        <Button size="lg" onClick={() => void start()} disabled={starting}>
          {starting ? "Starting…" : info.sessionId ? "Resume assessment" : "Start proctored interview"}
        </Button>
      )}
    </div>
  );
}
