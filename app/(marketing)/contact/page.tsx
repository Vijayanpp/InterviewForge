import type { Metadata } from "next";
import Link from "next/link";
import { MarketingArticle } from "@/components/marketing/marketing-article";
import { SITE_NAME } from "@/lib/seo";

export const metadata: Metadata = {
  title: "Contact",
  description: `Start a practice interview or reach ${SITE_NAME} for product questions and support.`,
};

export default function ContactPage() {
  return (
    <MarketingArticle
      title="Contact"
      description="The fastest way to try InterviewForge is to start a free interview. Use the links below for support."
    >
      <p>
        <Link href="/register" className="font-semibold text-primary underline-offset-4 hover:underline">
          Create an account
        </Link>{" "}
        to begin a mock interview, or{" "}
        <Link href="/login" className="font-semibold text-primary underline-offset-4 hover:underline">
          log in
        </Link>{" "}
        if you already have one.
      </p>
      <h2 className="font-headline-md text-headline-md">Support</h2>
      <p>
        For product questions, account help, or to support the project, use{" "}
        <a
          href="https://rzp.io/rzp/FnEvT7Ff"
          target="_blank"
          rel="noopener noreferrer"
          className="font-semibold text-primary underline-offset-4 hover:underline"
        >
          Support / Donate
        </a>
        .
      </p>
      <p className="text-muted-foreground">
        Invited assessments are sent by a recruiter. If you received an invite email, open the
        unique link in that message — it is not listed on this site.
      </p>
    </MarketingArticle>
  );
}
