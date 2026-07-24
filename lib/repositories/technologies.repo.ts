import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/types/database";
import type { CreateTechnologyInput, Technology, Topic, UpdateTechnologyInput } from "@/types/domain/technology";

type Client = SupabaseClient<Database>;

export async function listActiveTechnologies(supabase: Client): Promise<Technology[]> {
  const { data, error } = await supabase
    .from("technologies")
    .select("*")
    .eq("is_active", true)
    .is("deleted_at", null)
    .order("sort_order", { ascending: true });

  if (error) throw new Error(error.message);
  return data ?? [];
}

export async function getTechnologiesByIds(supabase: Client, ids: string[]): Promise<Technology[]> {
  if (ids.length === 0) return [];
  const { data, error } = await supabase.from("technologies").select("*").in("id", ids);
  if (error) throw new Error(error.message);
  return data ?? [];
}

export async function getTopicsByIds(supabase: Client, ids: string[]): Promise<Topic[]> {
  if (ids.length === 0) return [];
  const { data, error } = await supabase.from("topics").select("*").in("id", ids);
  if (error) throw new Error(error.message);
  return data ?? [];
}

export async function listTopicsForTechnologies(
  supabase: Client,
  technologyIds: string[]
): Promise<Topic[]> {
  if (technologyIds.length === 0) return [];

  const { data, error } = await supabase
    .from("topics")
    .select("*")
    .in("technology_id", technologyIds)
    .eq("is_active", true)
    .is("deleted_at", null)
    .order("sort_order", { ascending: true });

  if (error) throw new Error(error.message);
  return data ?? [];
}

// ---------------------------------------------------------------------------
// Admin CRUD — every table read above filters out inactive/deleted rows for
// candidate-facing use; admin screens need the full, unfiltered list.
// ---------------------------------------------------------------------------
export async function listAllTechnologiesAdmin(supabase: Client): Promise<Technology[]> {
  const { data, error } = await supabase
    .from("technologies")
    .select("*")
    .is("deleted_at", null)
    .order("sort_order", { ascending: true });

  if (error) throw new Error(error.message);
  return data ?? [];
}

export async function createTechnology(
  supabase: Client,
  input: CreateTechnologyInput,
  createdBy: string
): Promise<Technology> {
  const { data, error } = await supabase
    .from("technologies")
    .insert({
      slug: input.slug,
      name: input.name,
      category: input.category,
      icon: input.icon || null,
      description: input.description || null,
      is_active: input.isActive,
      sort_order: input.sortOrder,
      created_by: createdBy,
    })
    .select("*")
    .single();

  if (error || !data) throw new Error(error?.message ?? "Failed to create technology");
  return data;
}

export async function updateTechnology(
  supabase: Client,
  id: string,
  input: UpdateTechnologyInput
): Promise<Technology> {
  const patch: Database["public"]["Tables"]["technologies"]["Update"] = {};
  if (input.slug !== undefined) patch.slug = input.slug;
  if (input.name !== undefined) patch.name = input.name;
  if (input.category !== undefined) patch.category = input.category;
  if (input.icon !== undefined) patch.icon = input.icon || null;
  if (input.description !== undefined) patch.description = input.description || null;
  if (input.isActive !== undefined) patch.is_active = input.isActive;
  if (input.sortOrder !== undefined) patch.sort_order = input.sortOrder;

  const { data, error } = await supabase
    .from("technologies")
    .update(patch)
    .eq("id", id)
    .select("*")
    .single();

  if (error || !data) throw new Error(error?.message ?? "Failed to update technology");
  return data;
}

export async function softDeleteTechnology(supabase: Client, id: string): Promise<void> {
  const { error } = await supabase
    .from("technologies")
    .update({ deleted_at: new Date().toISOString(), is_active: false })
    .eq("id", id);

  if (error) throw new Error(error.message);
}
