import { test, expect } from "@playwright/test";
import { loginSelectors } from "../Selectors/login";

const pageBaseUrl = process.env.BASE_URL || "http://qa.vibranthive.com";
const loginPageUrl = `${pageBaseUrl}/login`;

test.describe("Login Page", () => {
  let page: any;
  test.beforeAll(async ({ browser }) => {
    page = await browser.newPage();
    await page.goto("/login", {
      waitUntil: "domcontentloaded",
    });
  });
  test("Check if Login page has title", async () => {
    await expect(page).toHaveTitle(/VibrantHive/);
  });

  test("Check Login Fields are Visibile", async () => {
    await expect(page.locator(loginSelectors.emailLabel)).toBeVisible();
    await expect(page.locator(loginSelectors.passwordLabel)).toBeVisible();
    await expect(page.locator(loginSelectors.inputEmailField)).toBeVisible();
    await expect(
      page.locator(loginSelectors.inputPassworldFields)
    ).toBeVisible();
    await page.screenshot({
      path: "screenshots/login-field-visible.png",
      fullPage: true,
    });
  });

  test("Check Login Failure", async () => {
    await page.locator(loginSelectors.emailLabel).fill("wronguse@wrong.com");
    await page.locator(loginSelectors.passwordLabel).fill("password");
    await expect(page.locator(loginSelectors.loginButton)).toBeVisible();

    const responsePromise = page.waitForResponse(
      (response) =>
        response.url().includes("/login_user") &&
        response.request().method() === "POST"
    );

    await page.locator(loginSelectors.loginButton).click();
    const response = await responsePromise;
    console.log("Status:", response.status());

    const loginFailed = page.locator(loginSelectors.loginFailed);
    await expect(loginFailed).toBeVisible();
    await expect(loginFailed).toHaveText("Login failed");
  });

  test("Check Login Success", async () => {
    await page
      .locator(loginSelectors.emailLabel)
      .fill(process.env.TEST_USERNAME);
    await page
      .locator(loginSelectors.passwordLabel)
      .fill(process.env.TEST_PASSWORD);
    await expect(page.locator(loginSelectors.loginButton)).toBeVisible();

    const responsePromise = page.waitForResponse(
      (response) =>
        response.url().includes("/login_user") &&
        response.request().method() === "POST"
    );

    await page.locator(loginSelectors.loginButton).click();
    const response = await responsePromise;
    console.log("Status:", response.status());

    expect(response.ok()).toBeTruthy();

    await expect(page.getByText("Dashboard")).toBeVisible({
      timeout: 10000,
    });
  });
});
