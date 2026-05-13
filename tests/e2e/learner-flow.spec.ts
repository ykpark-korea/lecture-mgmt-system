import { expect, test } from "@playwright/test";

test("learner login page renders", async ({ page }) => {
  await page.goto("/");

  await expect(page.getByRole("heading", { name: "사내강의 접속" })).toBeVisible();
  await expect(page.getByLabel("접속 코드")).toBeVisible();
});

test("admin login page renders", async ({ page }) => {
  await page.goto("/admin/login");

  await expect(page.getByRole("heading", { name: "관리자 접속" })).toBeVisible();
  await expect(page.getByLabel("관리자 코드")).toBeVisible();
});
