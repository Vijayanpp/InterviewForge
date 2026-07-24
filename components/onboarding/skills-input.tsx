"use client";

import { useState, type KeyboardEvent } from "react";
import { X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";

interface SkillsInputProps {
  value: string[];
  onChange: (value: string[]) => void;
  placeholder?: string;
  max?: number;
}

export function SkillsInput({ value, onChange, placeholder, max = 20 }: SkillsInputProps) {
  const [draft, setDraft] = useState("");

  function commitDraft() {
    const skill = draft.trim();
    if (!skill || value.includes(skill) || value.length >= max) {
      setDraft("");
      return;
    }
    onChange([...value, skill]);
    setDraft("");
  }

  function handleKeyDown(event: KeyboardEvent<HTMLInputElement>) {
    if (event.key === "Enter" || event.key === ",") {
      event.preventDefault();
      commitDraft();
    } else if (event.key === "Backspace" && draft === "" && value.length > 0) {
      onChange(value.slice(0, -1));
    }
  }

  return (
    <div className="space-y-sm">
      <div className="flex flex-wrap gap-2 rounded-lg border border-input bg-background p-2 focus-within:ring-3 focus-within:ring-ring/50">
        {value.map((skill) => (
          <Badge key={skill} variant="secondary" className="gap-1">
            {skill}
            <button
              type="button"
              onClick={() => onChange(value.filter((s) => s !== skill))}
              aria-label={`Remove ${skill}`}
              className="rounded-full hover:bg-black/10"
            >
              <X className="h-3 w-3" />
            </button>
          </Badge>
        ))}
        <input
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={handleKeyDown}
          onBlur={commitDraft}
          placeholder={value.length === 0 ? placeholder : ""}
          className="min-w-[120px] flex-1 border-none bg-transparent text-sm outline-none placeholder:text-muted-foreground"
        />
      </div>
      <p className="text-xs text-muted-foreground">Press Enter or comma to add a skill.</p>
    </div>
  );
}
