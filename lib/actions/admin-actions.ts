"use server";

import { revalidatePath } from "next/cache";
import { createSupabaseServerClient } from "@/lib/supabase/server-client";
import { requireRole } from "@/lib/auth/require-role";
import { logger } from "@/lib/logger";
import {
  createTechnology,
  softDeleteTechnology,
  updateTechnology,
} from "@/lib/repositories/technologies.repo";
import { createTopic, softDeleteTopic, updateTopic } from "@/lib/repositories/topics.repo";
import {
  createQuestionBankEntry,
  setQuestionBankStatus,
  softDeleteQuestionBankEntry,
  updateQuestionBankEntry,
} from "@/lib/repositories/question-bank.repo";
import {
  createChallenge,
  softDeleteChallenge,
  updateChallenge,
} from "@/lib/repositories/coding-challenges.repo";
import {
  createTestCase,
  deleteTestCase,
  updateTestCase,
} from "@/lib/repositories/coding-test-cases.repo";
import { generateQuestionDraft } from "@/lib/services/question-bank";
import {
  createTechnologySchema,
  createTopicSchema,
  updateTechnologySchema,
  updateTopicSchema,
  type CreateTechnologyInput,
  type CreateTopicInput,
  type UpdateTechnologyInput,
  type UpdateTopicInput,
} from "@/types/domain/technology";
import {
  createQuestionBankEntrySchema,
  generateQuestionDraftSchema,
  updateQuestionBankEntrySchema,
  type CreateQuestionBankEntryInput,
  type GenerateQuestionDraftInput,
  type UpdateQuestionBankEntryInput,
} from "@/types/domain/question-bank";
import {
  createCodingChallengeSchema,
  createCodingTestCaseSchema,
  updateCodingChallengeSchema,
  updateCodingTestCaseSchema,
  type CreateCodingChallengeInput,
  type CreateCodingTestCaseInput,
  type UpdateCodingChallengeInput,
  type UpdateCodingTestCaseInput,
} from "@/types/domain/coding";
import type { ContentStatus } from "@/types/domain/enums";

export interface AdminActionResult {
  success: boolean;
  error?: string;
}

function firstIssueMessage(error: { issues: { message: string }[] }): string {
  return error.issues[0]?.message ?? "Invalid input";
}

// ---------------------------------------------------------------------------
// Technologies
// ---------------------------------------------------------------------------
export async function createTechnologyAction(input: CreateTechnologyInput): Promise<AdminActionResult> {
  const parsed = createTechnologySchema.safeParse(input);
  if (!parsed.success) return { success: false, error: firstIssueMessage(parsed.error) };

  const ctx = await requireRole("admin");
  const supabase = await createSupabaseServerClient();

  try {
    await createTechnology(supabase, parsed.data, ctx.userId);
  } catch (err) {
    logger.error({ err }, "createTechnologyAction failed");
    return { success: false, error: "Could not create technology. The slug may already be in use." };
  }

  revalidatePath("/admin/technologies");
  return { success: true };
}

export async function updateTechnologyAction(
  id: string,
  input: UpdateTechnologyInput
): Promise<AdminActionResult> {
  const parsed = updateTechnologySchema.safeParse(input);
  if (!parsed.success) return { success: false, error: firstIssueMessage(parsed.error) };

  await requireRole("admin");
  const supabase = await createSupabaseServerClient();

  try {
    await updateTechnology(supabase, id, parsed.data);
  } catch (err) {
    logger.error({ err }, "updateTechnologyAction failed");
    return { success: false, error: "Could not update technology." };
  }

  revalidatePath("/admin/technologies");
  return { success: true };
}

export async function deleteTechnologyAction(id: string): Promise<AdminActionResult> {
  await requireRole("admin");
  const supabase = await createSupabaseServerClient();

  try {
    await softDeleteTechnology(supabase, id);
  } catch (err) {
    logger.error({ err }, "deleteTechnologyAction failed");
    return { success: false, error: "Could not delete technology." };
  }

  revalidatePath("/admin/technologies");
  return { success: true };
}

// ---------------------------------------------------------------------------
// Topics
// ---------------------------------------------------------------------------
export async function createTopicAction(input: CreateTopicInput): Promise<AdminActionResult> {
  const parsed = createTopicSchema.safeParse(input);
  if (!parsed.success) return { success: false, error: firstIssueMessage(parsed.error) };

  const ctx = await requireRole("admin");
  const supabase = await createSupabaseServerClient();

  try {
    await createTopic(supabase, parsed.data, ctx.userId);
  } catch (err) {
    logger.error({ err }, "createTopicAction failed");
    return { success: false, error: "Could not create topic. The slug may already be in use for this technology." };
  }

  revalidatePath("/admin/topics");
  return { success: true };
}

export async function updateTopicAction(id: string, input: UpdateTopicInput): Promise<AdminActionResult> {
  const parsed = updateTopicSchema.safeParse(input);
  if (!parsed.success) return { success: false, error: firstIssueMessage(parsed.error) };

  await requireRole("admin");
  const supabase = await createSupabaseServerClient();

  try {
    await updateTopic(supabase, id, parsed.data);
  } catch (err) {
    logger.error({ err }, "updateTopicAction failed");
    return { success: false, error: "Could not update topic." };
  }

  revalidatePath("/admin/topics");
  return { success: true };
}

export async function deleteTopicAction(id: string): Promise<AdminActionResult> {
  await requireRole("admin");
  const supabase = await createSupabaseServerClient();

  try {
    await softDeleteTopic(supabase, id);
  } catch (err) {
    logger.error({ err }, "deleteTopicAction failed");
    return { success: false, error: "Could not delete topic." };
  }

  revalidatePath("/admin/topics");
  return { success: true };
}

// ---------------------------------------------------------------------------
// Question bank
// ---------------------------------------------------------------------------
export async function createQuestionAction(input: CreateQuestionBankEntryInput): Promise<AdminActionResult> {
  const parsed = createQuestionBankEntrySchema.safeParse(input);
  if (!parsed.success) return { success: false, error: firstIssueMessage(parsed.error) };

  const ctx = await requireRole("admin");
  const supabase = await createSupabaseServerClient();

  try {
    await createQuestionBankEntry(supabase, parsed.data, ctx.userId, "admin");
  } catch (err) {
    logger.error({ err }, "createQuestionAction failed");
    return { success: false, error: "Could not create question." };
  }

  revalidatePath("/admin/questions");
  return { success: true };
}

export async function updateQuestionAction(
  id: string,
  input: UpdateQuestionBankEntryInput
): Promise<AdminActionResult> {
  const parsed = updateQuestionBankEntrySchema.safeParse(input);
  if (!parsed.success) return { success: false, error: firstIssueMessage(parsed.error) };

  await requireRole("admin");
  const supabase = await createSupabaseServerClient();

  try {
    await updateQuestionBankEntry(supabase, id, parsed.data);
  } catch (err) {
    logger.error({ err }, "updateQuestionAction failed");
    return { success: false, error: "Could not update question." };
  }

  revalidatePath("/admin/questions");
  return { success: true };
}

export async function setQuestionStatusAction(id: string, status: ContentStatus): Promise<AdminActionResult> {
  await requireRole("admin");
  const supabase = await createSupabaseServerClient();

  try {
    await setQuestionBankStatus(supabase, id, status);
  } catch (err) {
    logger.error({ err }, "setQuestionStatusAction failed");
    return { success: false, error: "Could not update question status." };
  }

  revalidatePath("/admin/questions");
  return { success: true };
}

export async function deleteQuestionAction(id: string): Promise<AdminActionResult> {
  await requireRole("admin");
  const supabase = await createSupabaseServerClient();

  try {
    await softDeleteQuestionBankEntry(supabase, id);
  } catch (err) {
    logger.error({ err }, "deleteQuestionAction failed");
    return { success: false, error: "Could not delete question." };
  }

  revalidatePath("/admin/questions");
  return { success: true };
}

export async function generateQuestionDraftAction(
  input: GenerateQuestionDraftInput
): Promise<AdminActionResult> {
  const parsed = generateQuestionDraftSchema.safeParse(input);
  if (!parsed.success) return { success: false, error: firstIssueMessage(parsed.error) };

  const ctx = await requireRole("admin");
  const supabase = await createSupabaseServerClient();

  try {
    await generateQuestionDraft(supabase, parsed.data, ctx.userId);
  } catch (err) {
    logger.error({ err }, "generateQuestionDraftAction failed");
    return { success: false, error: "The AI provider could not generate a question draft. Please try again." };
  }

  revalidatePath("/admin/questions");
  return { success: true };
}

// ---------------------------------------------------------------------------
// Coding challenges
// ---------------------------------------------------------------------------
export async function createChallengeAction(
  input: CreateCodingChallengeInput
): Promise<AdminActionResult & { id?: string }> {
  const parsed = createCodingChallengeSchema.safeParse(input);
  if (!parsed.success) return { success: false, error: firstIssueMessage(parsed.error) };

  const ctx = await requireRole("admin");
  const supabase = await createSupabaseServerClient();

  try {
    const challenge = await createChallenge(supabase, parsed.data, ctx.userId);
    revalidatePath("/admin/challenges");
    return { success: true, id: challenge.id };
  } catch (err) {
    logger.error({ err }, "createChallengeAction failed");
    return { success: false, error: "Could not create challenge. The slug may already be in use." };
  }
}

export async function updateChallengeAction(
  id: string,
  input: UpdateCodingChallengeInput
): Promise<AdminActionResult> {
  const parsed = updateCodingChallengeSchema.safeParse(input);
  if (!parsed.success) return { success: false, error: firstIssueMessage(parsed.error) };

  await requireRole("admin");
  const supabase = await createSupabaseServerClient();

  try {
    await updateChallenge(supabase, id, parsed.data);
  } catch (err) {
    logger.error({ err }, "updateChallengeAction failed");
    return { success: false, error: "Could not update challenge." };
  }

  revalidatePath("/admin/challenges");
  revalidatePath(`/admin/challenges/${id}`);
  return { success: true };
}

export async function setChallengeStatusAction(id: string, status: ContentStatus): Promise<AdminActionResult> {
  await requireRole("admin");
  const supabase = await createSupabaseServerClient();

  try {
    await updateChallenge(supabase, id, { status });
  } catch (err) {
    logger.error({ err }, "setChallengeStatusAction failed");
    return { success: false, error: "Could not update challenge status." };
  }

  revalidatePath("/admin/challenges");
  revalidatePath(`/admin/challenges/${id}`);
  return { success: true };
}

export async function deleteChallengeAction(id: string): Promise<AdminActionResult> {
  await requireRole("admin");
  const supabase = await createSupabaseServerClient();

  try {
    await softDeleteChallenge(supabase, id);
  } catch (err) {
    logger.error({ err }, "deleteChallengeAction failed");
    return { success: false, error: "Could not delete challenge." };
  }

  revalidatePath("/admin/challenges");
  return { success: true };
}

export async function createTestCaseAction(input: CreateCodingTestCaseInput): Promise<AdminActionResult> {
  const parsed = createCodingTestCaseSchema.safeParse(input);
  if (!parsed.success) return { success: false, error: firstIssueMessage(parsed.error) };

  await requireRole("admin");
  const supabase = await createSupabaseServerClient();

  try {
    await createTestCase(supabase, parsed.data);
  } catch (err) {
    logger.error({ err }, "createTestCaseAction failed");
    return { success: false, error: "Could not create test case." };
  }

  revalidatePath(`/admin/challenges/${parsed.data.challengeId}`);
  return { success: true };
}

export async function updateTestCaseAction(
  id: string,
  challengeId: string,
  input: UpdateCodingTestCaseInput
): Promise<AdminActionResult> {
  const parsed = updateCodingTestCaseSchema.safeParse(input);
  if (!parsed.success) return { success: false, error: firstIssueMessage(parsed.error) };

  await requireRole("admin");
  const supabase = await createSupabaseServerClient();

  try {
    await updateTestCase(supabase, id, parsed.data);
  } catch (err) {
    logger.error({ err }, "updateTestCaseAction failed");
    return { success: false, error: "Could not update test case." };
  }

  revalidatePath(`/admin/challenges/${challengeId}`);
  return { success: true };
}

export async function deleteTestCaseAction(id: string, challengeId: string): Promise<AdminActionResult> {
  await requireRole("admin");
  const supabase = await createSupabaseServerClient();

  try {
    await deleteTestCase(supabase, id);
  } catch (err) {
    logger.error({ err }, "deleteTestCaseAction failed");
    return { success: false, error: "Could not delete test case." };
  }

  revalidatePath(`/admin/challenges/${challengeId}`);
  return { success: true };
}
