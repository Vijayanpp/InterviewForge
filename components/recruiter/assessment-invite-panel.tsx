"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  inviteCandidatesAction,
  publishAssessmentAction,
} from "@/lib/actions/recruiter-actions";

export function AssessmentInvitePanel({
  assessmentId,
  status,
  appUrl,
}: {
  assessmentId: string;
  status: string;
  appUrl: string;
}) {
  const [emails, setEmails] = useState("");
  const [loading, setLoading] = useState(false);
  const [publishing, setPublishing] = useState(false);

  async function publish() {
    setPublishing(true);
    const result = await publishAssessmentAction(assessmentId);
    setPublishing(false);
    if (!result.success) {
      toast.error(result.error);
      return;
    }
    toast.success("Assessment published");
    window.location.reload();
  }

  async function invite(e: React.FormEvent) {
    e.preventDefault();
    const list = emails
      .split(/[\n,;]+/)
      .map((s) => s.trim())
      .filter(Boolean);
    setLoading(true);
    const result = await inviteCandidatesAction(assessmentId, {
      emails: list,
      expiresInDays: 7,
    });
    setLoading(false);
    if (!result.success) {
      toast.error(result.error);
      return;
    }
    toast.success(
      `Invited ${result.data?.invited ?? 0} candidate(s)${
        result.data?.emailed
          ? ` · ${result.data.emailed} emailed`
          : " · copy links below (email optional)"
      }`
    );
    setEmails("");
    window.location.reload();
  }

  return (
    <div className="space-y-lg rounded-xl border border-border p-lg">
      <div className="flex flex-wrap items-center justify-between gap-md">
        <h2 className="font-headline-md text-headline-md">Invites</h2>
        {status !== "approved" ? (
          <Button type="button" onClick={publish} disabled={publishing}>
            {publishing ? "Publishing…" : "Publish assessment"}
          </Button>
        ) : null}
      </div>

      {status !== "approved" ? (
        <p className="text-sm text-muted-foreground">
          Publish before inviting candidates. Heavy proctoring (webcam + screen) is enabled by
          default.
        </p>
      ) : (
        <form onSubmit={invite} className="space-y-md">
          <div className="space-y-sm">
            <Label htmlFor="emails">Candidate emails (one per line)</Label>
            <Textarea
              id="emails"
              rows={4}
              value={emails}
              onChange={(e) => setEmails(e.target.value)}
              placeholder={"alice@example.com\nbob@example.com"}
              required
            />
          </div>
          <Button type="submit" disabled={loading}>
            {loading ? "Sending…" : "Send invites"}
          </Button>
          <p className="text-xs text-muted-foreground">
            Links look like {appUrl}/invite/&lt;token&gt;. Without RESEND_API_KEY, invites are
            created and links appear in the table for manual copy.
          </p>
        </form>
      )}
    </div>
  );
}
