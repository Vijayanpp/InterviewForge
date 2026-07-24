"use client";

import { useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import type { z } from "zod";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Separator } from "@/components/ui/separator";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import {
  createQuestionBankEntrySchema,
  type CreateQuestionBankEntryInput,
  type QuestionBankEntry,
} from "@/types/domain/question-bank";
import {
  DIFFICULTY_LEVEL_LABELS,
  DIFFICULTY_LEVELS,
  EXPERIENCE_LEVEL_LABELS,
  EXPERIENCE_LEVELS,
  QUESTION_TYPE_LABELS,
  QUESTION_TYPES,
  CONTENT_STATUSES,
} from "@/types/domain/enums";
import { createQuestionAction, updateQuestionAction } from "@/lib/actions/admin-actions";
import type { Technology, Topic } from "@/types/domain/technology";

const STATUS_LABELS: Record<string, string> = {
  draft: "Draft",
  approved: "Approved",
  rejected: "Rejected",
  archived: "Archived",
};

const DEFAULT_RUBRIC = {
  technicalAccuracyWeight: 0.4,
  depthWeight: 0.25,
  clarityWeight: 0.15,
  completenessWeight: 0.2,
};

function toConceptsText(concepts: unknown): string {
  if (!Array.isArray(concepts)) return "";
  return concepts.join(", ");
}

function parseConcepts(text: string): string[] {
  return text
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
}

export function QuestionFormDialog({
  open,
  onOpenChange,
  question,
  technologies,
  topics,
  defaultTechnologyId,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  question: QuestionBankEntry | null;
  technologies: Technology[];
  topics: Topic[];
  defaultTechnologyId: string | null;
}) {
  const isEditing = !!question;
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [conceptsText, setConceptsText] = useState("");

  const form = useForm<
    z.input<typeof createQuestionBankEntrySchema>,
    unknown,
    CreateQuestionBankEntryInput
  >({
    resolver: zodResolver(createQuestionBankEntrySchema),
    defaultValues: {
      technologyId: defaultTechnologyId ?? technologies[0]?.id ?? "",
      topicId: null,
      experienceLevels: ["mid"],
      difficulty: "medium",
      questionType: "conceptual",
      title: "",
      body: "",
      expectedConcepts: [],
      rubric: DEFAULT_RUBRIC,
      maxScore: 10,
      referenceAnswer: "",
      status: "draft",
    },
  });

  const selectedTechnologyId = form.watch("technologyId");
  const availableTopics = useMemo(
    () => topics.filter((t) => t.technology_id === selectedTechnologyId),
    [topics, selectedTechnologyId]
  );

  useEffect(() => {
    if (!open) return;
    if (question) {
      form.reset({
        technologyId: question.technology_id,
        topicId: question.topic_id,
        experienceLevels: (question.experience_levels as CreateQuestionBankEntryInput["experienceLevels"]) ?? ["mid"],
        difficulty: question.difficulty,
        questionType: question.question_type,
        title: question.title ?? "",
        body: question.body,
        expectedConcepts: (question.expected_concepts as string[]) ?? [],
        rubric: (question.rubric as typeof DEFAULT_RUBRIC) ?? DEFAULT_RUBRIC,
        maxScore: Number(question.max_score),
        referenceAnswer: question.reference_answer ?? "",
        status: question.status,
      });
      setConceptsText(toConceptsText(question.expected_concepts));
    } else {
      form.reset({
        technologyId: defaultTechnologyId ?? technologies[0]?.id ?? "",
        topicId: null,
        experienceLevels: ["mid"],
        difficulty: "medium",
        questionType: "conceptual",
        title: "",
        body: "",
        expectedConcepts: [],
        rubric: DEFAULT_RUBRIC,
        maxScore: 10,
        referenceAnswer: "",
        status: "draft",
      });
      setConceptsText("");
    }
  }, [open, question, defaultTechnologyId, technologies, form]);

  async function onSubmit(values: CreateQuestionBankEntryInput) {
    const payload = { ...values, expectedConcepts: parseConcepts(conceptsText) };
    setIsSubmitting(true);
    const result = isEditing
      ? await updateQuestionAction(question!.id, payload)
      : await createQuestionAction(payload);
    setIsSubmitting(false);

    if (!result.success) {
      toast.error(result.error ?? "Something went wrong.");
      return;
    }

    toast.success(isEditing ? "Question updated." : "Question created.");
    onOpenChange(false);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>{isEditing ? "Edit question" : "New question"}</DialogTitle>
          <DialogDescription>
            Only questions with status &quot;Approved&quot; can ever be served to a candidate.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form className="space-y-md" onSubmit={form.handleSubmit(onSubmit)}>
            <div className="grid grid-cols-2 gap-md">
              <FormField
                control={form.control}
                name="technologyId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Technology</FormLabel>
                    <Select
                      value={field.value}
                      onValueChange={(value) => {
                        field.onChange(value);
                        form.setValue("topicId", null);
                      }}
                    >
                      <FormControl>
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Select a technology">
                            {(value: string) =>
                              technologies.find((t) => t.id === value)?.name ?? "Select a technology"
                            }
                          </SelectValue>
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {technologies.map((tech) => (
                          <SelectItem key={tech.id} value={tech.id}>
                            {tech.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="topicId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Topic (optional)</FormLabel>
                    <Select
                      value={field.value ?? "none"}
                      onValueChange={(value) => field.onChange(value === "none" ? null : value)}
                    >
                      <FormControl>
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="No specific topic">
                            {(value: string) =>
                              value === "none"
                                ? "No specific topic"
                                : availableTopics.find((t) => t.id === value)?.name ?? "No specific topic"
                            }
                          </SelectValue>
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="none">No specific topic</SelectItem>
                        {availableTopics.map((topic) => (
                          <SelectItem key={topic.id} value={topic.id}>
                            {topic.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="experienceLevels"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Experience levels</FormLabel>
                  <div className="flex flex-wrap gap-md">
                    {EXPERIENCE_LEVELS.map((level) => {
                      const checked = field.value.includes(level);
                      return (
                        <label key={level} className="flex items-center gap-xs text-body-sm">
                          <Checkbox
                            checked={checked}
                            onCheckedChange={(value) => {
                              const isChecked = value === true;
                              field.onChange(
                                isChecked
                                  ? [...field.value, level]
                                  : field.value.filter((l) => l !== level)
                              );
                            }}
                          />
                          {EXPERIENCE_LEVEL_LABELS[level]}
                        </label>
                      );
                    })}
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-3 gap-md">
              <FormField
                control={form.control}
                name="difficulty"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Difficulty</FormLabel>
                    <Select value={field.value} onValueChange={field.onChange}>
                      <FormControl>
                        <SelectTrigger className="w-full">
                          <SelectValue>
                            {(value: (typeof DIFFICULTY_LEVELS)[number]) => DIFFICULTY_LEVEL_LABELS[value]}
                          </SelectValue>
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {DIFFICULTY_LEVELS.map((level) => (
                          <SelectItem key={level} value={level}>
                            {DIFFICULTY_LEVEL_LABELS[level]}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="questionType"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Question type</FormLabel>
                    <Select value={field.value} onValueChange={field.onChange}>
                      <FormControl>
                        <SelectTrigger className="w-full">
                          <SelectValue>
                            {(value: (typeof QUESTION_TYPES)[number]) => QUESTION_TYPE_LABELS[value]}
                          </SelectValue>
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {QUESTION_TYPES.map((type) => (
                          <SelectItem key={type} value={type}>
                            {QUESTION_TYPE_LABELS[type]}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="status"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Status</FormLabel>
                    <Select value={field.value} onValueChange={field.onChange}>
                      <FormControl>
                        <SelectTrigger className="w-full">
                          <SelectValue>
                            {(value: (typeof CONTENT_STATUSES)[number]) => STATUS_LABELS[value]}
                          </SelectValue>
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {CONTENT_STATUSES.map((status) => (
                          <SelectItem key={status} value={status}>
                            {STATUS_LABELS[status]}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Title (optional)</FormLabel>
                  <FormControl>
                    <Input placeholder="Explain event delegation" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="body"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Question body</FormLabel>
                  <FormControl>
                    <Textarea className="min-h-24" placeholder="Full question text shown to the candidate" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormItem>
              <FormLabel>Expected concepts (comma-separated)</FormLabel>
              <FormControl>
                <Input
                  placeholder="closures, event bubbling, delegation"
                  value={conceptsText}
                  onChange={(e) => setConceptsText(e.target.value)}
                />
              </FormControl>
            </FormItem>

            <Separator />

            <div className="grid grid-cols-2 gap-md">
              <FormField
                control={form.control}
                name="maxScore"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Max score</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        step="0.5"
                        {...field}
                        onChange={(e) => field.onChange(Number(e.target.value))}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="rubric.notes"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Rubric notes (optional)</FormLabel>
                    <FormControl>
                      <Input placeholder="What a strong answer covers" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-4 gap-md">
              <FormField
                control={form.control}
                name="rubric.technicalAccuracyWeight"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Accuracy wt.</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        step="0.05"
                        min={0}
                        max={1}
                        {...field}
                        onChange={(e) => field.onChange(Number(e.target.value))}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="rubric.depthWeight"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Depth wt.</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        step="0.05"
                        min={0}
                        max={1}
                        {...field}
                        onChange={(e) => field.onChange(Number(e.target.value))}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="rubric.clarityWeight"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Clarity wt.</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        step="0.05"
                        min={0}
                        max={1}
                        {...field}
                        onChange={(e) => field.onChange(Number(e.target.value))}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="rubric.completenessWeight"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Completeness wt.</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        step="0.05"
                        min={0}
                        max={1}
                        {...field}
                        onChange={(e) => field.onChange(Number(e.target.value))}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="referenceAnswer"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Reference answer (never shown to candidates)</FormLabel>
                  <FormControl>
                    <Textarea
                      className="min-h-20"
                      placeholder="Used by the AI evaluator as ground truth"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting && <Loader2 className="h-4 w-4 animate-spin" />}
                {isEditing ? "Save changes" : "Create question"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
