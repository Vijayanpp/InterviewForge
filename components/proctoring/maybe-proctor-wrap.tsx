import { createSupabaseAdminClient } from "@/lib/supabase/admin-client";
import { parseAntiCheatingSettings, type AntiCheatingSettings } from "@/types/domain/assessment";
import { ProctorShell } from "@/components/proctoring/proctor-shell";

/** Server helper: if this session belongs to an assessment invite, wrap with heavy proctoring. */
export async function maybeProctorWrap(
  sessionId: string,
  children: React.ReactNode
): Promise<React.ReactNode> {
  const admin = createSupabaseAdminClient();
  const { data } = await admin
    .from("assessment_candidates")
    .select("id, assessments(anti_cheating_settings)")
    .eq("session_id", sessionId)
    .maybeSingle();

  if (!data) return children;

  const settings: AntiCheatingSettings = parseAntiCheatingSettings(
    (data.assessments as { anti_cheating_settings?: unknown } | null)?.anti_cheating_settings
  );

  return (
    <ProctorShell sessionId={sessionId} settings={settings}>
      {children}
    </ProctorShell>
  );
}
