import Link from "next/link";
import { format } from "date-fns";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { INTERVIEW_TYPE_LABELS } from "@/types/domain/enums";
import type { SessionWithReport } from "@/lib/repositories/interview-sessions.repo";

const STATUS_VARIANT: Record<string, "default" | "secondary" | "outline" | "destructive"> = {
  completed: "default",
  in_progress: "secondary",
  draft: "outline",
  abandoned: "destructive",
};

export function RecentInterviewsTable({
  sessions,
  technologyNames,
}: {
  sessions: SessionWithReport[];
  technologyNames: Map<string, string>;
}) {
  if (sessions.length === 0) {
    return (
      <Card className="flex flex-col items-center justify-center gap-md p-2xl text-center">
        <p className="font-headline-md text-headline-md text-foreground">No interviews yet</p>
        <p className="max-w-sm text-body-sm text-muted-foreground">
          Start your first AI-powered mock interview to see your history and scores here.
        </p>
        <Link href="/interviews/new" className="font-body-md font-semibold text-primary hover:underline">
          Start an interview →
        </Link>
      </Card>
    );
  }

  return (
    <Card className="overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Interview</TableHead>
            <TableHead>Date</TableHead>
            <TableHead>Score</TableHead>
            <TableHead>Status</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {sessions.map((session) => {
            const score = session.interview_reports?.[0]?.overall_score;
            const techLabel = session.technology_ids
              .map((id) => technologyNames.get(id))
              .filter(Boolean)
              .join(", ");
            const href =
              session.status === "completed"
                ? `/interviews/${session.id}/report`
                : `/interviews/${session.id}/room`;

            return (
              <TableRow key={session.id} className="cursor-pointer hover:bg-muted/50">
                <TableCell>
                  <Link href={href} className="block">
                    <p className="font-medium text-foreground">
                      {INTERVIEW_TYPE_LABELS[session.interview_type]}
                    </p>
                    <p className="text-body-sm text-muted-foreground">{techLabel || "—"}</p>
                  </Link>
                </TableCell>
                <TableCell className="text-body-sm text-muted-foreground">
                  {format(new Date(session.created_at), "MMM d, yyyy")}
                </TableCell>
                <TableCell>
                  {typeof score === "number" ? (
                    <span className="font-semibold text-foreground">{Math.round(score)}/100</span>
                  ) : (
                    <span className="text-muted-foreground">—</span>
                  )}
                </TableCell>
                <TableCell>
                  <Badge variant={STATUS_VARIANT[session.status] ?? "outline"} className="capitalize">
                    {session.status.replace("_", " ")}
                  </Badge>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </Card>
  );
}
