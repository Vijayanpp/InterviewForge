export interface TextChunk {
  content: string;
  index: number;
}

const DEFAULT_CHUNK_SIZE = 700;
const DEFAULT_OVERLAP = 80;

/** Split long documents into overlapping chunks for embedding. */
export function chunkText(
  text: string,
  chunkSize = DEFAULT_CHUNK_SIZE,
  overlap = DEFAULT_OVERLAP
): TextChunk[] {
  const normalized = text.replace(/\s+/g, " ").trim();
  if (!normalized) return [];
  if (normalized.length <= chunkSize) {
    return [{ content: normalized, index: 0 }];
  }

  const chunks: TextChunk[] = [];
  let start = 0;
  let index = 0;
  while (start < normalized.length) {
    const end = Math.min(normalized.length, start + chunkSize);
    chunks.push({ content: normalized.slice(start, end).trim(), index });
    if (end >= normalized.length) break;
    start = Math.max(0, end - overlap);
    index += 1;
  }
  return chunks.filter((chunk) => chunk.content.length > 0);
}
