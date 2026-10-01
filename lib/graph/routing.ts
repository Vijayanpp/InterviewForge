import type { InterviewState } from "@/lib/graph/state";

export function routeStart(
  state: InterviewState
): "planner" | "opening_guard" | "retrieve" | "synthesizer" {
  if (state.turnMode === "prep") return "planner";
  if (state.turnMode === "ask") return "opening_guard";
  if (state.turnMode === "close") return "synthesizer";
  return "retrieve";
}

export function routeAfterOpening(state: InterviewState): "retrieve" | "interviewer" {
  if (state.generatedQuestion) return "interviewer";
  return "retrieve";
}

export function routeAfterSupervisor(
  state: InterviewState
): "retrieve" | "interviewer" | "__end__" {
  const decision = state.supervisorDecision?.decision;
  if (decision === "research_more") return "retrieve";
  if (decision === "follow_up" || decision === "next_question") return "interviewer";
  return "__end__";
}

export function routeAskOrGrade(
  state: InterviewState
): "interviewer" | "evaluator" | "__end__" {
  if (state.turnMode === "prep") return "__end__";
  if (state.supervisorDecision?.decision === "research_more") return "interviewer";
  if (state.turnMode === "ask") return "interviewer";
  return "evaluator";
}
