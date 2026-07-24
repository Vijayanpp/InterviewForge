import type { Metadata } from "next";
import { LandingPageView } from "@/components/marketing/landing-page-view";

export const metadata: Metadata = {
  title: "InterviewForge — Practice. Prepare. Perform. Succeed.",
};

export default function LandingPage() {
  return <LandingPageView />;
}
