import { describe, expect, it } from "vitest";
import { buildGraphInput } from "@/lib/graph/inputs";
import { invokeInterviewGraph, resetInterviewGraph } from "@/lib/graph/workflow";
import { resetInterviewCheckpointer } from "@/lib/graph/checkpointer";

describe("interview LangGraph", () => {
  it(
    "prep then ask produces Maya's opening question",
    async () => {
    resetInterviewCheckpointer();
    resetInterviewGraph();

    const sessionId = "11111111-1111-1111-1111-111111111111";
    const base = {
      sessionId,
      interviewType: "technical" as const,
      technology: "React",
      topics: ["Hooks"],
      experienceLevel: "mid" as const,
      difficulty: "medium" as const,
      remainingMinutes: 30,
      candidateName: "Ada Lovelace",
      skipOpening: false,
    };

    const prep = await invokeInterviewGraph(buildGraphInput({ ...base, turnMode: "prep" }), sessionId);
    expect(prep.interviewPlan?.tasks.length).toBeGreaterThan(0);
    expect(prep.retrievalTrace?.documents.length).toBeGreaterThan(0);

    const asked = await invokeInterviewGraph(
      buildGraphInput({ ...base, turnMode: "ask", interviewPlan: prep.interviewPlan }),
      sessionId
    );

    expect(asked.generatedQuestion?.body).toContain("Maya");
    expect(asked.generatedQuestion?.body).toContain("Ada");
    },
    15_000
  );
});
