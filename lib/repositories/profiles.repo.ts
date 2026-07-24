import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/types/database";
import type { Profile } from "@/types/domain/profile";

type Client = SupabaseClient<Database>;

export async function getProfileById(supabase: Client, id: string): Promise<Profile | null> {
  const { data, error } = await supabase.from("profiles").select("*").eq("id", id).single();
  if (error) return null;
  return data;
}

export interface UpdateProfileRow {
  full_name?: string;
  avatar_url?: string | null;
  years_experience?: number | null;
  current_job_role?: string | null;
  target_job_role?: string | null;
  main_skills?: string[];
  preferred_technologies?: string[];
  interview_goal?: string | null;
  preferred_language?: string;
  onboarding_completed_at?: string | null;
}

export async function updateProfile(
  supabase: Client,
  id: string,
  values: UpdateProfileRow
): Promise<Profile> {
  const { data, error } = await supabase
    .from("profiles")
    .update(values)
    .eq("id", id)
    .select("*")
    .single();

  if (error || !data) throw new Error(error?.message ?? "Failed to update profile");
  return data;
}
