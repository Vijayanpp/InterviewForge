"use client";

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import type { InterviewType, ExperienceLevel, DifficultyLevel, InterviewMode } from "@/types/domain/enums";

export interface WizardState {
  interviewType: InterviewType | null;
  /** Delivery mode for non-coding interviews. Coding type always forces coding mode. */
  mode: InterviewMode;
  technologyIds: string[];
  topicIds: string[];
  experienceLevel: ExperienceLevel | null;
  difficulty: DifficultyLevel | null;
  durationMinutes: number | null;
  targetCompany: string;
  customInstructions: string;
  resumeId: string | null;
  resumeFileName: string | null;
  resumeText: string;
  jobDescriptionId: string | null;
  jobDescriptionTitle: string;
  jobDescriptionContent: string;
}

export interface WizardStore extends WizardState {
  setField: <K extends keyof WizardState>(key: K, value: WizardState[K]) => void;
  reset: () => void;
}

const initialState: WizardState = {
  interviewType: null,
  mode: "text",
  technologyIds: [],
  topicIds: [],
  experienceLevel: null,
  difficulty: null,
  durationMinutes: null,
  targetCompany: "",
  customInstructions: "",
  resumeId: null,
  resumeFileName: null,
  resumeText: "",
  jobDescriptionId: null,
  jobDescriptionTitle: "",
  jobDescriptionContent: "",
};

export const useWizardStore = create<WizardStore>()(
  persist(
    (set) => ({
      ...initialState,
      setField: (key, value) => set({ [key]: value } as Partial<WizardState>),
      reset: () => set(initialState),
    }),
    {
      name: "interviewforge-wizard",
      storage: createJSONStorage(() => sessionStorage),
    }
  )
);
