"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Pencil, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Card } from "@/components/ui/card";
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
import { TechnologyFormDialog } from "@/components/admin/technology-form-dialog";
import {
  deleteTechnologyAction,
  updateTechnologyAction,
} from "@/lib/actions/admin-actions";
import type { Technology } from "@/types/domain/technology";

export function TechnologiesManager({ technologies }: { technologies: Technology[] }) {
  const router = useRouter();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Technology | null>(null);
  const [pendingId, setPendingId] = useState<string | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Technology | null>(null);

  const nextSortOrder =
    technologies.length > 0 ? Math.max(...technologies.map((t) => t.sort_order)) + 10 : 0;

  function openCreate() {
    setEditing(null);
    setDialogOpen(true);
  }

  function openEdit(tech: Technology) {
    setEditing(tech);
    setDialogOpen(true);
  }

  async function toggleActive(tech: Technology) {
    setPendingId(tech.id);
    const result = await updateTechnologyAction(tech.id, { isActive: !tech.is_active });
    setPendingId(null);
    if (!result.success) {
      toast.error(result.error ?? "Could not update technology.");
      return;
    }
    router.refresh();
  }

  async function confirmDelete() {
    if (!deleteTarget) return;
    setPendingId(deleteTarget.id);
    const result = await deleteTechnologyAction(deleteTarget.id);
    setPendingId(null);
    setDeleteTarget(null);
    if (!result.success) {
      toast.error(result.error ?? "Could not delete technology.");
      return;
    }
    toast.success("Technology deleted.");
    router.refresh();
  }

  return (
    <>
      <Card className="p-lg">
        <div className="mb-lg flex items-center justify-between">
          <div>
            <h3 className="font-headline-md text-headline-md text-foreground">Technologies</h3>
            <p className="text-body-sm text-muted-foreground">
              {technologies.length} technolog{technologies.length === 1 ? "y" : "ies"} configured
            </p>
          </div>
          <Button onClick={openCreate}>
            <Plus className="h-4 w-4" />
            New technology
          </Button>
        </div>

        {technologies.length === 0 ? (
          <p className="py-xl text-center text-body-sm text-muted-foreground">
            No technologies yet. Create the first one to unlock it in the interview wizard.
          </p>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Slug</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Sort</TableHead>
                <TableHead>Active</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {technologies.map((tech) => (
                <TableRow key={tech.id}>
                  <TableCell className="font-medium text-foreground">{tech.name}</TableCell>
                  <TableCell className="text-muted-foreground">{tech.slug}</TableCell>
                  <TableCell>
                    <Badge variant="outline">{tech.category}</Badge>
                  </TableCell>
                  <TableCell className="text-muted-foreground">{tech.sort_order}</TableCell>
                  <TableCell>
                    {pendingId === tech.id ? (
                      <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                    ) : (
                      <Switch checked={tech.is_active} onCheckedChange={() => toggleActive(tech)} />
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-xs">
                      <Button variant="ghost" size="icon-sm" onClick={() => openEdit(tech)}>
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon-sm"
                        className="text-destructive hover:text-destructive"
                        onClick={() => setDeleteTarget(tech)}
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

      <TechnologyFormDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        technology={editing}
        nextSortOrder={nextSortOrder}
      />

      <AlertDialog open={!!deleteTarget} onOpenChange={(open) => !open && setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete {deleteTarget?.name}?</AlertDialogTitle>
            <AlertDialogDescription>
              This hides the technology from the wizard and admin lists. Existing sessions and
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
