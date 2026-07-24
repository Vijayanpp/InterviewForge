import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/types/database";
import type { JobDescription, Resume } from "@/types/domain/documents";

type Client = SupabaseClient<Database>;

export async function createResume(
  supabase: Client,
  input: {
    candidateId: string;
    filePath: string;
    fileName: string;
    mimeType: string;
    sizeBytes: number;
    parsedText?: string | null;
    isPrimary?: boolean;
  }
): Promise<Resume> {
  const { data, error } = await supabase
    .from("resumes")
    .insert({
      candidate_id: input.candidateId,
      file_path: input.filePath,
      file_name: input.fileName,
      mime_type: input.mimeType,
      size_bytes: input.sizeBytes,
      parsed_text: input.parsedText ?? null,
      is_primary: input.isPrimary ?? true,
    })
    .select("*")
    .single();

  if (error || !data) throw new Error(error?.message ?? "Failed to save resume");
  return data;
}

export async function getResumeById(
  supabase: Client,
  resumeId: string
): Promise<Resume | null> {
  const { data, error } = await supabase
    .from("resumes")
    .select("*")
    .eq("id", resumeId)
    .is("deleted_at", null)
    .maybeSingle();

  if (error) throw new Error(error.message);
  return data;
}

export async function createJobDescription(
  supabase: Client,
  input: {
    candidateId: string;
    content: string;
    title?: string | null;
    company?: string | null;
    source?: "paste" | "upload" | "url";
  }
): Promise<JobDescription> {
  const { data, error } = await supabase
    .from("job_descriptions")
    .insert({
      candidate_id: input.candidateId,
      content: input.content,
      title: input.title ?? null,
      company: input.company ?? null,
      source: input.source ?? "paste",
    })
    .select("*")
    .single();

  if (error || !data) throw new Error(error?.message ?? "Failed to save job description");
  return data;
}

export async function getJobDescriptionById(
  supabase: Client,
  jobDescriptionId: string
): Promise<JobDescription | null> {
  const { data, error } = await supabase
    .from("job_descriptions")
    .select("*")
    .eq("id", jobDescriptionId)
    .is("deleted_at", null)
    .maybeSingle();

  if (error) throw new Error(error.message);
  return data;
}
