"use client";

import { Feather, Flame, Skull, Shuffle } from "lucide-react";
import type { DifficultyLevel } from "@/types/domain/enums";
import { useWizardStore } from "@/lib/store/wizard-store";
import { SelectionCard } from "@/components/wizard/selection-card";

const LEVELS: Array<{ value: DifficultyLevel; icon: typeof Feather; title: string; description: string }> = [
  { value: "easy", icon: Feather, title: "Easy", description: "Foundational questions, gentle pacing." },
  { value: "medium", icon: Flame, title: "Medium", description: "Standard interview-bar difficulty." },
  { value: "hard", icon: Skull, title: "Hard", description: "Challenging, in-depth, senior-bar questions." },
  {
    value: "adaptive",
    icon: Shuffle,
    title: "Adaptive",
    description: "AI adjusts difficulty live based on your answers.",
  },
];

export function StepDifficulty() {
  const difficulty = useWizardStore((s) => s.difficulty);
  const setField = useWizardStore((s) => s.setField);

  return (
    <div className="grid grid-cols-1 gap-md sm:grid-cols-2">
      {LEVELS.map((level) => (
        <SelectionCard
          key={level.value}
          icon={level.icon}
          title={level.title}
          description={level.description}
          isSelected={difficulty === level.value}
          onSelect={() => setField("difficulty", level.value)}
        />
      ))}
    </div>
  );
}
