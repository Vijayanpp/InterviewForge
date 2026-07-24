import "server-only";
import { createSupabaseAdminClient } from "@/lib/supabase/admin-client";
import { AiProviderError } from "@/lib/errors";
import type { PromptName } from "@/types/domain/enums";

export interface LoadedPrompt {
  id: string;
  promptName: PromptName;
  version: number;
  content: string;
  modelSettings: { model?: string; temperature?: number; max_tokens?: number };
}

const promptCache = new Map<PromptName, LoadedPrompt>();

/**
 * Fetches the currently published prompt template for `promptName`. Uses
 * the admin client because prompt content must be readable server-side
 * regardless of the caller's role — prompts are never sent to the client.
 * Cached in-process since prompts change rarely (admin publish action
 * should call `invalidatePromptCache` after publishing a new version).
 */
export async function loadPublishedPrompt(promptName: PromptName): Promise<LoadedPrompt> {
  const cached = promptCache.get(promptName);
  if (cached) return cached;

  const admin = createSupabaseAdminClient();
  const { data, error } = await admin
    .from("ai_prompt_versions")
    .select("id, prompt_name, version, content, model_settings")
    .eq("prompt_name", promptName)
    .eq("status", "published")
    .order("version", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error || !data) {
    throw new AiProviderError(`No published prompt found for "${promptName}".`);
  }

  const loaded: LoadedPrompt = {
    id: data.id,
    promptName: data.prompt_name as PromptName,
    version: data.version,
    content: data.content,
    modelSettings: (data.model_settings ?? {}) as LoadedPrompt["modelSettings"],
  };

  promptCache.set(promptName, loaded);
  return loaded;
}

export function invalidatePromptCache(promptName?: PromptName): void {
  if (promptName) promptCache.delete(promptName);
  else promptCache.clear();
}

/** Substitutes `{{camelCase}}` placeholders. Missing variables become "". */
export function renderPromptTemplate(template: string, variables: Record<string, unknown>): string {
  return template.replace(/\{\{(\w+)\}\}/g, (_, key: string) => {
    const value = variables[key];
    if (value === undefined || value === null) return "";
    if (Array.isArray(value)) return value.map((v) => stringifyValue(v)).join(", ");
    return stringifyValue(value);
  });
}

function stringifyValue(value: unknown): string {
  if (typeof value === "string") return value;
  if (typeof value === "number" || typeof value === "boolean") return String(value);
  return JSON.stringify(value);
}
