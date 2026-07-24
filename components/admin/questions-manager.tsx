"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Check, Loader2, Pencil, Plus, Sparkles, Trash2, X, Archive } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { QuestionFormDialog } from "@/components/admin/question-form-dialog";
import { GenerateDraftDialog } from "@/components/admin/generate-draft-dialog";
import { deleteQuestionAction, setQuestionStatusAction } from "@/lib/actions/admin-actions";
import {
  DIFFICULTY_LEVEL_LABELS,
  QUESTION_TYPE_LABELS,
  type ContentStatus,
} from "@/types/domain/enums";
import type { Technology, Topic } from "@/types/domain/technology";
import type { QuestionBankEntry } from "@/types/domain/question-bank";

const STATUS_VARIANT: Record<ContentStatus, "default" | "secondary" | "destructive" | "outline"> = {
  draft: "secondary",
  approved: "default",
  rejected: "destructive",
  archived: "outline",
};

const STATUS_LABELS: Record<ContentStatus, string> = {
  draft: "Draft",
  approved: "Approved",
  rejected: "Rejected",
  archived: "Archived",
};

export function QuestionsManager({
  technologies,
  topics,
  questions,
}: {
  technologies: Technology[];
  topics: Topic[];
  questions: QuestionBankEntry[];
}) {
  const router = useRouter();
  const [technologyId, setTechnologyId] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [formOpen, setFormOpen] = useState(false);
  const [generateOpen, setGenerateOpen] = useState(false);
  const [editing, setEditing] = useState<QuestionBankEntry | null>(null);
  const [pendingId, setPendingId] = useState<string | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<QuestionBankEntry | null>(null);

  const technologyNames = useMemo(
    () => new Map(technologies.map((t) => [t.id, t.name])),
    [technologies]
  );
  const topicNames = useMemo(() => new Map(topics.map((t) => [t.id, t.name])), [topics]);

  const filtered = useMemo(
    () =>
      questions.filter(
        (q) =>
          (technologyId === "all" || q.technology_id === technologyId) &&
          (statusFilter === "all" || q.status === statusFilter)
      ),
    [questions, technologyId, statusFilter]
  );

  function openCreate() {
    setEditing(null);
    setFormOpen(true);
  }

  function openEdit(question: QuestionBankEntry) {
    setEditing(question);
    setFormOpen(true);
  }

  async function changeStatus(question: QuestionBankEntry, status: ContentStatus) {
    setPendingId(question.id);
    const result = await setQuestionStatusAction(question.id, status);
    setPendingId(null);
    if (!result.success) {
      toast.error(result.error ?? "Could not update status.");
      return;
    }
    toast.success(`Question marked as ${STATUS_LABELS[status].toLowerCase()}.`);
    router.refresh();
  }

  async function confirmDelete() {
    if (!deleteTarget) return;
    setPendingId(deleteTarget.id);
    const result = await deleteQuestionAction(deleteTarget.id);
    setPendingId(null);
    setDeleteTarget(null);
    if (!result.success) {
      toast.error(result.error ?? "Could not delete question.");
      return;
    }
    toast.success("Question deleted.");
    router.refresh();
  }

  return (
    <>
      <Card className="p-lg">
        <div className="mb-lg flex flex-wrap items-center justify-between gap-md">
          <div className="flex flex-wrap items-center gap-md">
            <Select value={technologyId} onValueChange={(value) => setTechnologyId(value ?? "all")}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="All technologies">
                  {(value: string) =>
                    value === "all" ? "All technologies" : technologyNames.get(value) ?? "All technologies"
                  }
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All technologies</SelectItem>
                {technologies.map((tech) => (
                  <SelectItem key={tech.id} value={tech.id}>
                    {tech.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={statusFilter} onValueChange={(value) => setStatusFilter(value ?? "all")}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="All statuses">
                  {(value: string) =>
                    value === "all" ? "All statuses" : STATUS_LABELS[value as ContentStatus] ?? "All statuses"
                  }
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All statuses</SelectItem>
                <SelectItem value="draft">Draft</SelectItem>
                <SelectItem value="approved">Approved</SelectItem>
                <SelectItem value="rejected">Rejected</SelectItem>
                <SelectItem value="archived">Archived</SelectItem>
              </SelectContent>
            </Select>

            <p className="text-body-sm text-muted-foreground">
              {filtered.length} question{filtered.length === 1 ? "" : "s"}
            </p>
          </div>

          <div className="flex gap-sm">
            <Button variant="outline" onClick={() => setGenerateOpen(true)}>
              <Sparkles className="h-4 w-4" />
              Generate with AI
            </Button>
            <Button onClick={openCreate}>
              <Plus className="h-4 w-4" />
              New question
            </Button>
          </div>
        </div>

        {filtered.length === 0 ? (
          <p className="py-xl text-center text-body-sm text-muted-foreground">
            No questions match these filters yet.
          </p>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Question</TableHead>
                <TableHead>Technology / Topic</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Difficulty</TableHead>
                <TableHead>Source</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((question) => (
                <TableRow key={question.id}>
                  <TableCell className="max-w-[280px]">
                    <p className="line-clamp-2 font-medium text-foreground">
                      {question.title || question.body}
                    </p>
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {technologyNames.get(question.technology_id) ?? "—"}
                    {question.topic_id ? ` / ${topicNames.get(question.topic_id) ?? "—"}` : ""}
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {QUESTION_TYPE_LABELS[question.question_type]}
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {DIFFICULTY_LEVEL_LABELS[question.difficulty]}
                  </TableCell>
                  <TableCell>
                    <Badge variant={question.generated_by === "ai" ? "secondary" : "outline"}>
                      {question.generated_by}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant={STATUS_VARIANT[question.status]}>{STATUS_LABELS[question.status]}</Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    {pendingId === question.id ? (
                      <Loader2 className="ml-auto h-4 w-4 animate-spin text-muted-foreground" />
                    ) : (
                      <div className="flex justify-end gap-xs">
                        {question.status !== "approved" && (
                          <Button
                            variant="ghost"
                            size="icon-sm"
                            className="text-success hover:text-success"
                            title="Approve"
                            onClick={() => changeStatus(question, "approved")}
                          >
                            <Check className="h-4 w-4" />
                          </Button>
                        )}
                        {question.status !== "rejected" && (
                          <Button
                            variant="ghost"
                            size="icon-sm"
                            className="text-destructive hover:text-destructive"
                            title="Reject"
                            onClick={() => changeStatus(question, "rejected")}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        )}
                        {question.status !== "archived" && (
                          <Button
                            variant="ghost"
                            size="icon-sm"
                            title="Archive"
                            onClick={() => changeStatus(question, "archived")}
                          >
                            <Archive className="h-4 w-4" />
                          </Button>
                        )}
                        <Button variant="ghost" size="icon-sm" onClick={() => openEdit(question)}>
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon-sm"
                          className="text-destructive hover:text-destructive"
                          onClick={() => setDeleteTarget(question)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </Card>

      <QuestionFormDialog
        open={formOpen}
        onOpenChange={setFormOpen}
        question={editing}
        technologies={technologies}
        topics={topics}
        defaultTechnologyId={technologyId === "all" ? null : technologyId}
      />

      <GenerateDraftDialog
        open={generateOpen}
        onOpenChange={setGenerateOpen}
        technologies={technologies}
        topics={topics}
        defaultTechnologyId={technologyId === "all" ? null : technologyId}
      />

      <AlertDialog open={!!deleteTarget} onOpenChange={(open) => !open && setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete this question?</AlertDialogTitle>
            <AlertDialogDescription>
              This removes it from the bank permanently. Questions already asked in past sessions
              are unaffected.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={confirmDelete}
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
