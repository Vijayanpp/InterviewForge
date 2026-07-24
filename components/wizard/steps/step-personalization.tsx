"use client";

import { useRef, useState } from "react";
import { Loader2, Upload, FileText, X } from "lucide-react";
import { toast } from "sonner";

import { useWizardStore } from "@/lib/store/wizard-store";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

export function StepPersonalization() {
  const interviewType = useWizardStore((s) => s.interviewType);
  const targetCompany = useWizardStore((s) => s.targetCompany);
  const customInstructions = useWizardStore((s) => s.customInstructions);
  const resumeId = useWizardStore((s) => s.resumeId);
  const resumeFileName = useWizardStore((s) => s.resumeFileName);
  const resumeText = useWizardStore((s) => s.resumeText);
  const jobDescriptionTitle = useWizardStore((s) => s.jobDescriptionTitle);
  const jobDescriptionContent = useWizardStore((s) => s.jobDescriptionContent);
  const setField = useWizardStore((s) => s.setField);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);

  const needsResume = interviewType === "resume_based";
  const needsJd = interviewType === "job_description_based";

  async function handleResumeFile(file: File | null) {
    if (!file) return;
    const isPlain = file.type === "text/plain" || file.name.toLowerCase().endsWith(".txt");
    if (!isPlain && resumeText.trim().length < 40) {
      toast.error("Paste your resume text below first, then upload the PDF/DOC file.");
      if (fileInputRef.current) fileInputRef.current.value = "";
      return;
    }
    setIsUploading(true);
    try {
      const form = new FormData();
      form.append("file", file);
      if (resumeText.trim()) {
        form.append("parsedText", resumeText.trim());
      } else if (file.type === "text/plain") {
        form.append("parsedText", await file.text());
      }

      const res = await fetch("/api/resumes", { method: "POST", body: form });
      const body = await res.json().catch(() => null);
      if (!res.ok) {
        throw new Error(body?.error?.message ?? "Could not upload resume.");
      }

      const resume = body.resume as { id: string; file_name: string; parsed_text: string | null };
      setField("resumeId", resume.id);
      setField("resumeFileName", resume.file_name);
      if (resume.parsed_text) setField("resumeText", resume.parsed_text);
      toast.success("Resume uploaded");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Upload failed");
      setField("resumeId", null);
      setField("resumeFileName", null);
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  }

  async function uploadFromPastedText() {
    if (resumeText.trim().length < 40) {
      toast.error("Paste at least ~40 characters of resume text.");
      return;
    }
    setIsUploading(true);
    try {
      const blob = new Blob([resumeText.trim()], { type: "text/plain" });
      const file = new File([blob], "resume.txt", { type: "text/plain" });
      const form = new FormData();
      form.append("file", file);
      form.append("parsedText", resumeText.trim());

      const res = await fetch("/api/resumes", { method: "POST", body: form });
      const body = await res.json().catch(() => null);
      if (!res.ok) {
        throw new Error(body?.error?.message ?? "Could not save resume text.");
      }
      const resume = body.resume as { id: string; file_name: string };
      setField("resumeId", resume.id);
      setField("resumeFileName", resume.file_name);
      toast.success("Resume text saved");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not save resume");
    } finally {
      setIsUploading(false);
    }
  }

  function clearResume() {
    setField("resumeId", null);
    setField("resumeFileName", null);
  }

  return (
    <div className="mx-auto max-w-xl space-y-lg">
      <p className="text-center text-body-sm text-muted-foreground">
        {needsResume
          ? "Upload your resume (or paste its text) so the AI can ask about your real experience."
          : needsJd
            ? "Paste the job description so the AI can target questions at that role."
            : "Optional — help the AI tailor the interview further. Skip if you don’t need it."}
      </p>

      {needsResume && (
        <div className="space-y-md rounded-xl border border-border bg-card p-md">
          <div className="space-y-sm">
            <Label>Resume file</Label>
            <input
              ref={fileInputRef}
              type="file"
              accept=".pdf,.doc,.docx,.txt,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document,text/plain"
              className="hidden"
              onChange={(e) => void handleResumeFile(e.target.files?.[0] ?? null)}
            />
            {resumeId && resumeFileName ? (
              <div className="flex items-center justify-between gap-md rounded-lg border border-border bg-muted/40 px-md py-sm">
                <div className="flex min-w-0 items-center gap-sm">
                  <FileText className="size-4 shrink-0 text-primary" />
                  <span className="truncate text-body-sm">{resumeFileName}</span>
                </div>
                <Button type="button" variant="ghost" size="sm" onClick={clearResume}>
                  <X className="size-4" />
                </Button>
              </div>
            ) : (
              <Button
                type="button"
                variant="outline"
                className="w-full"
                disabled={isUploading}
                onClick={() => fileInputRef.current?.click()}
              >
                {isUploading ? (
                  <Loader2 className="size-4 animate-spin" />
                ) : (
                  <Upload className="size-4" />
                )}
                Upload PDF, DOC, DOCX, or TXT
              </Button>
            )}
            <p className="text-body-sm text-muted-foreground">
              For PDF/DOCX, also paste the resume text below so the AI can read it.
            </p>
          </div>

          <div className="space-y-sm">
            <Label htmlFor="resumeText">Resume text (for the AI)</Label>
            <Textarea
              id="resumeText"
              rows={8}
              placeholder="Paste your resume content here…"
              value={resumeText}
              onChange={(e) => {
                setField("resumeText", e.target.value);
                if (resumeId) clearResume();
              }}
            />
            {!resumeId && (
              <Button
                type="button"
                variant="secondary"
                disabled={isUploading || resumeText.trim().length < 40}
                onClick={() => void uploadFromPastedText()}
              >
                {isUploading ? <Loader2 className="size-4 animate-spin" /> : null}
                Save resume text
              </Button>
            )}
          </div>
        </div>
      )}

      {needsJd && (
        <div className="space-y-md rounded-xl border border-border bg-card p-md">
          <div className="space-y-sm">
            <Label htmlFor="jdTitle">Role title (optional)</Label>
            <Input
              id="jdTitle"
              placeholder="e.g. Senior Frontend Engineer"
              value={jobDescriptionTitle}
              onChange={(e) => {
                setField("jobDescriptionTitle", e.target.value);
                setField("jobDescriptionId", null);
              }}
            />
          </div>
          <div className="space-y-sm">
            <Label htmlFor="jdContent">Job description</Label>
            <Textarea
              id="jdContent"
              rows={10}
              placeholder="Paste the full job posting here…"
              value={jobDescriptionContent}
              onChange={(e) => {
                setField("jobDescriptionContent", e.target.value);
                setField("jobDescriptionId", null);
              }}
            />
            <p className="text-body-sm text-muted-foreground">
              Required — the AI uses this to match questions to the role.
            </p>
          </div>
        </div>
      )}

      <div className="space-y-sm">
        <Label htmlFor="targetCompany">Target company</Label>
        <Input
          id="targetCompany"
          placeholder="e.g. Acme Corp"
          value={targetCompany}
          onChange={(e) => setField("targetCompany", e.target.value)}
        />
      </div>
      <div className="space-y-sm">
        <Label htmlFor="customInstructions">Anything specific you want the AI to focus on?</Label>
        <Textarea
          id="customInstructions"
          rows={4}
          placeholder="e.g. Focus more on production debugging scenarios and less on syntax trivia."
          value={customInstructions}
          onChange={(e) => setField("customInstructions", e.target.value)}
        />
      </div>
    </div>
  );
}
