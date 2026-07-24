import { expect, test, type Page } from "@playwright/test";

/**
 * End-to-end smoke test covering the full Phase 1+2 happy path:
 * register -> onboarding -> configure an interview -> answer a question
 * -> end the interview -> view the final report.
 *
 * Runs against the mock AI provider (default in `.env.local`) so it never
 * calls a real LLM, and against a local Supabase instance started via
 * `supabase start`.
 */

async function clickExactText(page: Page, text: string) {
  await page.getByText(text, { exact: true }).first().click();
}

test.describe("full candidate journey", () => {
  test("register, complete onboarding, run a text interview, and view the report", async ({
    page,
  }) => {
    const suffix = Date.now().toString(36);
    const email = `e2e-${suffix}@interviewforge.test`;
    const password = "TestPass123!";

    // 1. Register ------------------------------------------------------------
    await page.goto("/register");
    await page.getByPlaceholder("Jane Doe").fill("Ada Lovelace");
    await page.getByPlaceholder("name@company.com").fill(email);
    await page.getByPlaceholder("••••••••").fill(password);
    await page.getByRole("button", { name: "Create account" }).click();

    await page.waitForURL("**/onboarding", { timeout: 20_000 });

    // 2. Onboarding (5 steps, everything but full name is optional) ---------
    await expect(page.getByRole("heading", { name: "Welcome! Let's get started." })).toBeVisible();
    const fullNameInput = page.getByPlaceholder("e.g. Alex Rivera");
    await fullNameInput.fill("Ada Lovelace");
    await page.getByRole("button", { name: "Continue" }).click();

    await expect(page.getByRole("heading", { name: "Where are you now?" })).toBeVisible();
    await page.getByRole("button", { name: "Continue" }).click();

    await expect(page.getByRole("heading", { name: "What's the next move?" })).toBeVisible();
    await page.getByRole("button", { name: "Continue" }).click();

    await expect(page.getByRole("heading", { name: "Refine your stack." })).toBeVisible();
    await clickExactText(page, "JavaScript");
    await page.getByRole("button", { name: "Continue" }).click();

    await expect(page.getByRole("heading", { name: "A couple more things." })).toBeVisible();
    await page.getByRole("button", { name: "Complete setup" }).click();

    await page.waitForURL("**/dashboard", { timeout: 20_000 });

    // 3. Start a new interview via the 8-step wizard -------------------------
    await page.getByRole("button", { name: "Start New Interview" }).click();
    await page.waitForURL("**/interviews/new", { timeout: 20_000 });

    // Step 1: interview type
    await expect(page.getByText("Select Interview Type")).toBeVisible();
    await clickExactText(page, "Technical");
    await page.getByRole("button", { name: "Continue" }).click();

    // Step 2: technologies
    await expect(page.getByText("Choose Your Technologies")).toBeVisible();
    await clickExactText(page, "JavaScript");
    await page.getByRole("button", { name: "Continue" }).click();

    // Step 3: topics (optional — continue either way)
    await expect(page.getByText("Narrow the Topics")).toBeVisible();
    await page.getByRole("button", { name: "Continue" }).click();

    // Step 4: experience level
    await expect(page.getByText("Your Experience Level")).toBeVisible();
    await clickExactText(page, "Mid-level");
    await page.getByRole("button", { name: "Continue" }).click();

    // Step 5: difficulty
    await expect(page.getByText("Choose a Difficulty")).toBeVisible();
    await clickExactText(page, "Medium");
    await page.getByRole("button", { name: "Continue" }).click();

    // Step 6: duration
    await expect(page.getByText("Set the Duration")).toBeVisible();
    await clickExactText(page, "30");
    await page.getByRole("button", { name: "Continue" }).click();

    // Step 7: personalization (optional — continue without filling)
    await expect(page.getByText("Personalize (Optional)")).toBeVisible();
    await page.getByRole("button", { name: "Continue" }).click();

    // Step 8: review & confirm
    await expect(page.getByText("Review & Confirm")).toBeVisible();
    await page.getByRole("button", { name: "Start Interview" }).click();

    await page.waitForURL("**/interviews/*/room", { timeout: 20_000 });

    // 4. Answer one question in the interview room ---------------------------
    const answerBox = page.getByPlaceholder(
      "Type your answer here — be as thorough as you would in a real interview..."
    );
    await expect(answerBox).toBeVisible({ timeout: 20_000 });
    await answerBox.fill(
      "Closures let a function retain access to its lexical scope even after the outer function has returned, which is what makes patterns like memoization and private state possible in JavaScript."
    );
    await page.getByRole("button", { name: "Submit Answer" }).click();

    // 5. End the interview -----------------------------------------------------
    await page.getByRole("button", { name: "End Interview", exact: true }).click();
    await expect(page.getByRole("heading", { name: "End this interview?" })).toBeVisible();
    await page.getByRole("button", { name: "End interview", exact: true }).click();

    // 6. View the final report --------------------------------------------------
    await page.waitForURL("**/interviews/*/report", { timeout: 30_000 });
    await expect(page.getByRole("heading", { name: "Interview Report" })).toBeVisible();
  });
});
