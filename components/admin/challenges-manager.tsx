"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Archive, Check, Loader2, Plus, Trash2, X } from "lucide-react";
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
import { deleteChallengeAction, setChallengeStatusAction } from "@/lib/actions/admin-actions";
import { DIFFICULTY_LEVEL_LABELS, type ContentStatus } from "@/types/domain/enums";
import type { Technology } from "@/types/domain/technology";
import type { CodingChallenge } from "@/types/domain/coding";

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

export function ChallengesManager({
  challenges,
  technologies,
}: {
  challenges: CodingChallenge[];
  technologies: Technology[];
}) {
  const router = useRouter();
  const [statusFilter, setStatusFilter] = useState("all");
  const [pendingId, setPendingId] = useState<string | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<CodingChallenge | null>(null);

  const technologyNames = useMemo(
    () => new Map(technologies.map((t) => [t.id, t.name])),
    [technologies]
  );

  const filtered = useMemo(
    () => challenges.filter((c) => statusFilter === "all" || c.status === statusFilter),
    [challenges, statusFilter]
  );

  async function changeStatus(challenge: CodingChallenge, status: ContentStatus) {
    setPendingId(challenge.id);
    const result = await setChallengeStatusAction(challenge.id, status);
    setPendingId(null);
    if (!result.success) {
      toast.error(result.error ?? "Could not update status.");
      return;
    }
    toast.success(`Marked as ${STATUS_LABELS[status]}.`);
    router.refresh();
  }

  async function confirmDelete() {
    if (!deleteTarget) return;
    setPendingId(deleteTarget.id);
    const result = await deleteChallengeAction(deleteTarget.id);
    setPendingId(null);
    setDeleteTarget(null);
    if (!result.success) {
      toast.error(result.error ?? "Could not delete challenge.");
      return;
    }
    toast.success("Challenge archived.");
    router.refresh();
  }

  return (
    <>
      <div className="flex flex-wrap items-center justify-between gap-md">
        <Select value={statusFilter} onValueChange={(value) => setStatusFilter(value ?? "all")}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All statuses</SelectItem>
            {(Object.keys(STATUS_LABELS) as ContentStatus[]).map((s) => (
              <SelectItem key={s} value={s}>
                {STATUS_LABELS[s]}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Button nativeButton={false} render={<Link href="/admin/challenges/new" />}>
          <Plus className="mr-2 h-4 w-4" />
          New challenge
        </Button>
      </div>

      <Card className="overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Title</TableHead>
              <TableHead>Slug</TableHead>
              <TableHead>Difficulty</TableHead>
              <TableHead>Tech</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="py-xl text-center text-muted-foreground">
                  No challenges yet. Create one to power practice and coding interviews.
                </TableCell>
              </TableRow>
            ) : (
              filtered.map((challenge) => (
                <TableRow key={challenge.id}>
                  <TableCell>
                    <Link
                      href={`/admin/challenges/${challenge.id}`}
                      className="font-medium text-primary hover:underline"
                    >
                      {challenge.title}
                    </Link>
                  </TableCell>
                  <TableCell className="font-mono text-xs text-muted-foreground">
                    {challenge.slug}
                  </TableCell>
                  <TableCell>
                    {DIFFICULTY_LEVEL_LABELS[challenge.difficulty] ?? challenge.difficulty}
                  </TableCell>
                  <TableCell>
                    {challenge.technology_id
                      ? (technologyNames.get(challenge.technology_id) ?? "—")
                      : "—"}
                  </TableCell>
                  <TableCell>
                    <Badge variant={STATUS_VARIANT[challenge.status]}>
                      {STATUS_LABELS[challenge.status]}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-1">
                      {pendingId === challenge.id ? (
                        <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                      ) : (
                        <>
                          {challenge.status !== "approved" && (
                            <Button
                              size="icon"
                              variant="ghost"
                              title="Approve"
                              onClick={() => changeStatus(challenge, "approved")}
                            >
                              <Check className="h-4 w-4 text-green-600" />
                            </Button>
                          )}
                          {challenge.status === "approved" && (
                            <Button
                              size="icon"
                              variant="ghost"
                              title="Reject"
                              onClick={() => changeStatus(challenge, "rejected")}
                            >
                              <X className="h-4 w-4 text-destructive" />
                            </Button>
                          )}
                          <Button
                            size="icon"
                            variant="ghost"
                            title="Archive"
                            onClick={() => changeStatus(challenge, "archived")}
                          >
                            <Archive className="h-4 w-4" />
                          </Button>
                          <Button
                            size="icon"
                            variant="ghost"
                            title="Delete"
                            onClick={() => setDeleteTarget(challenge)}
                          >
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        </>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </Card>

      <AlertDialog open={!!deleteTarget} onOpenChange={(o) => !o && setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Archive this challenge?</AlertDialogTitle>
            <AlertDialogDescription>
              “{deleteTarget?.title}” will be soft-deleted and hidden from practice. Existing
              submissions are kept.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete}>Archive</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
