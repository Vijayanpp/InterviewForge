import { z } from "zod";
import type { Tables } from "@/types/domain/db-helpers";

export type Technology = Tables<"technologies">;
export type Topic = Tables<"topics">;

export const technologySlugSchema = z
  .string()
  .trim()
  .toLowerCase()
  .regex(/^[a-z0-9]+(-[a-z0-9]+)*$/, "Use lowercase letters, numbers and hyphens only");

export const createTechnologySchema = z.object({
  slug: technologySlugSchema,
  name: z.string().trim().min(1).max(80),
  category: z.string().trim().min(1).max(40).default("language"),
  icon: z.string().trim().max(80).optional(),
  description: z.string().trim().max(500).optional(),
  isActive: z.boolean().default(true),
  sortOrder: z.number().int().min(0).default(0),
});
export type CreateTechnologyInput = z.infer<typeof createTechnologySchema>;

export const updateTechnologySchema = createTechnologySchema.partial();
export type UpdateTechnologyInput = z.infer<typeof updateTechnologySchema>;

export const createTopicSchema = z.object({
  technologyId: z.string().uuid(),
  slug: technologySlugSchema,
  name: z.string().trim().min(1).max(80),
  description: z.string().trim().max(500).optional(),
  sortOrder: z.number().int().min(0).default(0),
  isActive: z.boolean().default(true),
});
export type CreateTopicInput = z.infer<typeof createTopicSchema>;

export const updateTopicSchema = createTopicSchema.partial().omit({ technologyId: true });
export type UpdateTopicInput = z.infer<typeof updateTopicSchema>;
