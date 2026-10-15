import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getAuthContext } from "@/lib/auth/require-role";
import { noIndexRobots } from "@/lib/seo";

export const metadata: Metadata = { robots: noIndexRobots };

/** Full-bleed shell — VoiceRoom owns its own header chrome (Stitch design). */
export default async function InterviewVoiceLayout({ children }: { children: React.ReactNode }) {
  const ctx = await getAuthContext();
  if (!ctx) redirect("/login");

  return (
    <div id="main-content" className="flex h-dvh max-h-dvh flex-col overflow-hidden bg-background" tabIndex={-1}>
      {children}
    </div>
  );
}
