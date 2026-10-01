import type { RetrievedDocument } from "@/lib/retrieval/types";

function normalizeKey(document: RetrievedDocument): string {
  const source = `${document.sourceType}:${document.sourceId ?? ""}`;
  const content = document.content.replace(/\s+/g, " ").trim().toLowerCase().slice(0, 240);
  return `${source}|${content}`;
}

/** Deduplicate by source + normalized content prefix (BR URL-dedup analogue). */
export function deduplicateDocuments(documents: RetrievedDocument[]): RetrievedDocument[] {
  const seen = new Set<string>();
  const unique: RetrievedDocument[] = [];
  for (const document of documents) {
    const key = normalizeKey(document);
    if (seen.has(key)) continue;
    seen.add(key);
    unique.push(document);
  }
  return unique;
}
