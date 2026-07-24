"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Sparkles } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import {
  DIFFICULTY_LEVEL_LABELS,
  DIFFICULTY_LEVELS,
  EXPERIENCE_LEVEL_LABELS,
  EXPERIENCE_LEVELS,
} from "@/types/domain/enums";
import { generateQuestionDraftAction } from "@/lib/actions/admin-actions";
import type { Technology, Topic } from "@/types/domain/technology";
import type { DifficultyLevel, ExperienceLevel } from "@/types/domain/enums";

export function GenerateDraftDialog({
  open,
  onOpenChange,
  technologies,
  topics,
  defaultTechnologyId,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  technologies: Technology[];
  topics: Topic[];
  defaultTechnologyId: string | null;
}) {
  const router = useRouter();
  const [technologyId, setTechnologyId] = useState(defaultTechnologyId ?? technologies[0]?.id ?? "");
  const [topicId, setTopicId] = useState<string>("none");
  const [experienceLevel, setExperienceLevel] = useState<ExperienceLevel>("mid");
  const [difficulty, setDifficulty] = useState<DifficultyLevel>("medium");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const availableTopics = useMemo(
    () => topics.filter((t) => t.technology_id === technologyId),
    [topics, technologyId]
  );

  async function onGenerate() {
    if (!technologyId) return;
    setIsSubmitting(true);
    const result = await generateQuestionDraftAction({
      technologyId,
      topicId: topicId === "none" ? null : topicId,
      experienceLevel,
      difficulty,
    });
    setIsSubmitting(false);

    if (!result.success) {
      toast.error(result.error ?? "Could not generate a draft.");
      return;
    }

    toast.success("Draft question generated. Review and approve it below.");
    onOpenChange(false);
    router.refresh();
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Generate a question with AI</DialogTitle>
          <DialogDescription>
            The active AI provider drafts one question for the selected technology/topic. It is
            saved with status &quot;Draft&quot; and never served to candidates until you approve it.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-md">
          <div className="space-y-2">
            <Label>Technology</Label>
            <Select
              value={technologyId}
              onValueChange={(value) => {
                setTechnologyId(value ?? "");
                setTopicId("none");
              }}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select a technology">
                  {(value: string) => technologies.find((t) => t.id === value)?.name ?? "Select a technology"}
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                {technologies.map((tech) => (
                  <SelectItem key={tech.id} value={tech.id}>
                    {tech.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Topic (optional)</Label>
            <Select value={topicId} onValueChange={(value) => setTopicId(value ?? "none")}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="No specific topic">
                  {(value: string) =>
                    value === "none" ? "No specific topic" : availableTopics.find((t) => t.id === value)?.name ?? "No specific topic"
                  }
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">No specific topic</SelectItem>
                {availableTopics.map((topic) => (
                  <SelectItem key={topic.id} value={topic.id}>
                    {topic.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-md">
            <div className="space-y-2">
              <Label>Experience level</Label>
              <Select value={experienceLevel} onValueChange={(v) => setExperienceLevel(v as ExperienceLevel)}>
                <SelectTrigger className="w-full">
                  <SelectValue>
                    {(value: ExperienceLevel) => EXPERIENCE_LEVEL_LABELS[value]}
                  </SelectValue>
                </SelectTrigger>
                <SelectContent>
                  {EXPERIENCE_LEVELS.map((level) => (
                    <SelectItem key={level} value={level}>
                      {EXPERIENCE_LEVEL_LABELS[level]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Difficulty</Label>
              <Select value={difficulty} onValueChange={(v) => setDifficulty(v as DifficultyLevel)}>
                <SelectTrigger className="w-full">
                  <SelectValue>{(value: DifficultyLevel) => DIFFICULTY_LEVEL_LABELS[value]}</SelectValue>
                </SelectTrigger>
                <SelectContent>
                  {DIFFICULTY_LEVELS.map((level) => (
                    <SelectItem key={level} value={level}>
                      {DIFFICULTY_LEVEL_LABELS[level]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button onClick={onGenerate} disabled={isSubmitting || !technologyId}>
            {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
            Generate draft
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
