import { test, expect, Page } from "@playwright/test";
import { loginSelectors } from "../Selectors/login";
import { dashboardSelectors } from "../Selectors/dashboard";

// Waits for the dashboard to refetch its data after a timeframe change.
async function selectTimeframe(page: Page, selector: string) {
  const responsePromise = page.waitForResponse(
    (response) =>
      ["xhr", "fetch"].includes(response.request().resourceType()) &&
      response.request().method() === "GET"
  );

  await page.locator(selector).click();
  const response = await responsePromise;
  console.log("Status:", response.status(), response.url());
  expect(response.ok()).toBeTruthy();

  // await expect(page.locator(dashboardSelectors.loadingDashboard)).toBeHidden();
  await expect(page.locator(dashboardSelectors.totalWorkflows)).toBeVisible();
}

test.describe("Dashboard Page", () => {
  let page: Page;

  // Pre-condition: user must be logged in
  test.beforeAll(async ({ browser }) => {
    page = await browser.newPage();
    await page.goto("/login", {
      waitUntil: "domcontentloaded",
    });

    await page
      .locator(loginSelectors.inputEmailField)
      .fill(process.env.TEST_USERNAME ?? "");
    await page
      .locator(loginSelectors.inputPassworldFields)
      .fill(process.env.TEST_PASSWORD ?? "");
    await page.locator(loginSelectors.loginButton).click();

    await page.locator(dashboardSelectors.sidebarDashboard).click();
    await expect(page.locator(dashboardSelectors.greeting)).toBeVisible();
  });

  test.afterAll(async () => {
    await page.close();
  });

  test("TC_DASH_001 - Verify Dashboard page loads successfully", async () => {
    await expect(
      page.locator(dashboardSelectors.loadingDashboard)
    ).toBeHidden();

    await expect(page.locator(dashboardSelectors.greeting)).toBeVisible();
    await expect(
      page.locator(dashboardSelectors.showMyTasksButton)
    ).toBeVisible();

    await expect(page.locator(dashboardSelectors.totalWorkflows)).toBeVisible();
    await expect(
      page.locator(dashboardSelectors.contentsInProgress)
    ).toBeVisible();
    await expect(
      page.locator(dashboardSelectors.myPendingActions)
    ).toBeVisible();
    await expect(
      page.locator(dashboardSelectors.publishReadyContents)
    ).toBeVisible();
    await expect(page.locator(dashboardSelectors.workflowStatus)).toBeVisible();
    await expect(
      page.locator(dashboardSelectors.myBrandsAndProducts)
    ).toBeVisible();
    await expect(
      page.locator(dashboardSelectors.workflowCreationTrend)
    ).toBeVisible();
    await expect(page.locator(dashboardSelectors.stageFunnel)).toBeVisible();
    await expect(
      page.locator(dashboardSelectors.roleWorkloadOverview)
    ).toBeVisible();

    await page.screenshot({
      path: "screenshots/dashboard-loaded.png",
      fullPage: true,
    });
  });

  test("TC_DASH_002 - Verify current date and day displayed", async () => {
    const today = new Date();
    const day = today.getDate();
    const weekday = today.toLocaleDateString("en-US", { weekday: "short" });
    const month = today.toLocaleDateString("en-US", { month: "long" });

    await expect(page.locator(dashboardSelectors.dateDay(day))).toBeVisible();
    await expect(
      page.locator(dashboardSelectors.dateWeekday(weekday))
    ).toBeVisible();
    await expect(
      page.locator(dashboardSelectors.dateMonth(month))
    ).toBeVisible();
  });

  test("TC_DASH_003 - Verify timeframe selector options", async () => {
    await expect(page.locator(dashboardSelectors.timeframeLabel)).toBeVisible();
    await expect(page.locator(dashboardSelectors.timeframeToday)).toBeVisible();
    await expect(page.locator(dashboardSelectors.timeframe30D)).toBeVisible();
    await expect(page.locator(dashboardSelectors.timeframe1Year)).toBeVisible();
    await expect(
      page.locator(dashboardSelectors.timeframeCustom)
    ).toBeVisible();
  });

  // 30D is the default timeframe, so this relies on TC_DASH_004 switching away from it first
  test("TC_DASH_005 - Verify timeframe 30D updates the page", async () => {
    await selectTimeframe(page, dashboardSelectors.timeframe30D);
  });

  test("TC_DASH_004 - Verify timeframe Today updates the page", async () => {
    await selectTimeframe(page, dashboardSelectors.timeframeToday);
  });

  test("TC_DASH_006 - Verify timeframe 1 Year updates the page", async () => {
    await selectTimeframe(page, dashboardSelectors.timeframe1Year);
  });

  test("TC_DASH_007 - Verify timeframe Custom updates the page with selected date", async () => {
    test.info().annotations.push({
      type: "issue",
      description:
        "Known failure: selecting a date in the Custom calendar does not refresh the page",
    });

    await page.locator(dashboardSelectors.timeframeCustom).click();
    await expect(page.locator(dashboardSelectors.calendar)).toBeVisible();

    const responsePromise = page.waitForResponse(
      (response) =>
        ["xhr", "fetch"].includes(response.request().resourceType()) &&
        response.request().method() === "GET"
    );

    await page.locator(dashboardSelectors.calendarDay(1)).click();
    await page
      .locator(dashboardSelectors.calendarDay(new Date().getDate()))
      .click();

    const applyButton = page.locator(dashboardSelectors.calendarApplyButton);
    if (await applyButton.isVisible()) {
      await applyButton.click();
    }

    const response = await responsePromise;
    console.log("Status:", response.status(), response.url());
    expect(response.ok()).toBeTruthy();

    await expect(
      page.locator(dashboardSelectors.loadingDashboard)
    ).toBeHidden();
    await page.screenshot({
      path: "screenshots/dashboard-custom-timeframe.png",
      fullPage: true,
    });
  });

  test("TC_DASH_008 - Verify Total Workflow Widget", async () => {
    await selectTimeframe(page, dashboardSelectors.timeframe1Year);
  });

});
