"use client";

import Image from "next/image";
import Link from "next/link";
import {
  BarChart3,
  CheckCircle2,
  Circle,
  Cloud,
  Code2,
  MessageSquare,
  PlayCircle,
  SlidersHorizontal,
  Star,
  Terminal,
  Trophy,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { BRAND_TAGLINE_COMPACT } from "@/lib/brand";
import { FAQ_ITEMS } from "@/lib/seo";

/**
 * Marketing landing — stitch `landing_page/code.html` layout.
 * Images only from stitch landing assets under /images/landing/ (no app screenshots).
 * No pricing. No logo mark. Theme tokens for ThemePicker.
 */
export function LandingPageView() {
  return (
    <div className="bg-background text-foreground">
        {/* Hero — matches stitch HTML mock card + ai-avatar */}
        <section className="mx-auto mb-xl max-w-container-max px-lg pt-xl lg:px-xl lg:pt-2xl">
          <div className="grid items-center gap-xl lg:grid-cols-2">
            <div className="space-y-lg">
              <div className="inline-flex items-center rounded-full bg-muted px-md py-1">
                <span className="brand-gradient-text font-label-sm text-label-sm font-semibold uppercase tracking-[0.18em]">
                  {BRAND_TAGLINE_COMPACT}
                </span>
              </div>
              <h1 className="text-[2rem] leading-tight font-headline-xl tracking-tight sm:text-headline-xl lg:text-[64px] lg:leading-[72px]">
                Practise Today. Perform Better in Your{" "}
                <span className="brand-gradient-text">Real Interview.</span>
              </h1>
              <p className="max-w-xl font-body-lg text-body-lg text-muted-foreground">
                InterviewForge uses advanced AI to simulate high-pressure technical interviews. Get
                real-time feedback, personalized coaching, and master the world&apos;s most
                in-demand technologies.
              </p>
              <div className="flex flex-wrap gap-md">
                <Button
                  size="lg"
                  variant="gradient"
                  className="px-xl"
                  nativeButton={false}
                  render={<Link href="/register">Start Free Interview</Link>}
                />
                <Button
                  size="lg"
                  variant="outline"
                  nativeButton={false}
                  render={
                    <Link href="#how-it-works" className="inline-flex items-center gap-sm">
                      <PlayCircle className="h-5 w-5" />
                      How it works
                    </Link>
                  }
                />
              </div>
            </div>

            <div className="relative">
              <div className="absolute -inset-4 rounded-3xl bg-gradient-to-tr from-primary/10 to-primary/5 opacity-60 blur-2xl" />
              <div className="relative overflow-hidden rounded-2xl border border-border/60 bg-card/80 shadow-2xl backdrop-blur-md">
                <div className="flex items-center justify-between bg-sidebar px-lg py-md text-sidebar-foreground">
                  <div className="flex items-center gap-sm">
                    <div className="h-10 w-10 overflow-hidden rounded-full border-2 border-primary/40">
                      <Image
                        src="/images/landing/ai-avatar.jpg"
                        alt="Maya, the AI interviewer"
                        width={40}
                        height={40}
                        className="h-full w-full object-cover"
                        priority
                      />
                    </div>
                    <div>
                      <p className="font-label-md text-label-md">Maya (AI Lead)</p>
                      <p className="text-[10px] uppercase tracking-wider text-sidebar-foreground/60">
                        Simulated Interviewer
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-md">
                    <span className="rounded bg-white/10 px-sm py-1 font-mono text-sm">18:42</span>
                    <span className="rounded bg-destructive px-sm py-1 text-sm font-bold text-destructive-foreground">
                      End
                    </span>
                  </div>
                </div>
                <div className="border-b border-border p-lg">
                  <h3 className="mb-1 font-headline-md text-headline-md text-primary">
                    Technical Challenge
                  </h3>
                  <p className="font-body-md text-foreground">
                    What is the difference between{" "}
                    <code className="rounded bg-muted px-1">useMemo</code> and{" "}
                    <code className="rounded bg-muted px-1">useCallback</code> in React?
                  </p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-5">
                  <div className="relative bg-[#0d1117] p-md font-mono text-sm text-gray-300 md:col-span-3">
                    <div className="mb-sm flex items-center justify-between border-b border-white/10 pb-1">
                      <span className="text-xs uppercase tracking-tighter text-white/50">
                        Editor — solution.js
                      </span>
                    </div>
                    <pre className="overflow-x-auto whitespace-pre-wrap text-[12px] leading-5">
                      <code>
                        {`const memoizedValue = useMemo(() =>
  computeExpensiveValue(a, b), [a, b]);

const memoizedCallback = useCallback(() => {
  doSomething(a, b);
}, [a, b]);`}
                      </code>
                    </pre>
                    <div className="mt-md inline-block rounded border border-primary/40 bg-primary/20 px-sm py-1 text-[10px] text-primary-foreground/90">
                      AI is analyzing your response…
                    </div>
                  </div>
                  <div className="hidden border-l border-border bg-muted/40 p-md md:col-span-2 md:block">
                    <p className="mb-md font-label-sm text-label-sm uppercase text-muted-foreground">
                      Real-time Score
                    </p>
                    <div className="mx-auto flex h-28 w-28 flex-col items-center justify-center">
                      <p className="font-headline-md text-headline-md">90</p>
                      <p className="text-[10px] text-muted-foreground">Optimal</p>
                    </div>
                    <p className="text-center text-xs text-muted-foreground">
                      Great technical explanation. Focus more on re-rendering cycles next.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section id="technologies" className="border-y border-border bg-muted/50 py-xl">
          <div className="mx-auto max-w-container-max px-lg lg:px-xl">
            <p className="mb-lg text-center font-label-md text-label-md uppercase tracking-widest text-muted-foreground">
              Supported Technologies &amp; Frameworks
            </p>
            <div className="flex flex-wrap justify-center gap-xl text-muted-foreground">
              {[
                { icon: Code2, label: "JavaScript" },
                { icon: Terminal, label: "TypeScript" },
                { icon: Code2, label: "React" },
                { icon: Terminal, label: "Python" },
                { icon: BarChart3, label: "SQL" },
                { icon: Cloud, label: "AWS" },
              ].map((tech) => (
                <div key={tech.label} className="flex items-center gap-sm font-semibold">
                  <tech.icon className="h-5 w-5 text-primary" aria-hidden />
                  {tech.label}
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Bento — stitch structure; live-sim.jpg only product image from landing assets */}
        <section id="how-it-works" className="mx-auto max-w-container-max px-lg py-2xl lg:px-xl">
          <div className="mb-xl text-center">
            <h2 className="mb-md font-headline-lg text-headline-lg">
              Master the Art of the Interview
            </h2>
            <p className="mx-auto max-w-2xl font-body-md text-body-md text-muted-foreground">
              Our four-step process is designed to push your limits and turn nervous energy into
              interview confidence.
            </p>
          </div>

          <div id="features" className="grid grid-cols-1 gap-lg md:grid-cols-3 lg:min-h-[560px]">
            <div className="flex flex-col justify-between rounded-2xl border border-border bg-card/80 p-lg backdrop-blur-md transition-colors hover:border-primary/40 md:col-span-1">
              <div>
                <div className="mb-md flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
                  <SlidersHorizontal className="h-6 w-6 text-primary" />
                </div>
                <h3 className="mb-sm font-headline-md text-headline-md">Select Your Path</h3>
                <p className="font-body-sm text-body-sm text-muted-foreground">
                  Pick your role, experience level, and the specific technologies you want to be
                  tested on. Choose from Frontend, Backend, AI Engineer, and more.
                </p>
              </div>
              <div className="mt-lg space-y-sm">
                <div className="flex items-center gap-md rounded-lg border border-primary bg-background p-sm">
                  <CheckCircle2 className="h-5 w-5 text-primary" />
                  <span className="text-sm font-bold">Senior React Developer</span>
                </div>
                <div className="flex items-center gap-md rounded-lg border border-border bg-background p-sm opacity-50">
                  <Circle className="h-5 w-5" />
                  <span className="text-sm">Python Backend Lead</span>
                </div>
              </div>
            </div>

            <div className="group relative overflow-hidden rounded-2xl border border-border bg-card/80 p-lg backdrop-blur-md transition-colors hover:border-primary/40 md:col-span-2">
              <div className="relative z-10 max-w-md">
                <div className="mb-md flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
                  <MessageSquare className="h-6 w-6 text-primary" />
                </div>
                <h3 className="mb-sm font-headline-md text-headline-md">Live AI Simulation</h3>
                <p className="font-body-sm text-body-sm text-muted-foreground">
                  Experience a realistic conversation with Maya, our AI interviewer. It adapts in
                  real-time based on your answers, digging deeper into your weak spots.
                </p>
              </div>
              <div className="absolute bottom-[-40px] right-[-40px] h-2/3 w-2/3 rotate-[-5deg] overflow-hidden rounded-2xl border border-border bg-background shadow-xl transition-transform duration-500 group-hover:rotate-0">
                <Image
                  src="/images/landing/live-sim.jpg"
                  alt="Live AI interview simulation interface"
                  width={800}
                  height={600}
                  sizes="(max-width: 768px) 100vw, 50vw"
                  className="h-full w-full object-cover"
                />
              </div>
            </div>

            <div className="relative flex flex-col items-stretch gap-md rounded-2xl border border-border bg-card/80 p-lg backdrop-blur-md transition-colors hover:border-primary/40 sm:flex-row sm:items-center md:col-span-2">
              <div className="sm:w-1/2 sm:pr-md">
                <div className="mb-md flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
                  <BarChart3 className="h-6 w-6 text-primary" />
                </div>
                <h3 className="mb-sm font-headline-md text-headline-md">Granular Feedback</h3>
                <p className="font-body-sm text-body-sm text-muted-foreground">
                  Don&apos;t just get a score. Get a line-by-line breakdown of how you could improve
                  your logic, code efficiency, and communication style.
                </p>
              </div>
              <div className="flex justify-end sm:w-1/2">
                <div className="w-full max-w-[200px] space-y-sm">
                  <div className="h-2 overflow-hidden rounded-full bg-muted">
                    <div className="h-full w-[85%] bg-primary" />
                  </div>
                  <div className="h-2 overflow-hidden rounded-full bg-muted">
                    <div className="h-full w-[70%] bg-primary/70" />
                  </div>
                  <div className="h-2 overflow-hidden rounded-full bg-muted">
                    <div className="h-full w-[95%] bg-emerald-600" />
                  </div>
                </div>
              </div>
            </div>

            <div className="flex flex-col items-center justify-center rounded-2xl border border-border bg-card/80 p-lg text-center backdrop-blur-md transition-colors hover:border-primary/40 md:col-span-1">
              <div className="mb-md flex h-16 w-16 items-center justify-center rounded-2xl bg-sidebar text-sidebar-foreground">
                <Trophy className="h-8 w-8" />
              </div>
              <h3 className="mb-sm font-headline-md text-headline-md">Ready to Hire</h3>
              <p className="font-body-sm text-body-sm text-muted-foreground">
                Export your interview performance report to share with recruiters or use it to
                target your learning. Confidence, data-backed.
              </p>
            </div>
          </div>
        </section>

        <section className="bg-primary py-2xl text-primary-foreground">
          <div className="mx-auto max-w-container-max px-lg lg:px-xl">
            <div className="mb-xl text-center">
              <h2 className="mb-sm font-headline-lg text-headline-lg text-primary-foreground">
                Joined by 10,000+ Engineers
              </h2>
              <p className="text-primary-foreground/80">
                From startups to FAANG, our users land their dream jobs.
              </p>
            </div>
            <div className="grid gap-lg md:grid-cols-3">
              {[
                {
                  quote:
                    "I was terrified of live coding. After 5 sessions on InterviewForge, the actual Meta interview felt like a breeze. I had seen all the variations Maya threw at me.",
                  name: "Sarah Jenkins",
                  role: "Software Engineer at Meta",
                  img: "/images/landing/testimonial-1.jpg",
                },
                {
                  quote:
                    "The adaptive nature of the AI is spooky. It found exactly where my knowledge of Node.js event loops ended and pushed me to explain better.",
                  name: "David Chen",
                  role: "Senior Dev at Stripe",
                  img: "/images/landing/testimonial-2.jpg",
                },
                {
                  quote:
                    "The system design mock interviews are incredibly detailed. The AI's ability to evaluate distributed systems logic is impressive.",
                  name: "Marcus Thorne",
                  role: "Tech Lead at Vercel",
                  img: "/images/landing/testimonial-3.jpg",
                },
              ].map((t) => (
                <div
                  key={t.name}
                  className="rounded-2xl border border-primary-foreground/15 bg-primary-foreground/10 p-lg backdrop-blur-md"
                >
                  <div className="mb-md flex gap-1">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star key={i} className="h-4 w-4 fill-current text-amber-300" />
                    ))}
                  </div>
                  <p className="mb-lg font-body-md text-primary-foreground">&ldquo;{t.quote}&rdquo;</p>
                  <div className="flex items-center gap-md">
                    <Image
                      src={t.img}
                      alt=""
                      width={40}
                      height={40}
                      className="h-10 w-10 rounded-full object-cover"
                    />
                    <div>
                      <p className="font-label-md text-label-md text-primary-foreground">{t.name}</p>
                      <p className="text-xs text-primary-foreground/70">{t.role}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section id="faq" className="mx-auto max-w-container-max px-lg pb-2xl lg:px-xl" aria-labelledby="faq-heading">
          <h2 id="faq-heading" className="mb-lg text-center font-headline-lg text-headline-lg">
            Frequently asked questions
          </h2>
          <div className="mx-auto max-w-3xl space-y-sm">
            {FAQ_ITEMS.map((item) => (
              <details
                key={item.question}
                className="rounded-xl border border-border bg-card px-md py-sm"
              >
                <summary className="cursor-pointer font-headline-md text-headline-md">
                  {item.question}
                </summary>
                <p className="mt-sm pb-sm font-body-md text-body-md text-muted-foreground">
                  {item.answer}
                </p>
              </details>
            ))}
          </div>
        </section>

        <section className="mx-auto max-w-container-max px-lg py-2xl lg:px-xl">
          <div className="relative flex flex-col items-center justify-between gap-lg overflow-hidden rounded-3xl bg-sidebar p-lg text-sidebar-foreground sm:p-xl lg:flex-row lg:gap-xl">
            <div className="relative z-10 text-center lg:text-left">
              <h2 className="mb-md font-headline-lg text-headline-lg text-white">
                Ready to forge your future?
              </h2>
              <p className="max-w-lg font-body-md text-body-md text-sidebar-foreground/70">
                Don&apos;t wait for the real interview to find out where you&apos;re failing. Start
                practicing with Maya today.
              </p>
            </div>
            <div className="relative z-10 w-full sm:w-auto">
              <Button
                size="lg"
                variant="gradient"
                className="w-full sm:w-auto"
                nativeButton={false}
                render={<Link href="/register">Start Your First Interview</Link>}
              />
            </div>
          </div>
        </section>
    </div>
  );
}
