import { Lightbulb } from "lucide-react";

export function TopicRail({
  technologyNames,
  topicNames,
  questionsAsked,
}: {
  technologyNames: string[];
  topicNames: string[];
  questionsAsked: number;
}) {
  return (
    <aside className="hidden h-full w-[280px] flex-col border-r border-white/10 bg-sidebar-gradient p-lg lg:flex">
      <div className="mb-xl">
        <h3 className="mb-lg font-label-md text-label-md uppercase tracking-wider text-sidebar-primary">
          Session Focus
        </h3>
        <div className="space-y-md">
          <div>
            <p className="mb-sm text-[11px] uppercase tracking-wide text-sidebar-foreground/50">
              Technologies
            </p>
            <div className="flex flex-wrap gap-1.5">
              {technologyNames.map((name) => (
                <span
                  key={name}
                  className="rounded-full bg-white/10 px-3 py-1 text-xs font-medium text-sidebar-foreground"
                >
                  {name}
                </span>
              ))}
            </div>
          </div>
          {topicNames.length > 0 && (
            <div>
              <p className="mb-sm text-[11px] uppercase tracking-wide text-sidebar-foreground/50">Topics</p>
              <div className="flex flex-wrap gap-1.5">
                {topicNames.map((name) => (
                  <span
                    key={name}
                    className="rounded-full bg-white/5 px-3 py-1 text-xs text-sidebar-foreground/80"
                  >
                    {name}
                  </span>
                ))}
              </div>
            </div>
          )}
          <div className="rounded-lg bg-white/5 px-md py-3">
            <p className="text-[11px] uppercase tracking-wide text-sidebar-foreground/50">Progress</p>
            <p className="font-label-md text-label-md text-sidebar-foreground">
              Question {questionsAsked}
            </p>
          </div>
        </div>
      </div>

      <div className="mt-auto rounded-xl border border-white/10 bg-white/5 p-md">
        <div className="mb-2 flex items-center gap-sm">
          <Lightbulb className="h-4 w-4 text-sidebar-primary" />
          <span className="font-label-md text-[11px] uppercase text-sidebar-foreground">Reminder</span>
        </div>
        <p className="text-[13px] leading-relaxed text-sidebar-foreground/70">
          Answer as if you were speaking to a real interviewer — be specific and back up claims with
          examples.
        </p>
      </div>
    </aside>
  );
}
