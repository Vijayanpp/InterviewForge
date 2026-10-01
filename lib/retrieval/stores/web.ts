import type { DocumentStore, RetrievedDocument } from "@/lib/retrieval/types";

/**
 * Optional web retrieval for JD/company interviews.
 * Default is a no-op so live turns stay offline-capable.
 */
export class WebDocumentStore implements DocumentStore {
  async search(): Promise<RetrievedDocument[]> {
    return [];
  }
}
