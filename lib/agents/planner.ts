import { interviewPlanSchema, type InterviewPlan } from "@/lib/agents/schemas/query";
import type { InterviewState } from "@/lib/graph/state";

export function createInterviewPlanMock(state: Pick<
  InterviewState,
  "interviewType" | "technology" | "topics" | "experienceLevel" | "difficulty" | "topicCoverage"
>): InterviewPlan {
  const topics = state.topics.length > 0 ? state.topics : [state.technology];
  const weakTopics = [...state.topicCoverage].sort((a, b) => a.score - b.score).map((item) => item.topic);
  const focus = weakTopics.length > 0 ? weakTopics.slice(0, 3) : topics;

  const tasks = [
    {
      id: "t1",
      agent: "interviewer" as const,
      objective: `Ask adaptive ${state.interviewType} questions on ${focus.join(", ")}.`,
      topics: focus,
      status: "pending" as const,
    },
    {
      id: "t2",
      agent:
        state.interviewType === "behavioural"
          ? ("behavioural_evaluator" as const)
          : state.interviewType === "coding"
            ? ("coding_reviewer" as const)
            : ("technical_evaluator" as const),
      objective: "Grade answers against an evidence-backed rubric.",
      topics: focus,
      status: "pending" as const,
    },
    {
      id: "t3",
      agent: "coach" as const,
      objective: "Synthesize a report and study plan from validated evaluations.",
      topics: focus,
      status: "pending" as const,
    },
  ];

  return interviewPlanSchema.parse({
    goal: `Run a ${state.experienceLevel} ${state.interviewType} interview on ${state.technology}.`,
    difficulty: state.difficulty,
    phases:
      state.interviewType === "mixed"
        ? ["intro", "technical", "coding", "close"]
        : ["intro", state.interviewType, "close"],
    tasks,
    weakTopics: focus,
  });
}

export async function createInterviewPlan(state: InterviewState): Promise<InterviewPlan> {
  const { invokeStructured } = await import("@/lib/agents/structured");
  const coverage = state.topicCoverage.map((item) => `${item.topic}:${item.score}`).join(", ");
  return invokeStructured(
    interviewPlanSchema,
    "interview_plan",
    `You are the interview planning manager.

REQUEST
Type: ${state.interviewType}
Technology: ${state.technology}
Topics: ${state.topics.join(", ") || state.technology}
Level: ${state.experienceLevel}
Difficulty: ${state.difficulty}
Company: ${state.targetCompany ?? "n/a"}
Instructions: ${state.customInstructions ?? "n/a"}
Coverage so far: ${coverage || "none"}

Create a focused plan with interviewer, evaluator, and coach tasks.
Prefer weak topics when coverage exists.
Return structured interview plan.`,
    () => createInterviewPlanMock(state)
  );
}
