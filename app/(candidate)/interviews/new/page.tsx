import type { Metadata } from "next";
import { createSupabaseServerClient } from "@/lib/supabase/server-client";
import { listActiveTechnologies } from "@/lib/repositories/technologies.repo";
import { InterviewWizard } from "@/components/wizard/interview-wizard";

export const metadata: Metadata = {
  title: "New Interview",
};

export default async function NewInterviewPage() {
  const supabase = await createSupabaseServerClient();
  const technologies = await listActiveTechnologies(supabase);

  return <InterviewWizard technologies={technologies} />;
}
