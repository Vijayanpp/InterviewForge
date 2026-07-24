import { redirect } from "next/navigation";
import { getAuthContext } from "@/lib/auth/require-role";

/** Full-bleed shell — VoiceRoom owns its own header chrome (Stitch design). */
export default async function InterviewVoiceLayout({ children }: { children: React.ReactNode }) {
  const ctx = await getAuthContext();
  if (!ctx) redirect("/login");

  return <div className="flex h-screen flex-col overflow-hidden bg-background">{children}</div>;
}
