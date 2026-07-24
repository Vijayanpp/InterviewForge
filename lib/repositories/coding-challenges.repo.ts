import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database, Json } from "@/types/database";
import type {
  CodingChallenge,
  CreateCodingChallengeInput,
  UpdateCodingChallengeInput,
} from "@/types/domain/coding";
import type { ContentStatus, DifficultyLevel } from "@/types/domain/enums";

type Client = SupabaseClient<Database>;

export interface CodingChallengeFilters {
  status?: ContentStatus;
  difficulty?: DifficultyLevel;
  technologyId?: string;
  includeDeleted?: boolean;
}

export async function listApprovedChallenges(
  supabase: Client,
  filters: Omit<CodingChallengeFilters, "status" | "includeDeleted"> = {}
): Promise<CodingChallenge[]> {
  let query = supabase
    .from("coding_challenges")
    .select("*")
    .eq("status", "approved")
    .is("deleted_at", null)
    .order("difficulty", { ascending: true })
    .order("title", { ascending: true });

  if (filters.difficulty && filters.difficulty !== "adaptive") {
    query = query.eq("difficulty", filters.difficulty);
  }
  if (filters.technologyId) query = query.eq("technology_id", filters.technologyId);

  const { data, error } = await query;
  if (error) throw new Error(error.message);
  return data ?? [];
}

export async function listAllChallengesAdmin(
  supabase: Client,
  filters: CodingChallengeFilters = {}
): Promise<CodingChallenge[]> {
  let query = supabase
    .from("coding_challenges")
    .select("*")
    .order("created_at", { ascending: false });

  if (!filters.includeDeleted) query = query.is("deleted_at", null);
  if (filters.status) query = query.eq("status", filters.status);
  if (filters.difficulty && filters.difficulty !== "adaptive") {
    query = query.eq("difficulty", filters.difficulty);
  }
  if (filters.technologyId) query = query.eq("technology_id", filters.technologyId);

  const { data, error } = await query;
  if (error) throw new Error(error.message);
  return data ?? [];
}

export async function getChallengeById(
  supabase: Client,
  id: string
): Promise<CodingChallenge | null> {
  const { data, error } = await supabase
    .from("coding_challenges")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  if (error) throw new Error(error.message);
  return data;
}

export async function getChallengeBySlug(
  supabase: Client,
  slug: string
): Promise<CodingChallenge | null> {
  const { data, error } = await supabase
    .from("coding_challenges")
    .select("*")
    .eq("slug", slug)
    .is("deleted_at", null)
    .maybeSingle();

  if (error) throw new Error(error.message);
  return data;
}

export async function createChallenge(
  supabase: Client,
  input: CreateCodingChallengeInput,
  createdBy: string
): Promise<CodingChallenge> {
  const { data, error } = await supabase
    .from("coding_challenges")
    .insert({
      technology_id: input.technologyId,
      topic_id: input.topicId,
      title: input.title,
      slug: input.slug,
      problem_statement: input.problemStatement,
      difficulty: input.difficulty,
      examples: input.examples as unknown as Json,
      constraints: input.constraints ?? null,
      starter_code: input.starterCode as unknown as Json,
      supported_languages: input.supportedLanguages,
      expected_time_complexity: input.expectedTimeComplexity ?? null,
      expected_space_complexity: input.expectedSpaceComplexity ?? null,
      time_limit_ms: input.timeLimitMs,
      memory_limit_mb: input.memoryLimitMb,
      status: input.status,
      created_by: createdBy,
    })
    .select("*")
    .single();

  if (error || !data) throw new Error(error?.message ?? "Failed to create coding challenge");
  return data;
}

export async function updateChallenge(
  supabase: Client,
  id: string,
  input: UpdateCodingChallengeInput
): Promise<CodingChallenge> {
  const patch: Database["public"]["Tables"]["coding_challenges"]["Update"] = {};
  if (input.technologyId !== undefined) patch.technology_id = input.technologyId;
  if (input.topicId !== undefined) patch.topic_id = input.topicId;
  if (input.title !== undefined) patch.title = input.title;
  if (input.slug !== undefined) patch.slug = input.slug;
  if (input.problemStatement !== undefined) patch.problem_statement = input.problemStatement;
  if (input.difficulty !== undefined) patch.difficulty = input.difficulty;
  if (input.examples !== undefined) patch.examples = input.examples as unknown as Json;
  if (input.constraints !== undefined) patch.constraints = input.constraints ?? null;
  if (input.starterCode !== undefined) patch.starter_code = input.starterCode as unknown as Json;
  if (input.supportedLanguages !== undefined) patch.supported_languages = input.supportedLanguages;
  if (input.expectedTimeComplexity !== undefined) {
    patch.expected_time_complexity = input.expectedTimeComplexity ?? null;
  }
  if (input.expectedSpaceComplexity !== undefined) {
    patch.expected_space_complexity = input.expectedSpaceComplexity ?? null;
  }
  if (input.timeLimitMs !== undefined) patch.time_limit_ms = input.timeLimitMs;
  if (input.memoryLimitMb !== undefined) patch.memory_limit_mb = input.memoryLimitMb;
  if (input.status !== undefined) patch.status = input.status;

  const { data, error } = await supabase
    .from("coding_challenges")
    .update(patch)
    .eq("id", id)
    .select("*")
    .single();

  if (error || !data) throw new Error(error?.message ?? "Failed to update coding challenge");
  return data;
}

export async function softDeleteChallenge(supabase: Client, id: string): Promise<void> {
  const { error } = await supabase
    .from("coding_challenges")
    .update({ deleted_at: new Date().toISOString(), status: "archived" })
    .eq("id", id);
  if (error) throw new Error(error.message);
}

export async function countApprovedChallenges(supabase: Client): Promise<number> {
  const { count, error } = await supabase
    .from("coding_challenges")
    .select("id", { count: "exact", head: true })
    .eq("status", "approved")
    .is("deleted_at", null);
  if (error) throw new Error(error.message);
  return count ?? 0;
}

export async function pickChallengeForSession(
  supabase: Client,
  opts: { technologyIds: string[]; difficulty: DifficultyLevel }
): Promise<CodingChallenge | null> {
  let query = supabase
    .from("coding_challenges")
    .select("*")
    .eq("status", "approved")
    .is("deleted_at", null)
    .limit(20);

  if (opts.difficulty !== "adaptive") {
    query = query.eq("difficulty", opts.difficulty);
  }

  const { data, error } = await query;
  if (error) throw new Error(error.message);
  const rows = data ?? [];
  if (rows.length === 0) {
    // Fallback: any approved challenge
    const { data: fallback } = await supabase
      .from("coding_challenges")
      .select("*")
      .eq("status", "approved")
      .is("deleted_at", null)
      .limit(10);
    const pool = fallback ?? [];
    return pool[Math.floor(Math.random() * pool.length)] ?? null;
  }

  const matching = rows.filter(
    (r) => !r.technology_id || opts.technologyIds.includes(r.technology_id)
  );
  const pool = matching.length > 0 ? matching : rows;
  return pool[Math.floor(Math.random() * pool.length)] ?? null;
}
