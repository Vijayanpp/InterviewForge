import { getAiProvider } from "@/lib/ai";
import { formatEvidence } from "@/lib/retrieval/pipeline";
import type { InterviewState } from "@/lib/graph/state";
import type { GeneratedQuestion } from "@/lib/ai/schemas";

export async function generateInterviewQuestion(
  state: InterviewState,
  mode: "next" | "follow_up"
): Promise<GeneratedQuestion> {
  const provider = getAiProvider();
  const evidence = formatEvidence(state.retrievedEvidence);
  const custom = [state.customInstructions, evidence !== "(no retrieved evidence)" ? `Retrieved evidence:\n${evidence}` : null]
    .filter(Boolean)
    .join("\n\n");

  const params = {
    interviewType: state.interviewType,
    technology: state.technology,
    topics: state.interviewPlan?.weakTopics?.length ? state.interviewPlan.weakTopics : state.topics,
    experienceLevel: state.experienceLevel,
    difficulty: state.difficulty,
    previousQuestions: state.previousQuestions,
    topicCoverage: state.topicCoverage,
    remainingMinutes: state.remainingMinutes,
    targetCompany: state.targetCompany,
    customInstructions: custom || state.customInstructions,
    resumeText: state.resumeText,
    jobDescriptionText: state.jobDescriptionText,
    candidateName: state.candidateName,
    skipOpening: state.skipOpening,
  };

  if (mode === "follow_up") {
    const generated = await provider.generateFollowUp({
      ...params,
      lastQuestionBody: state.lastQuestionBody ?? state.previousQuestions.at(-1) ?? "",
      lastCandidateAnswer: state.lastCandidateAnswer ?? "",
      lastEvaluationSummary:
        state.supervisorDecision?.followUpHint ?? state.lastEvaluationSummary ?? "",
    });
    if (!generated.title.startsWith("Follow-up:")) {
      return { ...generated, title: `Follow-up: ${generated.title}` };
    }
    return generated;
  }

  return provider.generateQuestion(params);
}
