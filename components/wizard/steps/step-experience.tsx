"use client";

import { Sprout, User, Users, Award, Crown, Building2 } from "lucide-react";
import type { ExperienceLevel } from "@/types/domain/enums";
import { useWizardStore } from "@/lib/store/wizard-store";
import { SelectionCard } from "@/components/wizard/selection-card";

const LEVELS: Array<{ value: ExperienceLevel; icon: typeof Sprout; title: string; description: string }> = [
  { value: "fresher", icon: Sprout, title: "Fresher", description: "0-1 years — new to the industry." },
  { value: "junior", icon: User, title: "Junior", description: "1-3 years of hands-on experience." },
  { value: "mid", icon: Users, title: "Mid-level", description: "3-5 years, comfortable owning features." },
  { value: "senior", icon: Award, title: "Senior", description: "5-8 years, mentors and leads design." },
  { value: "lead", icon: Crown, title: "Lead", description: "8+ years, leads teams and initiatives." },
  { value: "architect", icon: Building2, title: "Architect", description: "Deep system-wide technical ownership." },
];

export function StepExperience() {
  const experienceLevel = useWizardStore((s) => s.experienceLevel);
  const setField = useWizardStore((s) => s.setField);

  return (
    <div className="grid grid-cols-1 gap-md md:grid-cols-2 lg:grid-cols-3">
      {LEVELS.map((level) => (
        <SelectionCard
          key={level.value}
          icon={level.icon}
          title={level.title}
          description={level.description}
          isSelected={experienceLevel === level.value}
          onSelect={() => setField("experienceLevel", level.value)}
        />
      ))}
    </div>
  );
}
