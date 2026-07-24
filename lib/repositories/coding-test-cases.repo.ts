import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/types/database";
import type {
  CodingTestCase,
  CreateCodingTestCaseInput,
  UpdateCodingTestCaseInput,
} from "@/types/domain/coding";

type Client = SupabaseClient<Database>;

/** Visible cases only — safe under candidate RLS. */
export async function listVisibleTestCases(
  supabase: Client,
  challengeId: string
): Promise<CodingTestCase[]> {
  const { data, error } = await supabase
    .from("coding_test_cases")
    .select("*")
    .eq("challenge_id", challengeId)
    .eq("is_hidden", false)
    .order("order_index", { ascending: true });

  if (error) throw new Error(error.message);
  return data ?? [];
}

/** All cases including hidden — requires admin/service-role client. */
export async function listAllTestCases(
  supabase: Client,
  challengeId: string
): Promise<CodingTestCase[]> {
  const { data, error } = await supabase
    .from("coding_test_cases")
    .select("*")
    .eq("challenge_id", challengeId)
    .order("order_index", { ascending: true });

  if (error) throw new Error(error.message);
  return data ?? [];
}

export async function countVisibleTestCases(
  supabase: Client,
  challengeId: string
): Promise<number> {
  const { count, error } = await supabase
    .from("coding_test_cases")
    .select("id", { count: "exact", head: true })
    .eq("challenge_id", challengeId)
    .eq("is_hidden", false);
  if (error) throw new Error(error.message);
  return count ?? 0;
}

export async function createTestCase(
  supabase: Client,
  input: CreateCodingTestCaseInput
): Promise<CodingTestCase> {
  const { data, error } = await supabase
    .from("coding_test_cases")
    .insert({
      challenge_id: input.challengeId,
      input: input.input,
      expected_output: input.expectedOutput,
      is_hidden: input.isHidden,
      order_index: input.orderIndex,
      weight: input.weight,
    })
    .select("*")
    .single();

  if (error || !data) throw new Error(error?.message ?? "Failed to create test case");
  return data;
}

export async function updateTestCase(
  supabase: Client,
  id: string,
  input: UpdateCodingTestCaseInput
): Promise<CodingTestCase> {
  const patch: Database["public"]["Tables"]["coding_test_cases"]["Update"] = {};
  if (input.input !== undefined) patch.input = input.input;
  if (input.expectedOutput !== undefined) patch.expected_output = input.expectedOutput;
  if (input.isHidden !== undefined) patch.is_hidden = input.isHidden;
  if (input.orderIndex !== undefined) patch.order_index = input.orderIndex;
  if (input.weight !== undefined) patch.weight = input.weight;

  const { data, error } = await supabase
    .from("coding_test_cases")
    .update(patch)
    .eq("id", id)
    .select("*")
    .single();

  if (error || !data) throw new Error(error?.message ?? "Failed to update test case");
  return data;
}

export async function deleteTestCase(supabase: Client, id: string): Promise<void> {
  const { error } = await supabase.from("coding_test_cases").delete().eq("id", id);
  if (error) throw new Error(error.message);
}
