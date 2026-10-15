"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Sparkles, Play } from "lucide-react";
import { toast } from "sonner";
import ReactMarkdown from "react-markdown";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  CODING_LANGUAGES,
  CODING_LANGUAGE_LABELS,
  type CodingLanguage,
} from "@/lib/code-execution/languages";
import { DIFFICULTY_LEVEL_LABELS } from "@/types/domain/enums";
import type { CandidateFacingChallenge } from "@/types/domain/coding";

export function AiChallengeGenerator() {
  const router = useRouter();
  const [difficulty, setDifficulty] = useState<"easy" | "medium" | "hard">("medium");
  const [languages, setLanguages] = useState<CodingLanguage[]>(["javascript"]);
  const [topicHint, setTopicHint] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [preview, setPreview] = useState<CandidateFacingChallenge | null>(null);
  const [selectedLanguage, setSelectedLanguage] = useState<CodingLanguage>("javascript");

  const availableLanguages = useMemo(() => {
    // Prefer the languages the user selected for this generation.
    if (languages.length > 0) return languages;
    if (!preview) return ["javascript" as CodingLanguage];
    return preview.supportedLanguages.filter((l): l is CodingLanguage =>
      (CODING_LANGUAGES as readonly string[]).includes(l)
    );
  }, [preview, languages]);

  function toggleLanguage(lang: CodingLanguage) {
    setLanguages((prev) => {
      if (prev.includes(lang)) {
        const next = prev.filter((l) => l !== lang);
        return next.length > 0 ? next : prev;
      }
      return [...prev, lang];
    });
  }

  async function handleGenerate() {
    setIsGenerating(true);
    setPreview(null);
    try {
      const res = await fetch("/api/coding/practice/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          difficulty,
          languages,
          topicHint: topicHint.trim() || undefined,
        }),
      });
      const body = await res.json().catch(() => null);
      if (!res.ok) {
        throw new Error(body?.error?.message ?? "Could not generate a challenge.");
      }
      const challenge = body.challenge as CandidateFacingChallenge;
      setPreview(challenge);
      // Keep "Solve in" options = what the user selected (server now persists all of them).
      const fromChallenge = challenge.supportedLanguages.filter((l): l is CodingLanguage =>
        (CODING_LANGUAGES as readonly string[]).includes(l)
      );
      const solveLanguages = fromChallenge.length > 0 ? fromChallenge : languages;
      setSelectedLanguage(solveLanguages[0] ?? "javascript");
      toast.success("Challenge ready — pick a language and start.");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Generation failed.");
    } finally {
      setIsGenerating(false);
    }
  }

  function handleAccept() {
    if (!preview) return;
    router.push(`/practice/${preview.id}?lang=${selectedLanguage}`);
  }

  return (
    <Card className="space-y-md border-primary/20 bg-primary/5 p-lg">
      <div className="flex items-start gap-sm">
        <Sparkles className="mt-0.5 h-5 w-5 text-primary" />
        <div>
          <h2 className="font-headline-md text-base font-semibold text-foreground">
            AI-generated challenge
          </h2>
          <p className="text-body-sm text-muted-foreground">
            Get a fresh coding problem from the AI interviewer. Choose languages, generate, then
            accept to open the editor.
          </p>
        </div>
      </div>

      <div className="grid gap-md md:grid-cols-2">
        <div className="space-y-1">
          <label className="text-sm font-medium">Difficulty</label>
          <Select
            value={difficulty}
            onValueChange={(v) => setDifficulty((v as "easy" | "medium" | "hard") ?? "medium")}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="easy">{DIFFICULTY_LEVEL_LABELS.easy}</SelectItem>
              <SelectItem value="medium">{DIFFICULTY_LEVEL_LABELS.medium}</SelectItem>
              <SelectItem value="hard">{DIFFICULTY_LEVEL_LABELS.hard}</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-1">
          <label className="text-sm font-medium">Topic hint (optional)</label>
          <Input
            value={topicHint}
            onChange={(e) => setTopicHint(e.target.value)}
            placeholder="e.g. arrays, strings, graphs"
          />
        </div>
      </div>

      <div>
        <div className="mb-sm flex flex-wrap items-center justify-between gap-sm">
          <label className="text-sm font-medium">Languages you want to use</label>
          <div className="flex gap-2">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => setLanguages([...CODING_LANGUAGES])}
            >
              Select all
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => setLanguages(["javascript"])}
            >
              Reset
            </Button>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-x-md gap-y-sm sm:grid-cols-3 lg:grid-cols-4">
          {CODING_LANGUAGES.map((lang) => (
            <label key={lang} className="flex items-center gap-2 text-sm">
              <Checkbox
                checked={languages.includes(lang)}
                onCheckedChange={() => toggleLanguage(lang)}
              />
              {CODING_LANGUAGE_LABELS[lang]}
            </label>
          ))}
        </div>
        <p className="mt-sm text-xs text-muted-foreground">
          {languages.length} selected · starters will be generated for each selected language
        </p>
      </div>

      <Button className="w-full sm:w-auto" onClick={handleGenerate} disabled={isGenerating || languages.length === 0}>
        {isGenerating ? (
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
        ) : (
          <Sparkles className="mr-2 h-4 w-4" />
        )}
        {isGenerating ? "Generating…" : "Generate challenge"}
      </Button>

      {preview && (
        <div className="space-y-md rounded-lg border border-border bg-background p-md">
          <div className="flex flex-wrap items-center gap-sm">
            <h3 className="font-headline-md text-base font-semibold">{preview.title}</h3>
            <Badge variant="outline" className="capitalize">
              {DIFFICULTY_LEVEL_LABELS[preview.difficulty]}
            </Badge>
          </div>
          <div className="prose prose-sm dark:prose-invert max-h-48 overflow-y-auto">
            <ReactMarkdown>{preview.problemStatement.slice(0, 1200)}</ReactMarkdown>
          </div>
          <div className="flex flex-wrap items-end gap-md">
            <div className="space-y-1">
              <label className="text-sm font-medium">Solve in</label>
              <Select
                value={selectedLanguage}
                onValueChange={(v) => setSelectedLanguage((v as CodingLanguage) ?? "javascript")}
              >
                <SelectTrigger className="w-full sm:w-[180px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {availableLanguages.map((lang) => (
                    <SelectItem key={lang} value={lang}>
                      {CODING_LANGUAGE_LABELS[lang]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <Button onClick={handleAccept}>
              <Play className="mr-2 h-4 w-4" />
              Accept &amp; start
            </Button>
          </div>
        </div>
      )}
    </Card>
  );
}
