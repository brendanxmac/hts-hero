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
  /** The Duty Guard onboarding after the sign-up onboarding (TrackerOnboarding): shown (focus:
   *  imports or alerts), each screen, "Add my imports", and skipped */
  DUTY_GUARD_WELCOME_SHOWN = "Duty Guard Welcome Shown",
  DUTY_GUARD_WELCOME_STEP = "Duty Guard Welcome Step",
  DUTY_GUARD_WELCOME_ADD_IMPORTS = "Duty Guard Welcome Add Imports",
  DUTY_GUARD_WELCOME_SKIPPED = "Duty Guard Welcome Skipped",
  /** The classification tour after the sign-up onboarding: shown, each step (step, index, of), ended (how: finished or skipped) */
  CLASSIFY_TOUR_SHOWN = "Classify Tour Shown",
  CLASSIFY_TOUR_STEP = "Classify Tour Step",
  CLASSIFY_TOUR_ENDED = "Classify Tour Ended",
  CLASSIFY_ONBOARDING_SHOWN = "Classify Onboarding Shown",
  CLASSIFY_ONBOARDING_STEP = "Classify Onboarding Step",
  CLASSIFY_ONBOARDING_STARTED = "Classify Onboarding Started",
  CLASSIFY_ONBOARDING_SKIPPED = "Classify Onboarding Skipped",
  TARIFF_IMPACT_TRIAL_STARTED = "Tariff Impact Trial Started",
  /** Server (daily cron, libs/tariff-tracker/trialEvents.ts): the Duty Guard trial began (the
   *  account's first real imports), at the time it began, once per account */
  DUTY_GUARD_TRIAL_STARTED = "Duty Guard Trial Started",
  /** Server (daily cron): the trial ran out (converted: on a paid plan by then) */
  DUTY_GUARD_TRIAL_ENDED = "Duty Guard Trial Ended",
  /** Server (Stripe webhook): a checkout paid, any plan (plan, is_tracker_plan, amount_usd) */
  PURCHASE_COMPLETED = "Purchase Completed",
  /** Server (Stripe webhook): a subscription ended for good (cancelled, or payments failed) */
  SUBSCRIPTION_ENDED = "Subscription Ended",
  /** Server (Stripe webhook): a renewal paid (plan, amount_usd) */
  SUBSCRIPTION_RENEWED = "Subscription Renewed",
  /** Server (Stripe webhook): a plan changed in the billing portal (plan, from_plan, billing, amount_usd) */
  PLAN_CHANGED = "Plan Changed",
  /** Server (Stripe webhook): a payment failed (Stripe retries; Subscription Ended if they all fail) */
  PAYMENT_FAILED = "Payment Failed",
  /** Server (Stripe webhook): a checkout opened and left until it expired */
  CHECKOUT_ABANDONED = "Checkout Abandoned",
  /** An explicit sign-out */
  SIGNED_OUT = "Signed Out",
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
  /** A "Search CROSS" link opened CBP's CROSS search in a new tab (surface: hts / explore / classification / classify_step) */
  CROSS_SEARCH_OPENED = "CROSS Search Opened",
  /** A ruling number looked up (result: found / not_found / invalid / error) */
  CROSS_RULING_LOOKED_UP = "CROSS Ruling Looked Up",
  CROSS_EVIDENCE_ADDED = "CROSS Evidence Added",
  CROSS_EVIDENCE_REMOVED = "CROSS Evidence Removed",
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
  /** A results tab opened by the user (tab: duty, history, adcvd, news, compare; source) */
  DUTY_CALCULATOR_TAB_OPENED = "Duty Calculator Tab Opened",
  /** The calculator's sign-up dialog closed without signing up (feature, view) */
  CONVERSION_DIALOG_DISMISSED = "Conversion Dialog Dismissed",
  /** The full AD/CVD check shown, signed in (cases, petitions), once per code and country */
  ADCVD_CHECK_VIEWED = "ADCVD Check Viewed",
  /** An AD/CVD case answered: does it cover the goods (answer: yes, no, unsure) */
  ADCVD_CASE_ANSWERED = "ADCVD Case Answered",
  /** Duty estimate embedded in the explorer, a classification or an HTS code page, opened in the calculator */
  DUTY_ESTIMATE_OPENED_IN_CALCULATOR = "Duty Estimate Opened in Calculator",
  /** A call to action on the tariffs-by-country hub: cta (calculator | tracker | csv) and where on the page */
  COUNTRIES_HUB_CTA_CLICKED = "Countries Hub CTA Clicked",
  /** Duty Guard (/duty-guard). Named "Tariff Tracker …" until 2026-11-03: merge the old names into these in Lexicon */
  DUTY_GUARD_PRODUCTS_ADDED = "Duty Guard Products Added",
  TARIFF_AUDIT_REQUESTED = "Tariff Audit Requested",
  DUTY_GUARD_PRODUCTS_REMOVED = "Duty Guard Products Removed",
  // Import lists (one per client, for brokers): made, renamed, deleted, or switched to
  DUTY_GUARD_LIST_CREATED = "Duty Guard List Created",
  DUTY_GUARD_LIST_RENAMED = "Duty Guard List Renamed",
  DUTY_GUARD_LIST_DELETED = "Duty Guard List Deleted",
  DUTY_GUARD_LIST_SWITCHED = "Duty Guard List Switched",
  DUTY_GUARD_CSV_TEMPLATE_DOWNLOADED = "Duty Guard CSV Template Downloaded",
  DUTY_GUARD_DATE_SET = "Duty Guard Date Set",
  DUTY_GUARD_PRODUCT_ADJUSTED = "Duty Guard Product Adjusted",
  DUTY_GUARD_ADJUSTMENTS_RESET = "Duty Guard Adjustments Reset",
  DUTY_GUARD_FILTERED = "Duty Guard Filtered",
  DUTY_GUARD_EXPORTED = "Duty Guard Exported",
  DUTY_GUARD_PRODUCT_OPENED = "Duty Guard Product Opened",
  /** Funnel (PRICING.md): a locked feature shown, and its call to action clicked */
  LOCKED_FEATURE_VIEWED = "Locked Feature Viewed",
  LOCKED_FEATURE_CTA_CLICKED = "Locked Feature CTA Clicked",
  DUTY_GUARD_COVERAGE_CHANGED = "Duty Guard Coverage Changed",
  /** A trial allowance spent (a savings or audit check), and one that ran out */
  DUTY_GUARD_CHECK_SPENT = "Duty Guard Check Spent",
  DUTY_GUARD_ALLOWANCE_USED_UP = "Duty Guard Allowance Used Up",
  DUTY_GUARD_ENTRY_AUDITED = "Duty Guard Entry Audited",
  /** "Audit an Entry" clicked (resuming, from, audits_left) */
  DUTY_GUARD_ENTRY_AUDIT_STARTED = "Duty Guard Entry Audit Started",
  /** An audit's result shown (verdict, difference_usd, rates, AD/CVD cases, edited) */
  DUTY_GUARD_ENTRY_AUDIT_COMPLETED = "Duty Guard Entry Audit Completed",
  /** The audit closed (step: where they stopped, or results; finished) */
  DUTY_GUARD_ENTRY_AUDIT_CLOSED = "Duty Guard Entry Audit Closed",
  /** An import's Savings Review opened, and reaching its summary */
  DUTY_GUARD_SAVINGS_REVIEW_OPENED = "Duty Guard Savings Review Opened",
  DUTY_GUARD_SAVINGS_REVIEW_COMPLETED = "Duty Guard Savings Review Completed",
  /** A Duty Guard section (and view) shown: section, view, trigger (load or user) */
  DUTY_GUARD_SECTION_VIEWED = "Duty Guard Section Viewed",
  /** A savings opportunity tracked, or moved to a new status (product Savings tab) */
  DUTY_GUARD_OPPORTUNITY_CHANGED = "Duty Guard Opportunity Changed",
  DUTY_GUARD_SAVING_APPLIED = "Duty Guard Saving Applied",
  DUTY_GUARD_PRODUCT_TAB_OPENED = "Duty Guard Product Tab Opened",
  /** The plans dialog on screen (feature, trigger: user, link or trial_dialog) */
  DUTY_GUARD_UPGRADE_OPENED = "Duty Guard Upgrade Opened",
  /** The plans dialog closed without going to checkout */
  DUTY_GUARD_UPGRADE_DISMISSED = "Duty Guard Upgrade Dismissed",
  /** At the product limit: the limit dialog shown (its "See plans" is Upgrade Opened) */
  DUTY_GUARD_LIMIT_DIALOG_SHOWN = "Duty Guard Limit Dialog Shown",
  /** The trial ending / ended dialog Duty Guard opens by itself, and closed without upgrading */
  DUTY_GUARD_TRIAL_DIALOG_SHOWN = "Duty Guard Trial Dialog Shown",
  DUTY_GUARD_TRIAL_DIALOG_DISMISSED = "Duty Guard Trial Dialog Dismissed",
  /** Stripe's billing portal opened (manage billing, or a plan change) */
  DUTY_GUARD_BILLING_PORTAL_OPENED = "Duty Guard Billing Portal Opened",
  DUTY_GUARD_CHECKOUT_STARTED = "Duty Guard Checkout Started",
  DUTY_GUARD_CATALOG_SYNCED = "Duty Guard Catalog Synced",
  DUTY_GUARD_ALERTS_SAVED = "Duty Guard Alerts Saved",
  /** "Add to Slack" in the Alerts tab: clicked, back from Slack connected, disconnected */
  DUTY_GUARD_SLACK_CONNECT_STARTED = "Duty Guard Slack Connect Started",
  DUTY_GUARD_SLACK_CONNECTED = "Duty Guard Slack Connected",
  DUTY_GUARD_SLACK_DISCONNECTED = "Duty Guard Slack Disconnected",
  /** The Teams box in the Alerts tab: steps opened, disconnected */
  DUTY_GUARD_TEAMS_STEPS_OPENED = "Duty Guard Teams Steps Opened",
  DUTY_GUARD_TEAMS_DISCONNECTED = "Duty Guard Teams Disconnected",
  /** "Send Test" for a Slack or Teams channel in the Alerts tab */
  DUTY_GUARD_ALERT_TEST_SENT = "Duty Guard Alert Test Sent",
  DUTY_GUARD_LOOKUPS_ADDED = "Duty Guard Lookups Added",
  // The first-run import takeover (components/tariff-tracker/onboarding): shown, each step seen,
  // imports added through it, skipped (and why), and the "don't have it handy" help used
  DUTY_GUARD_ONBOARDING_SHOWN = "Duty Guard Onboarding Shown",
  DUTY_GUARD_ONBOARDING_STEP = "Duty Guard Onboarding Step",
  DUTY_GUARD_ONBOARDING_COMPLETED = "Duty Guard Onboarding Completed",
  DUTY_GUARD_ONBOARDING_SKIPPED = "Duty Guard Onboarding Skipped",
  DUTY_GUARD_ONBOARDING_HELP_USED = "Duty Guard Onboarding Help Used",
  DUTY_GUARD_TOUR_SHOWN = "Duty Guard Tour Shown",
  DUTY_GUARD_TOUR_STEP = "Duty Guard Tour Step",
  DUTY_GUARD_TOUR_COMPLETED = "Duty Guard Tour Completed",
  DUTY_GUARD_TOUR_CLOSED = "Duty Guard Tour Closed",
  DUTY_GUARD_TOUR_ACTION = "Duty Guard Tour Action",
  /** User copied the shareable Tariff Calculator link */
  DUTY_CALCULATOR_SHARE_RESULTS_COPIED = "Duty Calculator Share Results Copied",
  /** A tool call to the MCP server (Claude, ChatGPT and other AI clients) */
  MCP_TOOL_CALLED = "MCP Tool Called",
  /** An /hts/[code] page shown (hts_code, chapter, digit_count) */
  HTS_CODE_PAGE_VIEWED = "HTS Code Page Viewed",
  /** "Watch this code" submitted on an /hts/[code] page (hts_code, country_code, signed_in, digest) */
  HTS_CODE_WATCH_SUBMITTED = "HTS Code Watch Submitted",
  /** The arrival panel on an import's first visit from Get Alerts / Stop Overpaying: action shown, add_imports, explore or dismissed; source watch or track */
  DUTY_GUARD_ARRIVAL_PANEL = "Duty Guard Arrival Panel",
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
  // A "Get tariff updates" button anywhere on the site, opening /tariff-digest (source: where it was)
  TARIFF_DIGEST_CTA_CLICKED = "Tariff Digest CTA Clicked",
  // After subscribing: "Create my free account" for Duty Guard
  TARIFF_UPDATES_TRACKER_UPSELL_CLICKED = "Tariff Updates Tracker Upsell Clicked",
  // A code checked in the /tariffs pages' "Is your code on a list?" box (program: the page's slug, or "all")
  TARIFF_PROGRAM_CODE_CHECKED = "Tariff Program Code Checked",
  // "Check if you or your clients are affected" on a tariff update's page, signed in (result:
  // affected, not_affected, no_imports or error; signed-out clicks are SIGNUP_CTA_CLICKED)
  TARIFF_UPDATE_AFFECTED_CHECKED = "Tariff Update Affected Checked",
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

// Profile properties kept from the first time they're set (first touch, first plan)
export const setUserPropertiesOnce = (properties: Record<string, unknown>) => {
  if (ENABLED) {
    mixpanel.people.set_once(properties)
  }
}

// Profile properties that change (the Duty Guard plan), so funnels and cohorts can use them
// alongside server events
export const setUserProperties = (properties: Record<string, unknown>) => {
  if (ENABLED) {
    mixpanel.people.set(properties)
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
