"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Pencil, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
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
import { TopicFormDialog } from "@/components/admin/topic-form-dialog";
import { deleteTopicAction, updateTopicAction } from "@/lib/actions/admin-actions";
import type { Technology, Topic } from "@/types/domain/technology";

export function TopicsManager({
  technologies,
  topics,
}: {
  technologies: Technology[];
  topics: Topic[];
}) {
  const router = useRouter();
  const [technologyId, setTechnologyId] = useState<string>(technologies[0]?.id ?? "");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Topic | null>(null);
  const [pendingId, setPendingId] = useState<string | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Topic | null>(null);

  const filteredTopics = useMemo(
    () => topics.filter((t) => t.technology_id === technologyId),
    [topics, technologyId]
  );

  const nextSortOrder =
    filteredTopics.length > 0 ? Math.max(...filteredTopics.map((t) => t.sort_order)) + 10 : 0;

  function openCreate() {
    setEditing(null);
    setDialogOpen(true);
  }

  function openEdit(topic: Topic) {
    setEditing(topic);
    setDialogOpen(true);
  }

  async function toggleActive(topic: Topic) {
    setPendingId(topic.id);
    const result = await updateTopicAction(topic.id, { isActive: !topic.is_active });
    setPendingId(null);
    if (!result.success) {
      toast.error(result.error ?? "Could not update topic.");
      return;
    }
    router.refresh();
  }

  async function confirmDelete() {
    if (!deleteTarget) return;
    setPendingId(deleteTarget.id);
    const result = await deleteTopicAction(deleteTarget.id);
    setPendingId(null);
    setDeleteTarget(null);
    if (!result.success) {
      toast.error(result.error ?? "Could not delete topic.");
      return;
    }
    toast.success("Topic deleted.");
    router.refresh();
  }

  if (technologies.length === 0) {
    return (
      <Card className="p-lg text-center text-body-sm text-muted-foreground">
        Create a technology first before adding topics.
      </Card>
    );
  }

  return (
    <>
      <Card className="p-lg">
        <div className="mb-lg flex flex-wrap items-center justify-between gap-md">
          <div className="flex items-center gap-md">
            <Select value={technologyId} onValueChange={(value) => setTechnologyId(value ?? "")}>
              <SelectTrigger className="w-56">
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
            <p className="text-body-sm text-muted-foreground">
              {filteredTopics.length} topic{filteredTopics.length === 1 ? "" : "s"}
            </p>
          </div>
          <Button onClick={openCreate}>
            <Plus className="h-4 w-4" />
            New topic
          </Button>
        </div>

        {filteredTopics.length === 0 ? (
          <p className="py-xl text-center text-body-sm text-muted-foreground">
            No topics yet for this technology. Add one to unlock topic-level filtering in the wizard.
          </p>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Slug</TableHead>
                <TableHead>Sort</TableHead>
                <TableHead>Active</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredTopics.map((topic) => (
                <TableRow key={topic.id}>
                  <TableCell className="font-medium text-foreground">{topic.name}</TableCell>
                  <TableCell className="text-muted-foreground">{topic.slug}</TableCell>
                  <TableCell className="text-muted-foreground">{topic.sort_order}</TableCell>
                  <TableCell>
                    {pendingId === topic.id ? (
                      <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                    ) : (
                      <Switch checked={topic.is_active} onCheckedChange={() => toggleActive(topic)} />
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-xs">
                      <Button variant="ghost" size="icon-sm" onClick={() => openEdit(topic)}>
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon-sm"
                        className="text-destructive hover:text-destructive"
                        onClick={() => setDeleteTarget(topic)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </Card>

      <TopicFormDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        topic={editing}
        technologies={technologies}
        defaultTechnologyId={technologyId}
        nextSortOrder={nextSortOrder}
      />

      <AlertDialog open={!!deleteTarget} onOpenChange={(open) => !open && setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete {deleteTarget?.name}?</AlertDialogTitle>
            <AlertDialogDescription>
              This hides the topic from the wizard and admin lists. Existing sessions and
              questions that reference it are preserved.
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
