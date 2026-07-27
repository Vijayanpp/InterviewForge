"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { bootstrapRecruiterAction } from "@/lib/actions/recruiter-actions";

export function RecruiterOnboardingForm() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    const result = await bootstrapRecruiterAction({ organizationName: name });
    setLoading(false);
    if (result && "success" in result && !result.success) {
      toast.error(result.error);
      return;
    }
    router.refresh();
  }

  return (
    <form onSubmit={onSubmit} className="mx-auto max-w-md space-y-lg">
      <div className="space-y-sm">
        <h1 className="font-headline-lg text-headline-lg text-foreground">Hire with InterviewForge</h1>
        <p className="font-body-md text-body-md text-muted-foreground">
          Create your recruiting organization. You&apos;ll send proctored AI interview links to
          candidates and review integrity reports.
        </p>
      </div>
      <div className="space-y-sm">
        <Label htmlFor="org">Company / team name</Label>
        <Input
          id="org"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Acme Engineering"
          required
          minLength={2}
        />
      </div>
      <Button type="submit" size="lg" className="w-full" disabled={loading}>
        {loading ? "Setting up…" : "Become a recruiter"}
      </Button>
    </form>
  );
}
