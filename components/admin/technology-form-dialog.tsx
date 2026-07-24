"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import type { z } from "zod";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
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
  createTechnologySchema,
  type CreateTechnologyInput,
  type Technology,
} from "@/types/domain/technology";
import { createTechnologyAction, updateTechnologyAction } from "@/lib/actions/admin-actions";

function slugify(value: string): string {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function TechnologyFormDialog({
  open,
  onOpenChange,
  technology,
  nextSortOrder,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  technology: Technology | null;
  nextSortOrder: number;
}) {
  const isEditing = !!technology;
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<z.input<typeof createTechnologySchema>, unknown, CreateTechnologyInput>({
    resolver: zodResolver(createTechnologySchema),
    defaultValues: {
      slug: "",
      name: "",
      category: "language",
      icon: "",
      description: "",
      isActive: true,
      sortOrder: nextSortOrder,
    },
  });

  useEffect(() => {
    if (!open) return;
    form.reset(
      technology
        ? {
            slug: technology.slug,
            name: technology.name,
            category: technology.category,
            icon: technology.icon ?? "",
            description: technology.description ?? "",
            isActive: technology.is_active,
            sortOrder: technology.sort_order,
          }
        : {
            slug: "",
            name: "",
            category: "language",
            icon: "",
            description: "",
            isActive: true,
            sortOrder: nextSortOrder,
          }
    );
  }, [open, technology, nextSortOrder, form]);

  async function onSubmit(values: CreateTechnologyInput) {
    setIsSubmitting(true);
    const result = isEditing
      ? await updateTechnologyAction(technology!.id, values)
      : await createTechnologyAction(values);
    setIsSubmitting(false);

    if (!result.success) {
      toast.error(result.error ?? "Something went wrong.");
      return;
    }

    toast.success(isEditing ? "Technology updated." : "Technology created.");
    onOpenChange(false);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{isEditing ? "Edit technology" : "New technology"}</DialogTitle>
          <DialogDescription>
            Technologies power the wizard&apos;s selection screen and group topics/questions.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form className="space-y-md" onSubmit={form.handleSubmit(onSubmit)}>
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Name</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Rust"
                      {...field}
                      onChange={(e) => {
                        field.onChange(e);
                        if (!isEditing) form.setValue("slug", slugify(e.target.value));
                      }}
                    />
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
                    <Input placeholder="rust" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-md">
              <FormField
                control={form.control}
                name="category"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Category</FormLabel>
                    <FormControl>
                      <Input placeholder="language" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="icon"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Icon (lucide name)</FormLabel>
                    <FormControl>
                      <Input placeholder="cpu" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea placeholder="Short description shown in the wizard" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-md">
              <FormField
                control={form.control}
                name="sortOrder"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Sort order</FormLabel>
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
                name="isActive"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Active</FormLabel>
                    <FormControl>
                      <div className="flex h-8 items-center">
                        <Switch checked={field.value} onCheckedChange={field.onChange} />
                      </div>
                    </FormControl>
                  </FormItem>
                )}
              />
            </div>

            <DialogFooter>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting && <Loader2 className="h-4 w-4 animate-spin" />}
                {isEditing ? "Save changes" : "Create technology"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
