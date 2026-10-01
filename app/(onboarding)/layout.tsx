import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getAuthContext } from "@/lib/auth/require-role";
import { BrandLogo } from "@/components/brand/brand-logo";
import { noIndexRobots } from "@/lib/seo";

export const metadata: Metadata = {
  robots: noIndexRobots,
};

export default async function OnboardingLayout({ children }: { children: React.ReactNode }) {
  const ctx = await getAuthContext();

  if (!ctx) {
    redirect("/login");
  }

  if (ctx.profile.onboarding_completed_at) {
    redirect("/dashboard");
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="flex h-16 items-center border-b border-border px-lg">
        <BrandLogo variant="mark" href="/" />
      </header>
      <main
        id="main-content"
        className="flex min-h-[calc(100vh-64px)] items-center justify-center px-lg py-2xl"
        tabIndex={-1}
      >
        {children}
      </main>
    </div>
  );
}
