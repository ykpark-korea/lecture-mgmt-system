import { expect, test } from "@playwright/test";

test("learner login page renders the scaffold form", async ({ page }) => {
  await page.goto("/");

  await expect(page.getByRole("heading", { name: "수강자 로그인" })).toBeVisible();
  await expect(page.getByLabel("입장 코드")).toHaveAttribute("name", "code");
  await expect(page.getByRole("button", { name: "강의 목록 보기" })).toBeVisible();
  await expect(page.locator('form[action="/api/learner/login"][method="POST"]')).toBeVisible();
});
