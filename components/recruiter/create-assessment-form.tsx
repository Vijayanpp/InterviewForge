"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createAssessmentAction } from "@/lib/actions/recruiter-actions";

export function CreateAssessmentForm() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [title, setTitle] = useState("");
  const [jobRole, setJobRole] = useState("");
  const [durationMinutes, setDurationMinutes] = useState(45);
  const [interviewMode, setInterviewMode] = useState<"voice" | "text">("voice");

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    const result = await createAssessmentAction({
      title,
      jobRole: jobRole || undefined,
      durationMinutes,
      interviewMode,
      technologyIds: [],
      topicIds: [],
    });
    setLoading(false);
    if (!result.success) {
      toast.error(result.error);
      return;
    }
    toast.success("Assessment created");
    router.push(`/recruiter/assessments/${result.data!.id}`);
  }

  return (
    <form onSubmit={onSubmit} className="mx-auto max-w-lg space-y-lg">
      <div className="space-y-sm">
        <h1 className="font-headline-lg text-headline-lg">New assessment</h1>
        <p className="text-muted-foreground">
          Candidates receive a timed invite and complete a proctored AI interview.
        </p>
      </div>

      <div className="space-y-sm">
        <Label htmlFor="title">Title</Label>
        <Input
          id="title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Senior Backend Screening"
          required
        />
      </div>

      <div className="space-y-sm">
        <Label htmlFor="role">Job role (optional)</Label>
        <Input
          id="role"
          value={jobRole}
          onChange={(e) => setJobRole(e.target.value)}
          placeholder="Staff Engineer"
        />
      </div>

      <div className="grid gap-md sm:grid-cols-2">
        <div className="space-y-sm">
          <Label htmlFor="duration">Duration (minutes)</Label>
          <Input
            id="duration"
            type="number"
            min={5}
            max={240}
            value={durationMinutes}
            onChange={(e) => setDurationMinutes(Number(e.target.value))}
          />
        </div>
        <div className="space-y-sm">
          <Label htmlFor="mode">Interview mode</Label>
          <select
            id="mode"
            className="flex h-9 w-full rounded-lg border border-border bg-background px-3 text-sm"
            value={interviewMode}
            onChange={(e) => setInterviewMode(e.target.value as "voice" | "text")}
          >
            <option value="voice">Voice (recommended)</option>
            <option value="text">Text</option>
          </select>
        </div>
      </div>

      <Button type="submit" size="lg" disabled={loading}>
        {loading ? "Creating…" : "Create draft"}
      </Button>
    </form>
  );
}
