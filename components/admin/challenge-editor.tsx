"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useForm, type Resolver } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import type { z } from "zod";
import { Loader2, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Card } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import {
  createCodingChallengeSchema,
  type CodingChallenge,
  type CodingTestCase,
  type CreateCodingChallengeInput,
} from "@/types/domain/coding";
import {
  CONTENT_STATUSES,
  DIFFICULTY_LEVEL_LABELS,
  DIFFICULTY_LEVELS,
} from "@/types/domain/enums";
import {
  CODING_LANGUAGES,
  CODING_LANGUAGE_LABELS,
  type CodingLanguage,
} from "@/lib/code-execution/languages";
import {
  createChallengeAction,
  createTestCaseAction,
  deleteTestCaseAction,
  updateChallengeAction,
  updateTestCaseAction,
} from "@/lib/actions/admin-actions";
import type { Technology, Topic } from "@/types/domain/technology";

const STATUS_LABELS: Record<string, string> = {
  draft: "Draft",
  approved: "Approved",
  rejected: "Rejected",
  archived: "Archived",
};

type FormValues = CreateCodingChallengeInput;
type FormInput = z.input<typeof createCodingChallengeSchema>;


function slugify(title: string): string {
  return title
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 80);
}

export function ChallengeEditor({
  challenge,
  testCases,
  technologies,
  topics,
}: {
  challenge: CodingChallenge | null;
  testCases: CodingTestCase[];
  technologies: Technology[];
  topics: Topic[];
}) {
  const router = useRouter();
  const isEdit = !!challenge;
  const [saving, setSaving] = useState(false);
  const [newCase, setNewCase] = useState({
    input: "",
    expectedOutput: "",
    isHidden: true,
    weight: 1,
  });
  const [caseBusy, setCaseBusy] = useState<string | null>(null);

  const form = useForm<FormInput, unknown, FormValues>({
    resolver: zodResolver(createCodingChallengeSchema) as Resolver<FormInput, unknown, FormValues>,
    defaultValues: {
      technologyId: challenge?.technology_id ?? null,
      topicId: challenge?.topic_id ?? null,
      title: challenge?.title ?? "",
      slug: challenge?.slug ?? "",
      problemStatement: challenge?.problem_statement ?? "",
      difficulty: challenge?.difficulty ?? "medium",
      examples: (challenge?.examples as FormValues["examples"]) ?? [],
      constraints: challenge?.constraints ?? "",
      starterCode: (challenge?.starter_code as Record<string, string>) ?? {
        javascript: "// SOLUTION\nfunction solve() {\n  // ...\n}\n",
      },
      supportedLanguages: (challenge?.supported_languages as CodingLanguage[]) ?? ["javascript"],
      expectedTimeComplexity: challenge?.expected_time_complexity ?? "",
      expectedSpaceComplexity: challenge?.expected_space_complexity ?? "",
      timeLimitMs: challenge?.time_limit_ms ?? 2000,
      memoryLimitMb: challenge?.memory_limit_mb ?? 256,
      status: challenge?.status ?? "draft",
    },
  });

  const techId = form.watch("technologyId");
  const filteredTopics = useMemo(
    () => topics.filter((t) => !techId || t.technology_id === techId),
    [topics, techId]
  );

  useEffect(() => {
    if (isEdit) return;
    const sub = form.watch((values, { name }) => {
      if (name === "title" && values.title && !form.getValues("slug")) {
        form.setValue("slug", slugify(values.title));
      }
    });
    return () => sub.unsubscribe();
  }, [form, isEdit]);

  async function onSubmit(values: FormValues) {
    setSaving(true);
    try {
      if (isEdit && challenge) {
        const result = await updateChallengeAction(challenge.id, values);
        if (!result.success) {
          toast.error(result.error ?? "Save failed.");
          return;
        }
        toast.success("Challenge updated.");
        router.refresh();
      } else {
        const result = await createChallengeAction(values);
        if (!result.success || !result.id) {
          toast.error(result.error ?? "Create failed.");
          return;
        }
        toast.success("Challenge created.");
        router.push(`/admin/challenges/${result.id}`);
      }
    } finally {
      setSaving(false);
    }
  }

  async function addTestCase() {
    if (!challenge) return;
    setCaseBusy("new");
    const result = await createTestCaseAction({
      challengeId: challenge.id,
      input: newCase.input,
      expectedOutput: newCase.expectedOutput,
      isHidden: newCase.isHidden,
      orderIndex: testCases.length,
      weight: newCase.weight,
    });
    setCaseBusy(null);
    if (!result.success) {
      toast.error(result.error ?? "Could not add test case.");
      return;
    }
    setNewCase({ input: "", expectedOutput: "", isHidden: true, weight: 1 });
    toast.success("Test case added.");
    router.refresh();
  }

  async function toggleHidden(tc: CodingTestCase) {
    if (!challenge) return;
    setCaseBusy(tc.id);
    const result = await updateTestCaseAction(tc.id, challenge.id, { isHidden: !tc.is_hidden });
    setCaseBusy(null);
    if (!result.success) {
      toast.error(result.error ?? "Update failed.");
      return;
    }
    router.refresh();
  }

  async function removeCase(tc: CodingTestCase) {
    if (!challenge) return;
    setCaseBusy(tc.id);
    const result = await deleteTestCaseAction(tc.id, challenge.id);
    setCaseBusy(null);
    if (!result.success) {
      toast.error(result.error ?? "Delete failed.");
      return;
    }
    toast.success("Test case removed.");
    router.refresh();
  }

  const languages = form.watch("supportedLanguages") ?? [];

  return (
    <div className="space-y-lg">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-lg">
          <Card className="space-y-md p-lg">
            <div className="grid gap-md md:grid-cols-2">
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Title</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="Two Sum" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="slug"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Slug</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="two-sum" className="font-mono text-sm" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid gap-md md:grid-cols-3">
              <FormField
                control={form.control}
                name="difficulty"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Difficulty</FormLabel>
                    <Select value={field.value} onValueChange={field.onChange}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {DIFFICULTY_LEVELS.filter((d) => d !== "adaptive").map((d) => (
                          <SelectItem key={d} value={d}>
                            {DIFFICULTY_LEVEL_LABELS[d]}
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
                name="status"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Status</FormLabel>
                    <Select value={field.value} onValueChange={field.onChange}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {CONTENT_STATUSES.map((s) => (
                          <SelectItem key={s} value={s}>
                            {STATUS_LABELS[s]}
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
                name="technologyId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Technology</FormLabel>
                    <Select
                      value={field.value ?? "none"}
                      onValueChange={(v) => field.onChange(v === "none" ? null : v)}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Optional" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="none">None</SelectItem>
                        {technologies.map((t) => (
                          <SelectItem key={t.id} value={t.id}>
                            {t.name}
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
              name="topicId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Topic</FormLabel>
                  <Select
                    value={field.value ?? "none"}
                    onValueChange={(v) => field.onChange(v === "none" ? null : v)}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Optional" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="none">None</SelectItem>
                      {filteredTopics.map((t) => (
                        <SelectItem key={t.id} value={t.id}>
                          {t.name}
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
              name="problemStatement"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Problem statement (Markdown)</FormLabel>
                  <FormControl>
                    <Textarea {...field} rows={10} className="font-mono text-sm" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="constraints"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Constraints</FormLabel>
                  <FormControl>
                    <Textarea {...field} rows={3} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div>
              <FormLabel className="mb-sm block">Supported languages</FormLabel>
              <div className="flex flex-wrap gap-md">
                {CODING_LANGUAGES.map((lang) => {
                  const checked = languages.includes(lang);
                  return (
                    <label key={lang} className="flex items-center gap-2 text-sm">
                      <Checkbox
                        checked={checked}
                        onCheckedChange={(c) => {
                          const next = c
                            ? [...languages, lang]
                            : languages.filter((l) => l !== lang);
                          form.setValue("supportedLanguages", next.length ? next : ["javascript"]);
                        }}
                      />
                      {CODING_LANGUAGE_LABELS[lang]}
                    </label>
                  );
                })}
              </div>
            </div>

            <div className="grid gap-md md:grid-cols-2">
              <FormField
                control={form.control}
                name="timeLimitMs"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Time limit (ms)</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
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
                name="memoryLimitMb"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Memory limit (MB)</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        {...field}
                        onChange={(e) => field.onChange(Number(e.target.value))}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <Separator />

            <div className="space-y-md">
              <h3 className="font-headline-md text-headline-md">Starter code</h3>
              {languages.map((lang) => (
                <FormField
                  key={lang}
                  control={form.control}
                  name={`starterCode.${lang}` as const}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{CODING_LANGUAGE_LABELS[lang as CodingLanguage] ?? lang}</FormLabel>
                      <FormControl>
                        <Textarea
                          {...field}
                          value={field.value ?? ""}
                          rows={6}
                          className="font-mono text-xs"
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
              ))}
            </div>

            <div className="flex justify-end gap-sm">
              <Button type="button" variant="outline" onClick={() => router.push("/admin/challenges")}>
                Cancel
              </Button>
              <Button type="submit" disabled={saving}>
                {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {isEdit ? "Save changes" : "Create challenge"}
              </Button>
            </div>
          </Card>
        </form>
      </Form>

      {isEdit && challenge && (
        <Card className="space-y-md p-lg">
          <div>
            <h2 className="font-headline-md text-headline-md">Test cases</h2>
            <p className="text-body-sm text-muted-foreground">
              Hidden cases are never sent to candidates. Run uses visible cases only; submit grades
              all cases.
            </p>
          </div>

          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>#</TableHead>
                <TableHead>Input</TableHead>
                <TableHead>Expected</TableHead>
                <TableHead>Hidden</TableHead>
                <TableHead>Weight</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {testCases.map((tc, i) => (
                <TableRow key={tc.id}>
                  <TableCell>{i + 1}</TableCell>
                  <TableCell className="max-w-[200px] truncate font-mono text-xs">
                    {tc.input}
                  </TableCell>
                  <TableCell className="max-w-[200px] truncate font-mono text-xs">
                    {tc.expected_output}
                  </TableCell>
                  <TableCell>
                    <Checkbox
                      checked={tc.is_hidden}
                      disabled={caseBusy === tc.id}
                      onCheckedChange={() => toggleHidden(tc)}
                    />
                  </TableCell>
                  <TableCell>{tc.weight}</TableCell>
                  <TableCell className="text-right">
                    <Button
                      size="icon"
                      variant="ghost"
                      disabled={caseBusy === tc.id}
                      onClick={() => removeCase(tc)}
                    >
                      {caseBusy === tc.id ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Trash2 className="h-4 w-4 text-destructive" />
                      )}
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          <div className="grid gap-md rounded-lg border border-border p-md md:grid-cols-2">
            <div>
              <label className="mb-1 block text-sm font-medium">Input</label>
              <Textarea
                value={newCase.input}
                onChange={(e) => setNewCase((s) => ({ ...s, input: e.target.value }))}
                rows={3}
                className="font-mono text-xs"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium">Expected output</label>
              <Textarea
                value={newCase.expectedOutput}
                onChange={(e) => setNewCase((s) => ({ ...s, expectedOutput: e.target.value }))}
                rows={3}
                className="font-mono text-xs"
              />
            </div>
            <label className="flex items-center gap-2 text-sm">
              <Checkbox
                checked={newCase.isHidden}
                onCheckedChange={(c) => setNewCase((s) => ({ ...s, isHidden: !!c }))}
              />
              Hidden from candidates
            </label>
            <div>
              <label className="mb-1 block text-sm font-medium">Weight</label>
              <Input
                type="number"
                min={0.1}
                step={0.1}
                value={newCase.weight}
                onChange={(e) => setNewCase((s) => ({ ...s, weight: Number(e.target.value) }))}
              />
            </div>
            <div className="md:col-span-2">
              <Button
                type="button"
                onClick={addTestCase}
                disabled={caseBusy === "new" || !newCase.input}
              >
                {caseBusy === "new" ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Plus className="mr-2 h-4 w-4" />
                )}
                Add test case
              </Button>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
}
