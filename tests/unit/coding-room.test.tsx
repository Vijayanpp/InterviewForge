/** @vitest-environment jsdom */

import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { CodingRoom } from "@/components/coding/coding-room";
import type { CandidateFacingChallenge } from "@/types/domain/coding";

vi.mock("sonner", () => ({
  toast: { success: vi.fn(), error: vi.fn(), message: vi.fn() },
}));

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: vi.fn() }),
}));

vi.mock("@monaco-editor/react", () => ({
  default: () => <div data-testid="monaco-editor">editor</div>,
}));

const challenge: CandidateFacingChallenge = {
  id: "11111111-1111-1111-1111-111111111111",
  title: "Two Sum",
  slug: "two-sum",
  problemStatement: "Return indices of the two numbers that add up to target.",
  difficulty: "easy",
  examples: [{ input: "[2,7,11,15], 9", output: "[0,1]" }],
  constraints: "2 <= nums.length <= 10^4",
  starterCode: { javascript: "function twoSum() {}" },
  supportedLanguages: ["javascript"],
  expectedTimeComplexity: null,
  expectedSpaceComplexity: null,
  timeLimitMs: 2000,
  memoryLimitMb: 256,
  visibleTestCount: 2,
};

describe("CodingRoom mobile layout", () => {
  afterEach(() => {
    cleanup();
  });

  it("keeps Run and Submit on the editor pane", () => {
    render(<CodingRoom challenge={challenge} />);

    expect(screen.getByRole("button", { name: "Editor" })).toBeTruthy();
    expect(screen.getByRole("button", { name: "Run" })).toBeTruthy();
    expect(screen.getByRole("button", { name: "Submit" })).toBeTruthy();
  });

  it("lets the candidate open the problem without losing the editor tab", () => {
    render(<CodingRoom challenge={challenge} />);

    fireEvent.click(screen.getByRole("button", { name: "Problem" }));
    expect(screen.getByRole("heading", { name: "Two Sum" })).toBeTruthy();
    expect(screen.getByRole("button", { name: "Write solution" })).toBeTruthy();

    fireEvent.click(screen.getByRole("button", { name: "Write solution" }));
    expect(screen.getByRole("button", { name: "Submit" })).toBeTruthy();
  });
});
