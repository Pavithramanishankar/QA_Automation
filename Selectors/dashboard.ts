export const dashboardSelectors = {
  // Sidebar
  sidebarDashboard: '(//a[normalize-space()="Dashboard"])[1]',
  sidebarHiveFlow: '//a[normalize-space()="HiveFlow"]',
  sidebarHiveCore: '//a[normalize-space()="HiveCore"]',
  sidebarContentCalendar: '//a[normalize-space()="Content Calendar"]',
  sidebarConceptForge: '//a[normalize-space()="ConceptForge"]',
  sidebarBrandNest: '//a[normalize-space()="BrandNest"]',
  sidebarSettings: '//a[normalize-space()="Settings"]',

  // Header
  greeting: '//*[starts-with(normalize-space(text()),"Hey,")]',
  showMyTasksButton: '//button[contains(normalize-space(),"Show my Tasks")]',
  loadingDashboard: '//*[contains(text(),"Loading your dashboard")]',

  // Timeframe selector
  timeframeLabel: '//*[normalize-space(text())="Timeframe"]',
  timeframeToday: '//button[normalize-space()="Today"]',
  timeframe30D: '//button[normalize-space()="30D"]',
  timeframe1Year: '//button[normalize-space()="1 Year"]',
  timeframeCustom: '//button[normalize-space()="Custom"]',

  // Custom date picker
  calendar: '//*[normalize-space(text())="Custom Date Range"]',
  calendarDay: (day: number) =>
    `(//*[@role="dialog"]//button[not(@disabled) and normalize-space()="${day}"])[1]`,
  calendarApplyButton: '//button[normalize-space()="Apply"]',

  // Widgets
  totalWorkflows: '//*[normalize-space(text())="Total Workflows"]',
  contentsInProgress: '//*[normalize-space(text())="Contents In Progress"]',
  myPendingActions: '//*[normalize-space(text())="My Pending Actions"]',
  publishReadyContents: '//*[normalize-space(text())="Publish-Ready Contents"]',
  workflowStatus: '//*[normalize-space(text())="Workflow Status"]',
  myBrandsAndProducts: '//*[normalize-space(text())="My Brands & Products"]',
  workflowCreationTrend: '//*[normalize-space(text())="Workflow Creation Trend"]',
  stageFunnel: '//*[normalize-space(text())="Stage Funnel"]',
  roleWorkloadOverview: '//*[normalize-space(text())="Role Workload Overview"]',

  // Current date block
  dateDay: (day: number) => `(//*[normalize-space(text())="${day}"])[1]`,
  dateWeekday: (weekday: string) =>
    `(//*[starts-with(normalize-space(text()),"${weekday}")])[1]`,
  dateMonth: (month: string) => `(//*[normalize-space(text())="${month}"])[1]`,
};
