import type { Metadata } from "next";
import { MarketingArticle } from "@/components/marketing/marketing-article";
import { SITE_NAME } from "@/lib/seo";

export const metadata: Metadata = {
  title: "About",
  description: `Learn how ${SITE_NAME} runs AI technical, voice, and coding interviews with scored feedback for candidates and recruiters.`,
};

export default function AboutPage() {
  return (
    <MarketingArticle
      title={`About ${SITE_NAME}`}
      description="An AI interview gym for engineers — and an assessment room for hiring teams."
    >
      <p>
        {SITE_NAME} simulates high-pressure technical interviews so you can practise before it
        counts. Maya, the interviewer, asks follow-ups, probes gaps, and never leaks a score mid
        session.
      </p>
      <h2 className="font-headline-md text-headline-md">What you can practise</h2>
      <ul className="list-disc space-y-sm pl-lg">
        <li>Text interviews across technical and behavioural tracks</li>
        <li>Voice interviews with spoken questions and a live transcript</li>
        <li>Coding rounds in the browser with run/submit feedback</li>
        <li>Recruiter-invited assessments with optional proctoring</li>
      </ul>
      <h2 className="font-headline-md text-headline-md">After the session</h2>
      <p>
        You get a report with scores, strengths, gaps, and a study plan. Recruiters see integrity
        signals on invited assessments without exposing raw model prompts to the candidate.
      </p>
    </MarketingArticle>
  );
}
