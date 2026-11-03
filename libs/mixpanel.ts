import mixpanel from "mixpanel-browser"

// Initialize Mixpanel with your project token
// You'll need to replace this with your actual Mixpanel project token
const MIXPANEL_TOKEN = process.env.NEXT_PUBLIC_MIXPANEL_TOKEN || ""

// Scripted browsers (Puppeteer, Playwright, Selenium, headless Chrome) and crawlers that run
// JavaScript aren't tracked: they inflated visitors and every funnel (2026-10 scraper traffic). Most
// of that traffic is stopped by the Vercel Firewall before the page loads; this catches the rest
// that says what it is.
const isAutomated = () =>
  navigator.webdriver === true || /bot\/|crawler|spider|HeadlessChrome|PhantomJS|Lighthouse/i.test(navigator.userAgent)

const ENABLED = typeof window !== "undefined" && !!MIXPANEL_TOKEN && !isAutomated()

// Browser-side Mixpanel initialization
if (ENABLED) {
  mixpanel.init(MIXPANEL_TOKEN, {
    debug: process.env.NODE_ENV === "development",
    // Page views on client-side navigation too (Next <Link> between /hts pages), not just full loads
    track_pageview: "url-with-path",
    persistence: "localStorage",
  })
}

export enum MixpanelEvent {
  CLICKED_TARIFF_IMPACT_UPGRADE = "Tariff Impact Upgrade Clicked",
  INITIATED_IMPACT_STANDARD_CHECKOUT = "Impact Standard Checkout Clicked",
  INITIATED_IMPACT_PRO_CHECKOUT = "Impact Pro Checkout Clicked",
  INITIATED_CLASSIFY_STARTER_CHECKOUT = "Classify Starter Checkout Clicked",
  INITIATED_CLASSIFY_PRO_CHECKOUT = "Classify Pro Checkout Clicked",
  CLICKED_CLASSIFY_PRO_UPGRADE = "Classify Pro Upgrade Clicked",
  CLICKED_CLASSIFY_TEAM_LETS_TALK = "Classify Team Let's Talk Clicked",
  CLICKED_TARIFF_TEAM_LETS_TALK = "Tariff Team Let's Talk Clicked",
  CODE_SET_CREATED = "Code Set Created",
  TARIFF_IMPACT_CHECK = "Tariff Impact Check",
  /** One per classification created, signed in or not (is_anonymous), always with classification_id */
  CLASSIFICATION_STARTED = "Classification Started",
  /** The first time a classification reaches a final 10-digit code (once per classification_id) */
  CLASSIFICATION_COMPLETED = "Classification Completed",
  /** A classification attempt stopped by a limit (block_reason): the sign-up gate or the pricing modal */
  CLASSIFICATION_BLOCKED = "Classification Blocked",
  SIGN_UP = "Sign Up",
  /** /signup: a way to sign up was picked (method: google, email_password or email_code; redirect) */
  SIGN_UP_STARTED = "Sign Up Started",
  // The sign-up onboarding (/onboarding): opened (with the first touch), each question answered
  // (step, step_number, answer), the website skipped, and finished. A funnel of these shows where
  // people stop
  /** A sign-up button clicked (EntryCta): page (home, tariff-alerts, duty-audits), entry (where the
   *  sign-up starts), section (where on the page), label, signed_in */
  SIGNUP_CTA_CLICKED = "Sign Up CTA Clicked",
  /** The homepage's "Get a Demo": the form opened, and sent (then on to Calendly): company_type, role, products */
  DEMO_FORM_OPENED = "Demo Form Opened",
  DEMO_REQUESTED = "Demo Requested",
  ONBOARDING_STARTED = "Onboarding Started",
  ONBOARDING_STEP_COMPLETED = "Onboarding Step Completed",
  ONBOARDING_WEBSITE_SKIPPED = "Onboarding Website Skipped",
  ONBOARDING_COMPLETED = "Onboarding Completed",
  /** The Tariff Tracker onboarding after the sign-up onboarding (TrackerOnboarding): shown (focus:
   *  imports or alerts), each screen, "Add my imports", and skipped */
  TRACKER_WELCOME_SHOWN = "Tracker Welcome Shown",
  TRACKER_WELCOME_STEP = "Tracker Welcome Step",
  TRACKER_WELCOME_ADD_IMPORTS = "Tracker Welcome Add Imports",
  TRACKER_WELCOME_SKIPPED = "Tracker Welcome Skipped",
  /** The classification tour after the sign-up onboarding: shown, each step (step, index, of), ended (how: finished or skipped) */
  CLASSIFY_TOUR_SHOWN = "Classify Tour Shown",
  CLASSIFY_TOUR_STEP = "Classify Tour Step",
  CLASSIFY_TOUR_ENDED = "Classify Tour Ended",
  CLASSIFY_ONBOARDING_SHOWN = "Classify Onboarding Shown",
  CLASSIFY_ONBOARDING_STEP = "Classify Onboarding Step",
  CLASSIFY_ONBOARDING_STARTED = "Classify Onboarding Started",
  CLASSIFY_ONBOARDING_SKIPPED = "Classify Onboarding Skipped",
  TARIFF_IMPACT_TRIAL_STARTED = "Tariff Impact Trial Started",
  /** The Tracker's 14-day trial began (the account's first real imports), once per account */
  TARIFF_TRACKER_TRIAL_STARTED = "Tariff Tracker Trial Started",
  /** Server (Stripe webhook): a checkout paid, any plan (plan, is_tracker_plan, amount_usd) */
  PURCHASE_COMPLETED = "Purchase Completed",
  /** Server (Stripe webhook): a subscription ended for good (cancelled, or payments failed) */
  SUBSCRIPTION_ENDED = "Subscription Ended",
  /** Public read-only link enabled or disabled */
  CLASSIFICATION_PUBLIC_SHARE_TOGGLED = "Classification Public Share Toggled",
  CLASSIFICATION_PUBLIC_LINK_COPIED = "Classification Public Link Copied",
  CLASSIFICATION_LINK_COPIED = "Classification Link Copied",
  /** Someone opened a /c/[token] shared classification */
  SHARED_CLASSIFICATION_VIEWED = "Shared Classification Viewed",
  CANDIDATE_SELECTED = "Candidate Selected",
  /** The Share button: opens the share options (sharing itself is Public Share Toggled / Link Copied) */
  CLASSIFICATION_SHARE_OPENED = "Classification Share Opened",
  CLASSIFICATION_REPORT_DOWNLOADED = "Classification Report Downloaded",
  CLASSIFICATION_STATUS_CHANGED = "Classification Status Changed",
  CLASSIFICATION_DELETED = "Classification Deleted",
  CLASSIFICATION_COO_SET = "Classification COO Set",
  CLASSIFICATION_TAB_SELECTED = "Classification Tab Selected",
  /** Research / Legal Notes / CROSS Rulings panel on a classification step */
  CLASSIFICATION_STEP_TAB_SWITCH = "Classification Step Tab Switch",
  /** Duty / tariff calculator (TariffFinderPage) */
  /** Once per visit to /duty-calculator: how it began (arrival, link_source) and what the link carried */
  DUTY_CALCULATOR_PAGE_LOADED = "Duty Calculator Page Loaded",
  /** Arrived on a calculator link with a code; not on reloads, back/forward or explorer-modal picks */
  DUTY_CALCULATOR_DEEP_LINK_OPENED = "Duty Calculator Deep Link Opened",
  DUTY_CALCULATOR_HTS_CODE_SELECTED = "Duty Calculator HTS Code Selected",
  DUTY_CALCULATOR_HTS_CODE_CLEARED = "Duty Calculator HTS Code Cleared",
  DUTY_CALCULATOR_EXPLORE_MODAL_OPENED = "Duty Calculator Explore Modal Opened",
  DUTY_CALCULATOR_EXPLORE_MODAL_CLOSED = "Duty Calculator Explore Modal Closed",
  DUTY_CALCULATOR_COUNTRY_CHANGED = "Duty Calculator Country Changed",
  DUTY_CALCULATOR_CUSTOMS_VALUE_SET = "Duty Calculator Customs Value Set",
  DUTY_CALCULATOR_UNITS_SET = "Duty Calculator Units Set",
  /** A duty result shown for a code and country, on any surface: the calculator or an embedded estimate */
  DUTY_CALCULATOR_RESULTS_VIEWED = "Duty Calculator Results Viewed",
  DUTY_CALCULATOR_SUPPORT_CLICKED = "Duty Calculator Support Clicked",
  DUTY_CALCULATOR_ENTRY_DATE_SET = "Duty Calculator Entry Date Set",
  DUTY_CALCULATOR_TRANSPORT_MODE_SET = "Duty Calculator Transport Mode Set",
  DUTY_CALCULATOR_VIEW_CHANGED = "Duty Calculator View Changed",
  DUTY_CALCULATOR_QUESTION_ANSWERED = "Duty Calculator Question Answered",
  DUTY_CALCULATOR_PREFERENCE_CLAIMED = "Duty Calculator Trade Preference Claimed",
  DUTY_CALCULATOR_EXAMPLE_SELECTED = "Duty Calculator Example Selected",
  DUTY_CALCULATOR_COMPARE_CHANGED = "Duty Calculator Compare Countries Changed",
  /** Duty estimate embedded in the explorer, a classification or an HTS code page, opened in the calculator */
  DUTY_ESTIMATE_OPENED_IN_CALCULATOR = "Duty Estimate Opened in Calculator",
  /** A call to action on the tariffs-by-country hub: cta (calculator | tracker | csv) and where on the page */
  COUNTRIES_HUB_CTA_CLICKED = "Countries Hub CTA Clicked",
  /** Tariff Tracker (/tariff-tracker). Was the Tariff Watcher tab, as "Tariff Watcher …" events */
  TARIFF_TRACKER_PRODUCTS_ADDED = "Tariff Tracker Products Added",
  TARIFF_MONITOR_PRODUCT_CHECKED = "Tariff Monitor Product Checked",
  TARIFF_MONITOR_TRACK_CLICKED = "Tariff Monitor Track Clicked",
  TARIFF_AUDIT_REQUESTED = "Tariff Audit Requested",
  TARIFF_TRACKER_PRODUCTS_REMOVED = "Tariff Tracker Products Removed",
  TARIFF_TRACKER_CSV_TEMPLATE_DOWNLOADED = "Tariff Tracker CSV Template Downloaded",
  TARIFF_TRACKER_DATE_SET = "Tariff Tracker Date Set",
  TARIFF_TRACKER_PRODUCT_ADJUSTED = "Tariff Tracker Product Adjusted",
  TARIFF_TRACKER_ADJUSTMENTS_RESET = "Tariff Tracker Adjustments Reset",
  TARIFF_TRACKER_FILTERED = "Tariff Tracker Filtered",
  TARIFF_TRACKER_EXPORTED = "Tariff Tracker Exported",
  TARIFF_TRACKER_PRODUCT_OPENED = "Tariff Tracker Product Opened",
  /** Funnel (PRICING.md): a locked feature shown, and its call to action clicked */
  LOCKED_FEATURE_VIEWED = "Locked Feature Viewed",
  LOCKED_FEATURE_CTA_CLICKED = "Locked Feature CTA Clicked",
  TARIFF_TRACKER_COVERAGE_CHANGED = "Tariff Tracker Coverage Changed",
  /** A trial allowance spent (a savings or audit check), and one that ran out */
  TARIFF_TRACKER_CHECK_SPENT = "Tariff Tracker Check Spent",
  TARIFF_TRACKER_ALLOWANCE_USED_UP = "Tariff Tracker Allowance Used Up",
  TARIFF_TRACKER_ENTRY_AUDITED = "Tariff Tracker Entry Audited",
  /** A savings opportunity tracked, or moved to a new status (product Savings tab) */
  TARIFF_TRACKER_OPPORTUNITY_CHANGED = "Tariff Tracker Opportunity Changed",
  TARIFF_TRACKER_SAVING_APPLIED = "Tariff Tracker Saving Applied",
  TARIFF_TRACKER_PRODUCT_TAB_OPENED = "Tariff Tracker Product Tab Opened",
  TARIFF_TRACKER_UPGRADE_OPENED = "Tariff Tracker Upgrade Opened",
  TARIFF_TRACKER_CHECKOUT_STARTED = "Tariff Tracker Checkout Started",
  TARIFF_TRACKER_CATALOG_SYNCED = "Tariff Tracker Catalog Synced",
  TARIFF_TRACKER_ALERTS_SAVED = "Tariff Tracker Alerts Saved",
  /** "Add to Slack" in the Alerts tab: clicked, back from Slack connected, disconnected */
  TARIFF_TRACKER_SLACK_CONNECT_STARTED = "Tariff Tracker Slack Connect Started",
  TARIFF_TRACKER_SLACK_CONNECTED = "Tariff Tracker Slack Connected",
  TARIFF_TRACKER_SLACK_DISCONNECTED = "Tariff Tracker Slack Disconnected",
  /** The Teams box in the Alerts tab: steps opened, disconnected */
  TARIFF_TRACKER_TEAMS_STEPS_OPENED = "Tariff Tracker Teams Steps Opened",
  TARIFF_TRACKER_TEAMS_DISCONNECTED = "Tariff Tracker Teams Disconnected",
  /** "Send Test" for a Slack or Teams channel in the Alerts tab */
  TARIFF_TRACKER_ALERT_TEST_SENT = "Tariff Tracker Alert Test Sent",
  TARIFF_TRACKER_LOOKUPS_ADDED = "Tariff Tracker Lookups Added",
  // The first-run import takeover (components/tariff-tracker/onboarding): shown, each step seen,
  // imports added through it, skipped (and why), and the "don't have it handy" help used
  TARIFF_TRACKER_ONBOARDING_SHOWN = "Tariff Tracker Onboarding Shown",
  TARIFF_TRACKER_ONBOARDING_STEP = "Tariff Tracker Onboarding Step",
  TARIFF_TRACKER_ONBOARDING_COMPLETED = "Tariff Tracker Onboarding Completed",
  TARIFF_TRACKER_ONBOARDING_SKIPPED = "Tariff Tracker Onboarding Skipped",
  TARIFF_TRACKER_ONBOARDING_HELP_USED = "Tariff Tracker Onboarding Help Used",
  TARIFF_TRACKER_TOUR_SHOWN = "Tariff Tracker Tour Shown",
  TARIFF_TRACKER_TOUR_STEP = "Tariff Tracker Tour Step",
  TARIFF_TRACKER_TOUR_COMPLETED = "Tariff Tracker Tour Completed",
  TARIFF_TRACKER_TOUR_CLOSED = "Tariff Tracker Tour Closed",
  TARIFF_TRACKER_TOUR_ACTION = "Tariff Tracker Tour Action",
  /** User copied the shareable Tariff Calculator link */
  DUTY_CALCULATOR_SHARE_RESULTS_COPIED = "Duty Calculator Share Results Copied",
  /** A tool call to the MCP server (Claude, ChatGPT and other AI clients) */
  MCP_TOOL_CALLED = "MCP Tool Called",
  /** An /hts/[code] page shown (hts_code, chapter, digit_count) */
  HTS_CODE_PAGE_VIEWED = "HTS Code Page Viewed",
  /** "Watch this code" submitted on an /hts/[code] page (hts_code, country_code, signed_in, digest) */
  HTS_CODE_WATCH_SUBMITTED = "HTS Code Watch Submitted",
  /** The arrival panel on an import's first visit from Get Alerts / Stop Overpaying: action shown, add_imports, explore or dismissed; source watch or track */
  TARIFF_TRACKER_ARRIVAL_PANEL = "Tariff Tracker Arrival Panel",
  /** HTS Explorer (/explore and embedded Explore) */
  EXPLORER_COMPLETED_CODE_SEARCH = "Explorer Completed a Code Search",
  EXPLORER_CLEARED_SEARCH = "Explorer Cleared Search",
  EXPLORER_OPENED_CODES_TAB = "Explorer Opened Codes Tab",
  EXPLORER_OPENED_NOTES_TAB = "Explorer Opened Notes Tab",
  EXPLORER_COMPLETED_NOTES_SEARCH = "Explorer Completed a Notes Search",
  /** Hierarchy moves: deeper, back, breadcrumb, chapter, search, URL code, etc. */
  EXPLORER_NAVIGATED_TO_LEVEL = "Explorer Navigated to Level",
  // Subscribed to tariff news on /tariff-updates (source: the page it was on)
  TARIFF_UPDATES_SUBSCRIBED = "Tariff Updates Subscribed",
  // After subscribing: "Create my free account" for the Tariff Tracker
  TARIFF_UPDATES_TRACKER_UPSELL_CLICKED = "Tariff Updates Tracker Upsell Clicked",
  // A code checked in the /tariffs pages' "Is your code on a list?" box (program: the page's slug, or "all")
  TARIFF_PROGRAM_CODE_CHECKED = "Tariff Program Code Checked",
}

// Browser-side tracking functions
export const trackEvent = (
  eventName: MixpanelEvent,
  properties?: Record<string, any>,
) => {
  if (ENABLED) {
    mixpanel.track(eventName, properties)
  }
}

export const identifyUser = (
  userId: string,
  userProperties?: Record<string, any>,
) => {
  if (ENABLED) {
    mixpanel.identify(userId)
    if (userProperties) {
      mixpanel.people.set(userProperties)
    }
  }
}

export const resetUser = () => {
  if (ENABLED) {
    mixpanel.reset()
  }
}

// Tracks an event once per browser for `key` (a classification completed, a gate seen), so
// re-renders, re-opens and repeat visits don't count it again
export const trackEventOnce = (
  key: string,
  eventName: MixpanelEvent,
  properties?: Record<string, any>,
) => {
  if (!ENABLED) return
  const storageKey = `mp-once:${key}`
  try {
    if (localStorage.getItem(storageKey)) return
    localStorage.setItem(storageKey, "1")
  } catch {
    // Storage blocked: track anyway
  }
  mixpanel.track(eventName, properties)
}

/** Included on all subsequent events until changed (e.g. is_anonymous for segmentation). */
export const registerMixpanelSuperProperties = (
  properties: Record<string, unknown>,
) => {
  if (ENABLED) {
    mixpanel.register(properties)
  }
}
