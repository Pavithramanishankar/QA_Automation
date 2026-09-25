// Widget card (data-slot="card") that contains the given title
const card = (title: string) =>
  `//div[@data-slot="card"][.//*[normalize-space(text())="${title}"]]`;

const timeframeButton = (label: string) =>
  `//header//button[normalize-space()="${label}"]`;

export const dashboardSelectors = {
  // Sidebar
  sidebarDashboard: '(//a[normalize-space()="Dashboard"])[1]',
  sidebarHiveFlow: '//a[normalize-space()="HiveFlow"]',
  sidebarHiveCore: '//a[normalize-space()="HiveCore"]',
  sidebarContentCalendar: '//a[contains(normalize-space(),"Content Calendar")]',
  sidebarConceptForge: '//a[normalize-space()="ConceptForge"]',
  sidebarBrandNest: '//a[normalize-space()="BrandNest"]',
  sidebarSettings: '//a[normalize-space()="Settings"]',

  // "Enable Desktop Alerts" prompt shown after login
  desktopAlertsLater: '//button[normalize-space()="Later"]',

  // Header
  greeting: '//h2[starts-with(normalize-space(),"Hey,")]',
  showMyTasksButton: '//button[contains(normalize-space(),"Show my Tasks")]',
  loadingDashboard: '//*[contains(text(),"Loading your dashboard")]',

  // Timeframe selector (the selected button has the "bg-background" class)
  timeframeLabel: '//header//span[normalize-space()="Timeframe"]',
  timeframeToday: timeframeButton("Today"),
  timeframe30D: timeframeButton("30D"),
  timeframe1Year: timeframeButton("1 Year"),
  timeframeCustom: timeframeButton("Custom"),

  // Custom date range popover
  customDatePopover: '//*[@role="dialog"][.//*[normalize-space()="Custom Date Range"]]',
  calendarFirstMonth: '(//*[@role="dialog"]//table[@role="grid"])[1]',
  // e.g. calendarDay("September 1st, 2026")
  calendarDay: (date: string) =>
    `//*[@role="dialog"]//table[@role="grid"]//button[contains(@aria-label,"${date}")]`,
  calendarApplyButton: '//*[@role="dialog"]//button[normalize-space()="Apply"]',
  calendarCancelButton: '//*[@role="dialog"]//button[normalize-space()="Cancel"]',

  // Current date block next to "Show my Tasks", acts as the calendar icon
  dateDay: '//button[contains(normalize-space(),"Show my Tasks")]/ancestor::div[2]/div[1]/span',
  dateWeekday: '//button[contains(normalize-space(),"Show my Tasks")]/ancestor::div[2]/div[2]/span[1]',
  dateMonth: '//button[contains(normalize-space(),"Show my Tasks")]/ancestor::div[2]/div[2]/span[2]',
  datePopup: '//*[@role="dialog"]',

  // Widget titles
  totalWorkflows: '//*[normalize-space(text())="Total Workflows"]',
  contentsInProgress: '//*[normalize-space(text())="Contents In Progress"]',
  myPendingActions: '//*[normalize-space(text())="My Pending Actions"]',
  publishReadyContents: '//*[normalize-space(text())="Publish-Ready Contents"]',
  workflowStatus: '//*[normalize-space(text())="Workflow Status"]',
  myBrandsAndProducts: '//*[normalize-space(text())="My Brands & Products"]',
  workflowCreationTrend: '//*[normalize-space(text())="Workflow Creation Trend"]',
  stageFunnel: '//*[normalize-space(text())="Stage Funnel"]',
  roleWorkloadOverview: '//*[normalize-space(text())="Role Workload Overview"]',

  // Widget cards
  totalWorkflowsCard: card("Total Workflows"),
  contentsInProgressCard: card("Contents In Progress"),
  myPendingActionsCard: card("My Pending Actions"),
  publishReadyContentsCard: card("Publish-Ready Contents"),
  workflowStatusCard: card("Workflow Status"),
  myBrandsAndProductsCard: card("My Brands & Products"),
  workflowCreationTrendCard: card("Workflow Creation Trend"),
  stageFunnelCard: card("Stage Funnel"),
  roleWorkloadOverviewCard: card("Role Workload Overview"),

  // Stat widgets: the animated count keeps its final value in aria-label
  statCount: (statCard: string) => `${statCard}//span[contains(@class,"t-digit-group")]`,
  statBadge: (statCard: string) => `${statCard}//span[@data-slot="badge"]`,
  cardText: (anyCard: string, text: string) =>
    `(${anyCard}//*[normalize-space(text())="${text}"])[1]`,

  // Workflow Status chart
  workflowStatusTotal: `${card("Workflow Status")}//span[normalize-space()="Total"]/preceding-sibling::span[1]`,
  workflowStatusRows: `${card("Workflow Status")}//div[contains(concat(" ",@class," ")," group ")]`,
  workflowStatusRowLabel: (n: number) =>
    `(${card("Workflow Status")}//div[contains(concat(" ",@class," ")," group ")])[${n}]/div[1]/span`,
  workflowStatusRowCount: (n: number) =>
    `(${card("Workflow Status")}//div[contains(concat(" ",@class," ")," group ")])[${n}]/div[2]/span[1]`,
  workflowStatusRowPercent: (n: number) =>
    `(${card("Workflow Status")}//div[contains(concat(" ",@class," ")," group ")])[${n}]/div[2]/span[2]`,

  // My Brands & Products
  brandsProductsCount: (label: "Brands" | "Products") =>
    `${card("My Brands & Products")}//span[normalize-space()="${label}"]/preceding-sibling::div/span`,
  brandsProductsHeading: (label: "Brands" | "Products") =>
    `${card("My Brands & Products")}//div[contains(@class,"uppercase") and normalize-space()="${label}"]`,
  brandsProductsItems: (label: "Brands" | "Products") =>
    `${card("My Brands & Products")}//div[contains(@class,"uppercase") and normalize-space()="${label}"]/following-sibling::div[1]/*`,

  // Workflow Creation Trend chart
  trendChart: `${card("Workflow Creation Trend")}//*[name()="svg" and contains(@class,"recharts-surface")]`,
  trendXAxisTicks: `${card("Workflow Creation Trend")}//*[name()="g" and contains(@class,"recharts-xAxis")]//*[name()="tspan"]`,

  // Stage Funnel
  stageFunnelRows: `${card("Stage Funnel")}//div[@class="group"]`,
  stageFunnelRowLabel: (n: number) =>
    `(${card("Stage Funnel")}//div[@class="group"])[${n}]/div[1]/span`,
  stageFunnelRowCount: (n: number) =>
    `(${card("Stage Funnel")}//div[@class="group"])[${n}]/div[1]/div/span[1]`,
  stageFunnelRowPercent: (n: number) =>
    `(${card("Stage Funnel")}//div[@class="group"])[${n}]/div[1]/div/span[2]`,

  // Role Workload Overview
  roleWorkloadItems: (role: string) =>
    `${card("Role Workload Overview")}//div[span[normalize-space()="${role}"]]/span[2]`,
};