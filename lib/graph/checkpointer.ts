import "server-only";
import { MemorySaver } from "@langchain/langgraph";

let checkpointer: MemorySaver | undefined;

/** In-process LangGraph checkpointer. Thread id = interview session id. */
export function getInterviewCheckpointer(): MemorySaver {
  if (!checkpointer) {
    checkpointer = new MemorySaver();
  }
  return checkpointer;
}

export function resetInterviewCheckpointer(): void {
  checkpointer = new MemorySaver();
}
