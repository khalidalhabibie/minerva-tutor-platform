import { expect, Page, test } from "@playwright/test";
import path from "path";

const parentEmail = requiredEnv("E2E_PARENT_EMAIL");
const parentPassword = requiredEnv("E2E_PARENT_PASSWORD");
const tutorEmail = requiredEnv("E2E_TUTOR_EMAIL");
const tutorPassword = requiredEnv("E2E_TUTOR_PASSWORD");
const secondTutorEmail = requiredEnv("E2E_SECOND_TUTOR_EMAIL");
const secondTutorPassword = requiredEnv("E2E_SECOND_TUTOR_PASSWORD");
const samplePdf = path.join(__dirname, "fixtures", "sample.pdf");

const stamp = Date.now();
const tutorName = `E2E Tutor ${stamp}`;
const caseTitle = `E2E Case ${stamp}`;
const caseSubject = "Mathematics";
const caseLevel = "Grade 9";
const documentName = "sample.pdf";

let tutorUserId = "";
let caseDetailPath = "";

test.describe.serial("take-home demo flow", () => {
  test("auth smoke: parent and tutor can login and logout", async ({ page }) => {
    await login(page, parentEmail, parentPassword);
    await logout(page);

    await login(page, tutorEmail, tutorPassword);
    await logout(page);
  });

  test("tutor can update profile and upload supporting document", async ({ page }) => {
    await login(page, tutorEmail, tutorPassword);
    await page.goto("/tutor/profile");
    await expect(page.getByRole("heading", { name: "Tutor profile" })).toBeVisible();

    await page.getByLabel("Display name").fill(tutorName);
    await page.getByLabel("Qualifications").fill(`E2E qualifications ${stamp}`);
    await page.getByLabel("Experiences").fill(`E2E experiences ${stamp}`);
    const [saveResponse] = await Promise.all([
      page.waitForResponse(
        (response) =>
          response.url().includes("/tutor-profile/me") &&
          response.request().method() === "PUT",
        { timeout: 30_000 }
      ),
      page.getByRole("button", { name: "Save profile" }).click()
    ]);
    expect(saveResponse.ok()).toBeTruthy();
    await expect(saveResponse.json()).resolves.toMatchObject({
      displayName: tutorName,
      qualifications: `E2E qualifications ${stamp}`,
      experiences: `E2E experiences ${stamp}`
    });
    await expect(page.getByRole("button", { name: "Save profile" })).toBeEnabled();

    await page.reload();
    await expect(page.getByLabel("Display name")).toHaveValue(tutorName);
    await expect(page.getByLabel("Qualifications")).toHaveValue(
      `E2E qualifications ${stamp}`
    );
    await expect(page.getByLabel("Experiences")).toHaveValue(
      `E2E experiences ${stamp}`
    );

    await uploadFirstDocument(page);
    await expect(page.getByText(documentName).first()).toBeVisible();
    await logout(page);
  });

  test("parent can browse tutors, create a case, invite tutor, and upload case document", async ({
    page
  }) => {
    await login(page, parentEmail, parentPassword);
    await page.goto("/parent/tutors");
    await expect(page.getByRole("heading", { name: "Tutor directory" })).toBeVisible();

    await page.getByPlaceholder("Search name, qualifications, or experiences").fill(tutorName);
    await page.keyboard.press("Tab");
    await expect(page.getByRole("link", { name: new RegExp(tutorName) })).toBeVisible();
    await page.getByRole("link", { name: new RegExp(tutorName) }).click();
    await expect(page.getByRole("heading", { name: tutorName })).toBeVisible();
    tutorUserId = await readTutorUserId(page);

    await page.goto("/parent/cases/new");
    await expect(page.getByRole("heading", { name: "Create case" })).toBeVisible();
    await page.getByLabel("Title").fill(caseTitle);
    await page.getByLabel("Subject").fill(caseSubject);
    await page.getByLabel("Level").fill(caseLevel);
    await page.getByLabel("Location").fill("Online");
    await page.getByLabel("Budget per hour").fill("250000");
    await Promise.all([
      page.waitForURL(/\/parent\/cases\/[^/]+$/),
      page.getByRole("button", { name: "Create case" }).click()
    ]);
    caseDetailPath = new URL(page.url()).pathname;
    await expect(page.getByRole("heading", { name: caseTitle })).toBeVisible();

    await page.getByPlaceholder("Tutor user id").fill(tutorUserId);
    await page.getByRole("button", { name: "Invite" }).click();
    await expect(page.getByText(tutorUserId)).toBeVisible();

    await uploadFirstDocument(page);
    await expect(page.getByText(documentName).first()).toBeVisible();
    await logout(page);
  });

  test("invited tutor can view the invited case and its document", async ({ page }) => {
    await login(page, tutorEmail, tutorPassword);
    await page.goto("/tutor/cases");
    await expect(
      page.getByRole("heading", { name: "Invited cases", exact: true })
    ).toBeVisible();

    await page.getByPlaceholder("Search title").fill(caseTitle);
    await page.keyboard.press("Tab");
    await expect(page.getByRole("link", { name: new RegExp(caseTitle) })).toBeVisible();
    await page.getByRole("link", { name: new RegExp(caseTitle) }).click();
    await expect(page.getByRole("heading", { name: caseTitle })).toBeVisible();
    await expect(page.getByText(documentName).first()).toBeVisible();
    await logout(page);
  });

  test("non-invited tutor cannot access the invited case", async ({ page }) => {
    await login(page, secondTutorEmail, secondTutorPassword);
    await page.goto("/tutor/cases");
    await expect(
      page.getByRole("heading", { name: "Invited cases", exact: true })
    ).toBeVisible();

    await page.getByPlaceholder("Search title").fill(caseTitle);
    await page.keyboard.press("Tab");
    await expect(page.getByRole("link", { name: new RegExp(caseTitle) })).toHaveCount(0);

    await page.goto(caseDetailPath);
    await expect(page.getByRole("heading", { name: "Access denied" })).toBeVisible();
    await page.evaluate(() => {
      localStorage.clear();
      sessionStorage.clear();
    });
  });
});

async function login(page: Page, email: string, password: string): Promise<void> {
  await page.goto("/login");
  await page.getByLabel("Email").fill(email);
  await page.getByLabel("Password").fill(password);
  await page.getByRole("button", { name: "Sign in" }).click();
  await expect(page.getByRole("button", { name: "Logout" })).toBeVisible();
}

async function logout(page: Page): Promise<void> {
  await page.getByRole("button", { name: "Logout" }).click();
  await expect(page).toHaveURL(/\/login$/);
}

async function uploadFirstDocument(page: Page): Promise<void> {
  const documents = page
    .locator("section")
    .filter({ has: page.getByRole("heading", { name: "Documents" }) })
    .first();
  await documents.locator('input[type="file"]').setInputFiles(samplePdf);
}

async function readTutorUserId(page: Page): Promise<string> {
  const text = await page.getByText(/Tutor user ID:/).textContent();
  const id = text?.replace("Tutor user ID:", "").trim();

  if (!id) {
    throw new Error("Tutor user ID was not visible on the tutor profile page");
  }

  return id;
}

function requiredEnv(name: string): string {
  const value = process.env[name];

  if (!value) {
    throw new Error(`${name} is required for E2E tests`);
  }

  return value;
}
