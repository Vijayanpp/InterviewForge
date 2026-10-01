/** @vitest-environment jsdom */

import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { ProctorShell } from "@/components/proctoring/proctor-shell";
import { DEFAULT_ANTI_CHEATING, type AntiCheatingSettings } from "@/types/domain/assessment";

vi.mock("sonner", () => ({
  toast: { success: vi.fn(), error: vi.fn() },
}));

const settings: AntiCheatingSettings = {
  ...DEFAULT_ANTI_CHEATING,
  requireWebcam: true,
  requireScreenShare: false,
  requireFullscreen: true,
  blockClipboard: false,
  detectTabBlur: false,
  detectMultiFace: false,
  detectNoFace: false,
  recordWebcam: false,
  recordScreen: false,
};

describe("ProctorShell HUD", () => {
  beforeEach(() => {
    Object.defineProperty(HTMLMediaElement.prototype, "play", {
      configurable: true,
      value: vi.fn().mockResolvedValue(undefined),
    });
    Object.defineProperty(document.documentElement, "requestFullscreen", {
      configurable: true,
      value: vi.fn().mockResolvedValue(undefined),
    });
    Object.defineProperty(navigator, "mediaDevices", {
      configurable: true,
      value: {
        getUserMedia: vi.fn().mockResolvedValue({
          getTracks: () => [{ stop: vi.fn(), addEventListener: vi.fn() }],
        }),
        getDisplayMedia: vi.fn(),
      },
    });
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({ integrity: { flagged: false } }),
      })
    );
  });

  afterEach(() => {
    cleanup();
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  it("keeps the fullscreen warning fully visible and off the interview header", async () => {
    render(
      <ProctorShell sessionId="session-1" settings={settings}>
        <button type="button">End Interview</button>
        <p>LIVE TRANSCRIPT</p>
      </ProctorShell>
    );

    fireEvent.click(screen.getByRole("button", { name: /enable camera/i }));

    await waitFor(() => {
      expect(screen.getByRole("button", { name: "End Interview" })).toBeTruthy();
    });

    document.dispatchEvent(new Event("fullscreenchange"));

    await waitFor(() => {
      expect(screen.getByText("Fullscreen exited")).toBeTruthy();
    });

    const hud = document.querySelector("aside.fixed");
    expect(hud).toBeTruthy();
    expect(hud?.className).toContain("bottom-32");
    expect(hud?.className).not.toMatch(/top-4\b/);
    expect(hud?.parentElement).toBe(document.body);

    expect(screen.getByRole("button", { name: "Return to fullscreen" })).toBeTruthy();
    expect(screen.queryByText(/Violations:/)).toBeNull();
  });
});
