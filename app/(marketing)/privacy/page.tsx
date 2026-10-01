import type { Metadata } from "next";
import { MarketingArticle } from "@/components/marketing/marketing-article";
import { SITE_NAME } from "@/lib/seo";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description: `How ${SITE_NAME} collects, uses, and stores account, interview, and proctoring data.`,
};

export default function PrivacyPage() {
  return (
    <MarketingArticle
      title="Privacy Policy"
      description="This describes how InterviewForge handles personal data in the product. It is not legal advice."
    >
      <h2 className="font-headline-md text-headline-md">What we collect</h2>
      <ul className="list-disc space-y-sm pl-lg">
        <li>Account details such as name, email, and optional profile photo</li>
        <li>Interview answers, transcripts, scores, and generated reports</li>
        <li>For invited assessments: proctoring events and optional webcam or screen recordings</li>
        <li>Technical logs needed to run the app (session cookies, error diagnostics)</li>
      </ul>
      <h2 className="font-headline-md text-headline-md">How it is used</h2>
      <p>
        Interview content is used to run the session and produce your report. When an AI provider is
        configured, answers may be sent to that provider solely to generate questions, grades, speech,
        or transcripts. Proctoring data is used for assessment integrity, not for advertising.
      </p>
      <h2 className="font-headline-md text-headline-md">Cookies</h2>
      <p>
        We use essential cookies to keep you signed in. We do not use third-party advertising cookies.
      </p>
      <h2 className="font-headline-md text-headline-md">Retention</h2>
      <p>
        Account and interview history remain until you or an administrator delete them. Assessment
        recordings follow the inviting organization’s retention needs.
      </p>
    </MarketingArticle>
  );
}
