import { redirect } from "next/navigation";
import { getAuthContext } from "@/lib/auth/require-role";
import { CandidateSidebar } from "@/components/layout/candidate-sidebar";
import { CandidateTopbar } from "@/components/layout/candidate-topbar";

export default async function CandidateLayout({ children }: { children: React.ReactNode }) {
  const ctx = await getAuthContext();

  if (!ctx) {
    redirect("/login");
  }

  if (!ctx.profile.onboarding_completed_at) {
    redirect("/onboarding");
  }

  return (
    <div className="min-h-screen bg-background">
      <CandidateSidebar isAdmin={ctx.role === "admin"} />
      <main className="flex min-h-screen flex-col lg:ml-[280px]">
        <CandidateTopbar profile={ctx.profile} />
        <div className="mx-auto w-full max-w-[1440px] flex-1 space-y-lg p-lg lg:p-xl">{children}</div>
      </main>
    </div>
  );
}
