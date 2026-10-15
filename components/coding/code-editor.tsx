"use client";

import dynamic from "next/dynamic";
import { CODING_LANGUAGE_LABELS, MONACO_LANGUAGE_IDS, type CodingLanguage } from "@/lib/code-execution/languages";

const Editor = dynamic(() => import("@monaco-editor/react"), {
  ssr: false,
  loading: () => (
    <div className="flex h-full items-center justify-center bg-[#1e1e1e] text-sm text-white/50">
      Loading editor…
    </div>
  ),
});

export function CodeEditor({
  language,
  value,
  onChange,
}: {
  language: CodingLanguage;
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <Editor
      height="100%"
      language={MONACO_LANGUAGE_IDS[language]}
      theme="vs-dark"
      value={value}
      onChange={(v) => onChange(v ?? "")}
      options={{
        fontSize: 13,
        minimap: { enabled: false },
        scrollBeyondLastLine: false,
        automaticLayout: true,
        tabSize: 2,
        wordWrap: "on",
        padding: { top: 12 },
        scrollbar: { verticalScrollbarSize: 8, horizontalScrollbarSize: 8 },
      }}
    />
  );
}

export function LanguageSelect({
  languages,
  value,
  onChange,
}: {
  languages: CodingLanguage[];
  value: CodingLanguage;
  onChange: (value: CodingLanguage) => void;
}) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value as CodingLanguage)}
      className="max-w-[9.5rem] truncate rounded-md border border-white/10 bg-white/5 px-2 py-1 text-xs text-white focus:outline-none focus:ring-1 focus:ring-primary sm:max-w-none"
    >
      {languages.map((lang) => (
        <option key={lang} value={lang} className="bg-[#1e1e1e] text-white">
          {CODING_LANGUAGE_LABELS[lang]}
        </option>
      ))}
    </select>
  );
}
