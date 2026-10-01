import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getAuthContext } from "@/lib/auth/require-role";
import { BrandLogo } from "@/components/brand/brand-logo";
import { noIndexRobots } from "@/lib/seo";

export const metadata: Metadata = { robots: noIndexRobots };

export default async function InterviewRoomLayout({ children }: { children: React.ReactNode }) {
  const ctx = await getAuthContext();
  if (!ctx) redirect("/login");

  return (
    <div className="flex h-screen flex-col overflow-hidden bg-background">
      <header className="flex h-16 items-center gap-sm border-b border-border bg-background/80 px-lg backdrop-blur-md">
        <BrandLogo variant="mark" href="/dashboard" />
      </header>
      <main id="main-content" className="relative flex flex-1 overflow-hidden" tabIndex={-1}>{children}</main>
    </div>
  );
}
