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
import { createTopicSchema, type CreateTopicInput, type Technology, type Topic } from "@/types/domain/technology";
import { createTopicAction, updateTopicAction } from "@/lib/actions/admin-actions";

function slugify(value: string): string {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function TopicFormDialog({
  open,
  onOpenChange,
  topic,
  technologies,
  defaultTechnologyId,
  nextSortOrder,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  topic: Topic | null;
  technologies: Technology[];
  defaultTechnologyId: string | null;
  nextSortOrder: number;
}) {
  const isEditing = !!topic;
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<z.input<typeof createTopicSchema>, unknown, CreateTopicInput>({
    resolver: zodResolver(createTopicSchema),
    defaultValues: {
      technologyId: defaultTechnologyId ?? technologies[0]?.id ?? "",
      slug: "",
      name: "",
      description: "",
      sortOrder: nextSortOrder,
      isActive: true,
    },
  });

  useEffect(() => {
    if (!open) return;
    form.reset(
      topic
        ? {
            technologyId: topic.technology_id,
            slug: topic.slug,
            name: topic.name,
            description: topic.description ?? "",
            sortOrder: topic.sort_order,
            isActive: topic.is_active,
          }
        : {
            technologyId: defaultTechnologyId ?? technologies[0]?.id ?? "",
            slug: "",
            name: "",
            description: "",
            sortOrder: nextSortOrder,
            isActive: true,
          }
    );
  }, [open, topic, defaultTechnologyId, nextSortOrder, technologies, form]);

  async function onSubmit(values: CreateTopicInput) {
    setIsSubmitting(true);
    const result = isEditing
      ? await updateTopicAction(topic!.id, values)
      : await createTopicAction(values);
    setIsSubmitting(false);

    if (!result.success) {
      toast.error(result.error ?? "Something went wrong.");
      return;
    }

    toast.success(isEditing ? "Topic updated." : "Topic created.");
    onOpenChange(false);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{isEditing ? "Edit topic" : "New topic"}</DialogTitle>
          <DialogDescription>
            Topics let candidates drill into a specific area of a technology during the wizard.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form className="space-y-md" onSubmit={form.handleSubmit(onSubmit)}>
            <FormField
              control={form.control}
              name="technologyId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Technology</FormLabel>
                  <Select
                    value={field.value}
                    onValueChange={field.onChange}
                    disabled={isEditing}
                  >
                    <FormControl>
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Select a technology">
                          {(value: string) => technologies.find((t) => t.id === value)?.name ?? "Select a technology"}
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
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Name</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Hooks"
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
                    <Input placeholder="hooks" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea placeholder="Short description" {...field} />
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
                {isEditing ? "Save changes" : "Create topic"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
