import Link from "next/link";
import type { Metadata } from "next";
import {
  ArrowRight,
  Brain,
  ClipboardCheck,
  Gauge,
  LineChart,
  MessageSquareText,
  Target,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { BrandLogo, BrandTagline } from "@/components/brand/brand-logo";
import { BRAND_TAGLINE } from "@/lib/brand";

export const metadata: Metadata = {
  title: "InterviewForge — Practice. Prepare. Perform. Succeed.",
};

const TECHNOLOGIES = [
  "JavaScript",
  "TypeScript",
  "React",
  "Angular",
  "Vue.js",
  "Next.js",
  "Node.js",
  "Python",
  "Java",
  "C#",
  "C++",
  "PHP",
  "SQL",
  "System Design",
  "DevOps & Cloud",
];

const FEATURES = [
  {
    icon: Brain,
    title: "Adaptive AI Interviewer",
    description:
      "Questions adjust to your experience level and answers in real time — no scripted flows, no repeated questions.",
  },
  {
    icon: MessageSquareText,
    title: "Honest, Rubric-Based Feedback",
    description:
      "Every answer is scored across technical accuracy, depth, clarity and problem-solving — never just praise.",
  },
  {
    icon: ClipboardCheck,
    title: "Full Interview Reports",
    description:
      "Overall score, hire recommendation, topic breakdown, and a 7-day and 30-day improvement plan after every session.",
  },
  {
    icon: LineChart,
    title: "Progress Tracking",
    description:
      "See your strongest and weakest topics, score trends, and readiness for your target role over time.",
  },
  {
    icon: Target,
    title: "21 Technology Tracks",
    description:
      "From JavaScript fundamentals to system design, DevOps, cloud and behavioural rounds — all extensible by admins.",
  },
  {
    icon: Gauge,
    title: "Coding & Voice Interviews",
    description: "Live coding challenges and voice-based interviews are on our roadmap.",
    comingSoon: true,
  },
];

export default function LandingPage() {
  return (
    <>
      <section className="relative mx-auto max-w-container-max overflow-hidden px-lg py-xl lg:px-xl lg:py-2xl">
        <div
          className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_top_right,color-mix(in_oklab,var(--primary)_18%,transparent),transparent_55%)]"
          aria-hidden
        />
        <div className="grid gap-xl lg:grid-cols-2 lg:items-center">
          <div className="space-y-lg">
            <Badge variant="secondary" className="gap-2 rounded-full px-md py-1">
              {BRAND_TAGLINE}
            </Badge>
            <h1 className="font-headline-xl text-headline-xl tracking-tight lg:text-[56px] lg:leading-[64px]">
              Practise today. Perform better in your{" "}
              <span className="bg-gradient-to-r from-[#e63900] to-[#ffb800] bg-clip-text text-transparent">
                real interview.
              </span>
            </h1>
            <p className="max-w-xl font-body-lg text-body-lg text-muted-foreground">
              InterviewForge simulates realistic technical interviews with an AI that asks
              follow-ups, adapts difficulty, and gives you feedback that&apos;s actually useful —
              not just encouragement.
            </p>
            <div className="flex flex-wrap gap-md">
              <Button
                size="lg"
                nativeButton={false}
                render={
                  <Link href="/register">
                    Start Free Interview <ArrowRight className="h-4 w-4" />
                  </Link>
                }
              />
              <Button
                size="lg"
                variant="outline"
                nativeButton={false}
                render={<Link href="/login">Log in</Link>}
              />
            </div>
          </div>

          <div className="flex flex-col items-center gap-lg">
            <BrandLogo variant="full" href={null} priority className="items-center" />
            <Card className="w-full overflow-hidden border-border/60 p-0 shadow-2xl">
              <div className="flex items-center justify-between bg-sidebar px-lg py-md text-sidebar-foreground">
                <div>
                  <p className="font-label-md text-label-md">Senior React Engineer</p>
                  <p className="text-[11px] uppercase tracking-wider text-sidebar-foreground/60">
                    Adaptive · Text Interview
                  </p>
                </div>
                <BrandTagline compact className="hidden text-sidebar-ring sm:block" />
              </div>
              <div className="space-y-sm border-b border-border p-lg">
                <p className="font-headline-md text-headline-md text-primary">Follow-up question</p>
                <p className="font-body-md text-foreground">
                  &quot;What exact problem did you face optimizing that render path, what approach
                  did you take, and how did you measure the outcome?&quot;
                </p>
              </div>
              <div className="grid gap-4 p-lg text-sm text-muted-foreground">
                <p>
                  The AI never reveals scores mid-interview and never repeats a question — it keeps
                  track of topic coverage and remaining time for you.
                </p>
              </div>
            </Card>
          </div>
        </div>
      </section>

      <section id="technologies" className="border-y border-border bg-muted/40 py-xl">
        <div className="mx-auto max-w-container-max px-lg lg:px-xl">
          <p className="mb-lg text-center font-label-md text-label-md uppercase tracking-widest text-muted-foreground">
            Practise across every technology that matters
          </p>
          <div className="flex flex-wrap justify-center gap-lg">
            {TECHNOLOGIES.map((tech) => (
              <span key={tech} className="font-body-sm font-semibold text-muted-foreground">
                {tech}
              </span>
            ))}
            <span className="font-body-sm font-semibold text-primary">+ more, added by admins</span>
          </div>
        </div>
      </section>

      <section id="features" className="mx-auto max-w-container-max px-lg py-2xl lg:px-xl">
        <div className="mx-auto mb-xl max-w-2xl text-center">
          <h2 className="font-headline-lg text-headline-lg">
            Everything you need to walk in prepared
          </h2>
          <p className="mt-sm font-body-md text-body-md text-muted-foreground">
            Built for candidates who want a fair, challenging, and genuinely useful practice
            experience.
          </p>
        </div>

        <div className="grid gap-lg md:grid-cols-2 lg:grid-cols-3">
          {FEATURES.map((feature) => (
            <Card key={feature.title} className="gap-sm p-lg">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
                <feature.icon className="h-6 w-6 text-primary" />
              </div>
              <div className="flex items-center gap-2">
                <h3 className="font-headline-md text-headline-md">{feature.title}</h3>
                {feature.comingSoon && (
                  <Badge variant="outline" className="text-[10px]">
                    Coming soon
                  </Badge>
                )}
              </div>
              <p className="font-body-sm text-body-sm text-muted-foreground">
                {feature.description}
              </p>
            </Card>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-container-max px-lg py-2xl lg:px-xl">
        <Card className="flex flex-col items-center gap-md bg-sidebar p-2xl text-center text-sidebar-foreground">
          <BrandTagline className="text-sidebar-ring" />
          <h2 className="font-headline-lg text-headline-lg text-white">
            Ready to see where you really stand?
          </h2>
          <p className="max-w-xl font-body-md text-body-md text-sidebar-foreground/70">
            Your first interview is free — no credit card required.
          </p>
          <Button
            size="lg"
            nativeButton={false}
            render={
              <Link href="/register">
                Start Free Interview <ArrowRight className="h-4 w-4" />
              </Link>
            }
          />
        </Card>
      </section>
    </>
  );
}
