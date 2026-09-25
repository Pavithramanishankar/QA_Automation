import { test, expect, Page } from "@playwright/test";
import { loginSelectors } from "../Selectors/login";
import { dashboardSelectors } from "../Selectors/dashboard";

const dashboardApi = "/get_dashboard_info_by_user_id";

// Selects a timeframe and waits for the dashboard to refresh. Data for a
// timeframe already loaded is served from cache, so a new request is optional.
async function selectTimeframe(page: Page, selector: string) {
  const responsePromise = page
    .waitForResponse((response) => response.url().includes(dashboardApi), {
      timeout: 5000,
    })
    .catch(() => null);

  await page.locator(selector).click();
  await expect(page.locator(selector)).toHaveClass(/bg-background/);

  const response = await responsePromise;
  if (response) {
    console.log("Status:", response.status(), response.url());
    expect(response.ok()).toBeTruthy();
  }

  await expect(page.locator(dashboardSelectors.loadingDashboard)).toBeHidden();
  await expect(page.locator(dashboardSelectors.totalWorkflows)).toBeVisible();
}

// Scrolls every scrollable area to the bottom and back to the top so lazily loaded widgets render in the DOM.
async function scrollToBottomAndBack(page: Page) {
  await page.evaluate(async () => {
    const delay = (ms: number) => new Promise((r) => setTimeout(r, ms));
    const scrollables = [
      document.scrollingElement,
      ...Array.from(document.querySelectorAll("*")).filter((el) => {
        const overflowY = getComputedStyle(el).overflowY;
        return (
          /(auto|scroll)/.test(overflowY) && el.scrollHeight > el.clientHeight
        );
      }),
    ].filter((el): el is Element => !!el);

    for (const el of scrollables) {
      const step = Math.max(el.clientHeight / 2, 200);
      for (let y = 0, i = 0; y < el.scrollHeight && i < 50; y += step, i++) {
        el.scrollTo(0, y);
        await delay(200);
      }
      el.scrollTo(0, el.scrollHeight);
      await delay(500);
    }

    for (const el of scrollables) {
      el.scrollTo(0, 0);
    }
  });
}

// Reads a number from an element's text, e.g. "2", "0 items" or "(50%)"
async function readNumber(page: Page, selector: string) {
  const locator = page.locator(selector);
  await expect(locator).toBeVisible();
  const text = (await locator.textContent()) ?? "";
  const match = text.match(/\d+(\.\d+)?/);
  expect(match, `No number in "${text}"`).not.toBeNull();
  return Number(match![0]);
}

// Stat widget counts animate, so read the final value from aria-label
async function readStatCount(page: Page, statCard: string) {
  const locator = page.locator(dashboardSelectors.statCount(statCard));
  await expect(locator).toHaveAttribute("aria-label", /^\d+$/);
  return Number(await locator.getAttribute("aria-label"));
}

// Formats a date the way the calendar's aria-label does, e.g. "September 1st, 2026"
function calendarLabel(date: Date) {
  const day = date.getDate();
  const suffix =
    day % 100 >= 11 && day % 100 <= 13
      ? "th"
      : ({ 1: "st", 2: "nd", 3: "rd" } as Record<number, string>)[day % 10] ??
        "th";
  const month = date.toLocaleDateString("en-US", { month: "long" });
  return `${month} ${day}${suffix}, ${date.getFullYear()}`;
}

const statWidgets = [
  {
    id: "TC_DASH_008",
    title: "Total Workflows",
    card: dashboardSelectors.totalWorkflowsCard,
    subtitle: "Across all statuses",
    badge: "All",
    footer: "Workflows currently in HiveFlow",
  },
  {
    id: "TC_DASH_009",
    title: "Contents In Progress",
    card: dashboardSelectors.contentsInProgressCard,
    subtitle: "Design / Review / Publish",
    badge: "Active",
    footer: "Unique contents moving through the flow",
  },
  {
    id: "TC_DASH_010",
    title: "My Pending Actions",
    card: dashboardSelectors.myPendingActionsCard,
    subtitle: "Role-based queue",
    badge: "Needs attention",
    footer: "Items where your action is required",
  },
  {
    id: "TC_DASH_011",
    title: "Publish-Ready Contents",
    card: dashboardSelectors.publishReadyContentsCard,
    subtitle: "Ready for activation",
    badge: "Ready",
    footer: "Assets that can be published once approved",
  },
];

const workflowStages = ["New", "Design", "Review", "Publish"];
const workloadRoles = ["Brand managers", "Designers", "Reviewers"];

test.describe("Dashboard Page", () => {
  let page: Page;
  // Total Workflows count per timeframe, filled by TC_DASH_004 to TC_DASH_006
  const totalByTimeframe: Record<string, number> = {};

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
    await expect(page.locator(dashboardSelectors.loadingDashboard)).toBeHidden();

    // Dismiss the "Enable Desktop Alerts" prompt if it shows up
    await page
      .locator(dashboardSelectors.desktopAlertsLater)
      .click({ timeout: 5000 })
      .catch(() => {});

    await scrollToBottomAndBack(page);
    await expect(page.locator(dashboardSelectors.loadingDashboard)).toBeHidden();
  });

  test.afterAll(async () => {
    await page.close();
  });

  test("TC_DASH_001 - Verify Dashboard page loads successfully", async () => {
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
    const weekday = today.toLocaleDateString("en-US", { weekday: "short" });
    const month = today.toLocaleDateString("en-US", { month: "long" });

    await expect(page.locator(dashboardSelectors.dateDay)).toHaveText(
      String(today.getDate())
    );
    await expect(page.locator(dashboardSelectors.dateWeekday)).toHaveText(
      `${weekday},`
    );
    await expect(page.locator(dashboardSelectors.dateMonth)).toHaveText(month);
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

  for (const { id, label, selector } of [
    { id: "TC_DASH_004", label: "Today", selector: dashboardSelectors.timeframeToday },
    { id: "TC_DASH_005", label: "30D", selector: dashboardSelectors.timeframe30D },
    { id: "TC_DASH_006", label: "1 Year", selector: dashboardSelectors.timeframe1Year },
  ]) {
    test(`${id} - Verify timeframe ${label} updates the page`, async () => {
      await selectTimeframe(page, selector);

      totalByTimeframe[label] = await readStatCount(
        page,
        dashboardSelectors.totalWorkflowsCard
      );
      console.log(`Total Workflows (${label}):`, totalByTimeframe[label]);
    });
  }

  test("TC_DASH_007 - Verify timeframe Custom updates the page with selected date", async () => {
    test.info().annotations.push({
      type: "issue",
      description:
        "Known failure: selecting a date in the Custom calendar does not refresh the page",
    });

    // Page is on 1 Year after TC_DASH_006; a range within this month must change the trend graph
    const ticksBefore = await page
      .locator(dashboardSelectors.trendXAxisTicks)
      .allTextContents();

    await page.locator(dashboardSelectors.timeframeCustom).click();
    await expect(
      page.locator(dashboardSelectors.customDatePopover)
    ).toBeVisible();
    await expect(
      page.locator(dashboardSelectors.calendarFirstMonth)
    ).toBeVisible();

    const today = new Date();
    const firstOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    await page
      .locator(dashboardSelectors.calendarDay(calendarLabel(firstOfMonth)))
      .click();
    await page
      .locator(dashboardSelectors.calendarDay(calendarLabel(today)))
      .click();

    await expect(
      page.locator(dashboardSelectors.calendarApplyButton)
    ).toBeEnabled();
    await page.locator(dashboardSelectors.calendarApplyButton).click();

    await expect(
      page.locator(dashboardSelectors.customDatePopover)
    ).toBeHidden();
    await expect(page.locator(dashboardSelectors.timeframeCustom)).toHaveClass(
      /bg-background/
    );
    await expect(page.locator(dashboardSelectors.loadingDashboard)).toBeHidden();

    await page.screenshot({
      path: "screenshots/dashboard-custom-timeframe.png",
      fullPage: true,
    });

    const month = today.toLocaleDateString("en-US", { month: "short" });
    await expect(async () => {
      const ticksAfter = await page
        .locator(dashboardSelectors.trendXAxisTicks)
        .allTextContents();
      expect(ticksAfter).not.toEqual(ticksBefore);
      for (const tick of ticksAfter) {
        expect(tick).toContain(month);
      }
    }).toPass({ timeout: 10000 });
  });

  for (const widget of statWidgets) {
    test(`${widget.id} - Verify ${widget.title} widget`, async () => {
      await expect(page.locator(widget.card)).toBeVisible();
      await expect(
        page.locator(dashboardSelectors.cardText(widget.card, widget.subtitle))
      ).toBeVisible();
      await expect(
        page.locator(dashboardSelectors.cardText(widget.card, widget.footer))
      ).toBeVisible();
      await expect(
        page.locator(dashboardSelectors.statBadge(widget.card))
      ).toHaveText(widget.badge);

      const count = await readStatCount(page, widget.card);
      console.log(`${widget.title} count:`, count);
      expect(count).toBeGreaterThanOrEqual(0);
    });
  }

  test(
    "TC_DASH_012 - Calendar icon verification",
    {
      tag: "@needs-improvement",
      annotation: {
        type: "🟡 Needs Improvement",
        description:
          "Clicking the calendar icon near Show my Tasks does nothing",
      },
    },
    async () => {
      // Expected to fail until the improvement ships; reported as passed meanwhile
      test.fail();

      await page.keyboard.press("Escape");
      await page.locator(dashboardSelectors.dateDay).click();

      await expect(page.locator(dashboardSelectors.datePopup)).toBeVisible({
        timeout: 5000,
      });
    }
  );

  test("TC_DASH_013 - Verify Workflow Status chart", async () => {
    await page.keyboard.press("Escape");
    await expect(page.locator(dashboardSelectors.workflowStatusCard)).toBeVisible();

    const total = await readNumber(page, dashboardSelectors.workflowStatusTotal);
    const rows = await page
      .locator(dashboardSelectors.workflowStatusRows)
      .count();
    console.log("Workflow Status total:", total, "stages shown:", rows);
    test.skip(total === 0, "Pre-condition not met: no workflows in timeframe");

    // Only stages that have workflows are listed
    let sum = 0;
    for (let n = 1; n <= rows; n++) {
      const stage =
        (await page
          .locator(dashboardSelectors.workflowStatusRowLabel(n))
          .textContent()) ?? "";
      const count = await readNumber(
        page,
        dashboardSelectors.workflowStatusRowCount(n)
      );
      const percent = await readNumber(
        page,
        dashboardSelectors.workflowStatusRowPercent(n)
      );
      console.log(`${stage}: ${count} (${percent}%)`);

      expect(workflowStages).toContain(stage.trim());
      expect(Math.abs(percent - (count / total) * 100)).toBeLessThanOrEqual(1);
      sum += count;
    }
    expect(sum).toBe(total);
  });

  test("TC_DASH_014 - Verify My Brands & Products section is visible", async () => {
    await expect(
      page.locator(dashboardSelectors.myBrandsAndProductsCard)
    ).toBeVisible();

    for (const label of ["Brands", "Products"] as const) {
      const count = await readNumber(
        page,
        dashboardSelectors.brandsProductsCount(label)
      );
      console.log(`${label} count:`, count);
      await expect(
        page.locator(dashboardSelectors.brandsProductsHeading(label))
      ).toBeVisible();
    }
  });

  for (const { id, label } of [
    { id: "TC_DASH_015", label: "Brands" as const },
    { id: "TC_DASH_016", label: "Products" as const },
  ]) {
    test(`${id} - Verify ${label} list when associated ${label.toLowerCase()} exist`, async () => {
      const count = await readNumber(
        page,
        dashboardSelectors.brandsProductsCount(label)
      );
      test.skip(
        count === 0,
        `Pre-condition not met: no ${label.toLowerCase()} associated with workflows`
      );

      const items = page.locator(dashboardSelectors.brandsProductsItems(label));
      await expect(items).toHaveCount(count);
      console.log(`${label}:`, await items.allTextContents());
    });
  }

  test("TC_DASH_017 - Verify Stage Funnel values", async () => {
    await expect(page.locator(dashboardSelectors.stageFunnelCard)).toBeVisible();

    const total = await readNumber(page, dashboardSelectors.workflowStatusTotal);
    test.skip(total === 0, "Pre-condition not met: no workflows in timeframe");

    const rows = await page.locator(dashboardSelectors.stageFunnelRows).count();
    expect(rows).toBeGreaterThan(0);

    let sum = 0;
    for (let n = 1; n <= rows; n++) {
      const stage =
        (await page
          .locator(dashboardSelectors.stageFunnelRowLabel(n))
          .textContent()) ?? "";
      const count = await readNumber(
        page,
        dashboardSelectors.stageFunnelRowCount(n)
      );
      const percent = await readNumber(
        page,
        dashboardSelectors.stageFunnelRowPercent(n)
      );
      console.log(`${stage}: ${count} (${percent}%)`);

      expect(workflowStages).toContain(stage.trim());
      expect(Math.abs(percent - (count / total) * 100)).toBeLessThanOrEqual(1);
      sum += count;
    }
    // Funnel must match the Workflow Status chart
    expect(sum).toBe(total);
  });

  test("TC_DASH_018 - Verify Workflow Creation Trend graph", async () => {
    await page.keyboard.press("Escape");

    await selectTimeframe(page, dashboardSelectors.timeframe1Year);
    const total = await readStatCount(
      page,
      dashboardSelectors.totalWorkflowsCard
    );
    test.skip(total === 0, "Pre-condition not met: no workflows exist");

    await expect(page.locator(dashboardSelectors.trendChart)).toBeVisible();
    const yearTicks = await page
      .locator(dashboardSelectors.trendXAxisTicks)
      .allTextContents();

    await selectTimeframe(page, dashboardSelectors.timeframe30D);
    await expect(page.locator(dashboardSelectors.trendChart)).toBeVisible();
    await expect(async () => {
      const monthTicks = await page
        .locator(dashboardSelectors.trendXAxisTicks)
        .allTextContents();
      expect(monthTicks.length).toBeGreaterThan(0);
      expect(monthTicks).not.toEqual(yearTicks);
    }).toPass({ timeout: 10000 });
  });

  test("TC_DASH_019 - Verify Role Workload Overview", async () => {
    const card = page.locator(dashboardSelectors.roleWorkloadOverviewCard);
    await card.scrollIntoViewIfNeeded();
    await expect(card).toBeVisible();

    for (const role of workloadRoles) {
      const items = page.locator(dashboardSelectors.roleWorkloadItems(role));
      await expect(items).toHaveText(/^\d+ items?$/);
      console.log(`${role}:`, await items.textContent());
    }
  });
});