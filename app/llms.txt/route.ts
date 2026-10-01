import { NextResponse } from "next/server";
import { FAQ_ITEMS, SITE_DESCRIPTION, SITE_NAME, SITE_TAGLINE, absoluteUrl } from "@/lib/seo";

export function GET() {
  const body = `# ${SITE_NAME}

> ${SITE_TAGLINE}

${SITE_DESCRIPTION}

## Product
- Voice, text, and coding mock interviews with an adaptive AI interviewer (Maya)
- Recruiter assessments with optional webcam / screen / fullscreen proctoring
- Post-interview reports: scores, strengths, gaps, and a study plan

## Public pages
- Home: ${absoluteUrl("/")}
- About: ${absoluteUrl("/about")}
- Contact: ${absoluteUrl("/contact")}
- Privacy: ${absoluteUrl("/privacy")}
- Terms: ${absoluteUrl("/terms")}
- Register: ${absoluteUrl("/register")}
- Login: ${absoluteUrl("/login")}

## FAQ
${FAQ_ITEMS.map((item) => `### ${item.question}\n${item.answer}`).join("\n\n")}

## Notes for crawlers
Private app surfaces (/dashboard, /interviews, /admin, /recruiter, /api) are authenticated and should not be indexed.
`;

  return new NextResponse(body, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "public, max-age=3600",
    },
  });
}
