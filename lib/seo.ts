import { BRAND_NAME, BRAND_TAGLINE } from "@/lib/brand";

export const SITE_NAME = BRAND_NAME;
export const SITE_TAGLINE = BRAND_TAGLINE;
export const SITE_DESCRIPTION =
  "InterviewForge is an AI-powered technical interview and coding assessment platform. Practise with Maya, get honest feedback, and walk into the real interview prepared.";
export const SITE_KEYWORDS = [
  "AI interview practice",
  "technical interview simulator",
  "mock coding interview",
  "voice interview AI",
  "JavaScript interview questions",
  "system design practice",
  "coding assessment platform",
];

export function getSiteUrl(): string {
  return (process.env.APP_URL ?? "http://localhost:3100").replace(/\/$/, "");
}

export function absoluteUrl(path = "/"): string {
  const normalized = path.startsWith("/") ? path : `/${path}`;
  return new URL(normalized, `${getSiteUrl()}/`).toString();
}

export const noIndexRobots = {
  index: false,
  follow: false,
  nocache: true,
  googleBot: {
    index: false,
    follow: false,
    noimageindex: true,
  },
} as const;

export const PUBLIC_INDEXABLE_PATHS = [
  { path: "/", changeFrequency: "weekly" as const, priority: 1 },
  { path: "/about", changeFrequency: "monthly" as const, priority: 0.8 },
  { path: "/contact", changeFrequency: "monthly" as const, priority: 0.6 },
  { path: "/privacy", changeFrequency: "yearly" as const, priority: 0.4 },
  { path: "/terms", changeFrequency: "yearly" as const, priority: 0.4 },
  { path: "/register", changeFrequency: "monthly" as const, priority: 0.7 },
  { path: "/login", changeFrequency: "monthly" as const, priority: 0.5 },
];

export const FAQ_ITEMS = [
  {
    question: "What is InterviewForge?",
    answer:
      "InterviewForge is an AI interview platform that runs realistic technical, behavioural, voice, and coding interviews, then produces a scored report with strengths, gaps, and a study plan.",
  },
  {
    question: "Is InterviewForge free to start?",
    answer:
      "Yes. Create an account and start a practice interview without a paid plan. Recruiter assessments and proctored invites are available after you set up an organization.",
  },
  {
    question: "Does the voice interviewer keep the microphone on?",
    answer:
      "After Maya finishes speaking, listening stays on until you pause, tap the mic, finish your answer, or hit the maximum answer time. Silence does not cut you off.",
  },
  {
    question: "Are proctored assessments recorded?",
    answer:
      "Invited recruiter assessments can require webcam, screen share, and fullscreen. Events such as tab switches are logged, and recordings are stored only for that assessment’s integrity review.",
  },
];

export function buildOrganizationJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: SITE_NAME,
    url: getSiteUrl(),
    description: SITE_DESCRIPTION,
    slogan: SITE_TAGLINE,
  };
}

export function buildWebsiteJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: SITE_NAME,
    url: getSiteUrl(),
    description: SITE_DESCRIPTION,
    publisher: { "@type": "Organization", name: SITE_NAME },
  };
}

export function buildSoftwareApplicationJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: SITE_NAME,
    applicationCategory: "EducationalApplication",
    operatingSystem: "Web",
    description: SITE_DESCRIPTION,
    url: getSiteUrl(),
    offers: {
      "@type": "Offer",
      price: "0",
      priceCurrency: "USD",
    },
  };
}

export function buildFaqJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: FAQ_ITEMS.map((item) => ({
      "@type": "Question",
      name: item.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: item.answer,
      },
    })),
  };
}
