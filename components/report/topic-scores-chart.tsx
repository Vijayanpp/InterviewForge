"use client";

import { Bar, BarChart, CartesianGrid, ResponsiveContainer, XAxis, YAxis } from "recharts";
import { Card } from "@/components/ui/card";
import type { TopicScore } from "@/types/domain/report";

export function TopicScoresChart({ topicScores }: { topicScores: TopicScore[] }) {
  if (topicScores.length === 0) return null;

  return (
    <Card className="p-lg">
      <h3 className="mb-lg font-headline-md text-headline-md text-foreground">Score by Topic</h3>
      <ResponsiveContainer width="100%" height={Math.max(160, topicScores.length * 56)}>
        <BarChart data={topicScores} layout="vertical" margin={{ left: 16, right: 24 }}>
          <CartesianGrid horizontal={false} stroke="var(--border)" />
          <XAxis type="number" domain={[0, 100]} hide />
          <YAxis
            type="category"
            dataKey="topicName"
            width={140}
            tick={{ fontSize: 12, fill: "var(--muted-foreground)" }}
            axisLine={false}
            tickLine={false}
          />
          <Bar dataKey="score" fill="var(--color-chart-1)" radius={[0, 6, 6, 0]} barSize={18} />
        </BarChart>
      </ResponsiveContainer>
    </Card>
  );
}
