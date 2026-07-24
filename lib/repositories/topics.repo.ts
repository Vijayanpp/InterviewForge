import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/types/database";
import type { CreateTopicInput, Topic, UpdateTopicInput } from "@/types/domain/technology";

type Client = SupabaseClient<Database>;

export async function listAllTopicsForTechnologyAdmin(
  supabase: Client,
  technologyId: string
): Promise<Topic[]> {
  const { data, error } = await supabase
    .from("topics")
    .select("*")
    .eq("technology_id", technologyId)
    .is("deleted_at", null)
    .order("sort_order", { ascending: true });

  if (error) throw new Error(error.message);
  return data ?? [];
}

/** All topics across all technologies, for the admin topics screen. */
export async function listAllTopicsAdmin(supabase: Client): Promise<Topic[]> {
  const { data, error } = await supabase
    .from("topics")
    .select("*")
    .is("deleted_at", null)
    .order("technology_id", { ascending: true })
    .order("sort_order", { ascending: true });

  if (error) throw new Error(error.message);
  return data ?? [];
}

export async function createTopic(
  supabase: Client,
  input: CreateTopicInput,
  createdBy: string
): Promise<Topic> {
  const { data, error } = await supabase
    .from("topics")
    .insert({
      technology_id: input.technologyId,
      slug: input.slug,
      name: input.name,
      description: input.description || null,
      sort_order: input.sortOrder,
      is_active: input.isActive,
      created_by: createdBy,
    })
    .select("*")
    .single();

  if (error || !data) throw new Error(error?.message ?? "Failed to create topic");
  return data;
}

export async function updateTopic(
  supabase: Client,
  id: string,
  input: UpdateTopicInput
): Promise<Topic> {
  const patch: Database["public"]["Tables"]["topics"]["Update"] = {};
  if (input.slug !== undefined) patch.slug = input.slug;
  if (input.name !== undefined) patch.name = input.name;
  if (input.description !== undefined) patch.description = input.description || null;
  if (input.sortOrder !== undefined) patch.sort_order = input.sortOrder;
  if (input.isActive !== undefined) patch.is_active = input.isActive;

  const { data, error } = await supabase
    .from("topics")
    .update(patch)
    .eq("id", id)
    .select("*")
    .single();

  if (error || !data) throw new Error(error?.message ?? "Failed to update topic");
  return data;
}

export async function softDeleteTopic(supabase: Client, id: string): Promise<void> {
  const { error } = await supabase
    .from("topics")
    .update({ deleted_at: new Date().toISOString(), is_active: false })
    .eq("id", id);

  if (error) throw new Error(error.message);
}
