import type { Metadata } from "next";
import Link from "next/link";
import { Archive, Cpu, ListTree, Sparkles, Users, ClipboardCheck } from "lucide-react";
import { createSupabaseServerClient } from "@/lib/supabase/server-client";
import { getAdminOverviewStats } from "@/lib/repositories/admin-stats.repo";
import { Card } from "@/components/ui/card";

export const metadata: Metadata = {
  title: "Admin Overview",
};

export default async function AdminDashboardPage() {
  const supabase = await createSupabaseServerClient();
  const stats = await getAdminOverviewStats(supabase);

  const cards = [
    { label: "Active technologies", value: stats.activeTechnologies, icon: Cpu, href: "/admin/technologies" },
    { label: "Active topics", value: stats.activeTopics, icon: ListTree, href: "/admin/topics" },
    { label: "Approved questions", value: stats.approvedQuestions, icon: ClipboardCheck, href: "/admin/questions" },
    { label: "Drafts awaiting review", value: stats.draftQuestions, icon: Sparkles, href: "/admin/questions" },
    { label: "Registered candidates", value: stats.totalCandidates, icon: Users, href: null },
    { label: "Completed interviews", value: stats.completedSessions, icon: Archive, href: null },
  ];

  return (
    <div className="space-y-lg">
      <div>
        <h1 className="font-headline-lg text-headline-lg text-foreground">Admin Overview</h1>
        <p className="mt-xs text-body-md text-muted-foreground">
          A snapshot of the content that powers InterviewForge&apos;s interview engine.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-gutter sm:grid-cols-2 lg:grid-cols-3">
        {cards.map((card) => {
          const Icon = card.icon;
          const content = (
            <Card className="flex items-center gap-md p-lg transition-shadow hover:shadow-md">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
                <Icon className="h-5 w-5" />
              </span>
              <div>
                <p className="font-headline-md text-headline-md font-bold text-foreground">{card.value}</p>
                <p className="text-body-sm text-muted-foreground">{card.label}</p>
              </div>
            </Card>
          );

          return card.href ? (
            <Link key={card.label} href={card.href}>
              {content}
            </Link>
          ) : (
            <div key={card.label}>{content}</div>
          );
        })}
      </div>

      {stats.draftQuestions > 0 && (
        <Card className="flex flex-col items-start gap-md bg-sidebar p-lg text-sidebar-foreground sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-start gap-md">
            <span className="mt-1 flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white/10">
              <Sparkles className="h-5 w-5 text-sidebar-primary" />
            </span>
            <div>
              <p className="font-headline-md text-headline-md">Drafts need review</p>
              <p className="mt-1 text-body-sm text-sidebar-foreground/70">
                {stats.draftQuestions} AI-generated question{stats.draftQuestions === 1 ? "" : "s"} awaiting
                approval before candidates can see them.
              </p>
            </div>
          </div>
          <Link
            href="/admin/questions"
            className="shrink-0 rounded-lg bg-white/10 px-4 py-2 text-body-sm font-semibold hover:bg-white/20"
          >
            Review now
          </Link>
        </Card>
      )}
    </div>
  );
}
