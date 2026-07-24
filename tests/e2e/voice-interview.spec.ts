import { expect, test, type Page } from "@playwright/test";

/**
 * Phase 4 voice smoke: register → wizard Voice mode → voice room chrome.
 * Uses VOICE_PROVIDER=mock (default). Grants mic permission so the room can boot.
 */

async function clickExactText(page: Page, text: string) {
  await page.getByText(text, { exact: true }).first().click();
}

test.describe("voice interview smoke", () => {
  test.use({
    permissions: ["microphone"],
  });

  test("wizard voice mode lands in the voice room", async ({ page, context }) => {
    await context.grantPermissions(["microphone"]);

    const suffix = Date.now().toString(36);
    const email = `e2e-voice-${suffix}@interviewforge.test`;
    const password = "TestPass123!";

    await page.goto("/register");
    await page.getByPlaceholder("Jane Doe").fill("Voice Candidate");
    await page.getByPlaceholder("name@company.com").fill(email);
    await page.getByPlaceholder("••••••••").fill(password);
    await page.getByRole("button", { name: "Create account" }).click();
    await page.waitForURL("**/onboarding", { timeout: 20_000 });

    await page.getByPlaceholder("e.g. Alex Rivera").fill("Voice Candidate");
    await page.getByRole("button", { name: "Continue" }).click();
    await page.getByRole("button", { name: "Continue" }).click();
    await page.getByRole("button", { name: "Continue" }).click();
    await clickExactText(page, "JavaScript");
    await page.getByRole("button", { name: "Continue" }).click();
    await page.getByRole("button", { name: "Complete setup" }).click();
    await page.waitForURL("**/dashboard", { timeout: 20_000 });

    await page.getByRole("button", { name: "Start New Interview" }).click();
    await page.waitForURL("**/interviews/new", { timeout: 20_000 });

    await clickExactText(page, "Technical");
    await page.getByRole("button", { name: "Voice", exact: true }).click();
    await page.getByRole("button", { name: "Continue" }).click();

    await clickExactText(page, "JavaScript");
    await page.getByRole("button", { name: "Continue" }).click();
    await page.getByRole("button", { name: "Continue" }).click();
    await clickExactText(page, "Mid-level");
    await page.getByRole("button", { name: "Continue" }).click();
    await clickExactText(page, "Medium");
    await page.getByRole("button", { name: "Continue" }).click();
    await clickExactText(page, "30");
    await page.getByRole("button", { name: "Continue" }).click();
    await page.getByRole("button", { name: "Continue" }).click();

    await expect(page.getByText("Delivery mode")).toBeVisible();
    await expect(page.getByText("Voice", { exact: true }).last()).toBeVisible();
    await page.getByRole("button", { name: "Start Interview" }).click();

    await page.waitForURL("**/interviews/*/voice", { timeout: 20_000 });
    await expect(page.getByText("LIVE TRANSCRIPT")).toBeVisible({ timeout: 20_000 });
    await expect(
      page.getByText(/listening starts automatically|I'll submit when you pause/i).first()
    ).toBeVisible({ timeout: 20_000 });
    await expect(page.getByRole("button", { name: "Finish Answer" })).toBeVisible();
    await expect(page.getByRole("button", { name: "End Interview" })).toBeVisible();
    await expect(page.getByText(/Hi|Welcome|introduce/i).first()).toBeVisible({ timeout: 20_000 });
  });
});
