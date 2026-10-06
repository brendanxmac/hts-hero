import mixpanel from "mixpanel-browser"

// Initialize Mixpanel with your project token
// You'll need to replace this with your actual Mixpanel project token
const MIXPANEL_TOKEN = process.env.NEXT_PUBLIC_MIXPANEL_TOKEN || ""

// Browser-side Mixpanel initialization
if (typeof window !== "undefined" && MIXPANEL_TOKEN) {
  mixpanel.init(MIXPANEL_TOKEN, {
    debug: process.env.NODE_ENV === "development",
    track_pageview: true,
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
  CLASSIFICATION_STARTED = "Classification Started",
  CLASSIFICATION_COMPLETED = "Classification Completed",
  SIGN_UP = "Sign Up",
  TARIFF_IMPACT_TRIAL_STARTED = "Tariff Impact Trial Started",
  /** Logged-out user created a classification (browser session) */
  ANONYMOUS_CLASSIFICATION_STARTED = "Anonymous Classification Started",
  /** Logged-out user reached a final HTS selection */
  ANONYMOUS_CLASSIFICATION_COMPLETED = "Anonymous Classification Completed",
  /** Public read-only link enabled or disabled */
  CLASSIFICATION_PUBLIC_SHARE_TOGGLED = "Classification Public Share Toggled",
  CLASSIFICATION_PUBLIC_LINK_COPIED = "Classification Public Link Copied",
  CLASSIFICATION_LINK_COPIED = "Classification Link Copied",
  /** Someone opened a /c/[token] shared classification */
  SHARED_CLASSIFICATION_VIEWED = "Shared Classification Viewed",
  CANDIDATE_SELECTED = "Candidate Selected",
  CLASSIFICATION_SHARED = "Classification Shared",
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
  DUTY_CALCULATOR_CONTENT_PERCENTAGE_SET = "Duty Calculator Content Percentage Set",
  /** A duty result shown for a code and country, on any surface: the calculator or an embedded estimate */
  DUTY_CALCULATOR_RESULTS_VIEWED = "Duty Calculator Results Viewed",
  DUTY_CALCULATOR_SUPPORT_CLICKED = "Duty Calculator Support Clicked",
  DUTY_CALCULATOR_ENTRY_DATE_SET = "Duty Calculator Entry Date Set",
  DUTY_CALCULATOR_TRANSPORT_MODE_SET = "Duty Calculator Transport Mode Set",
  DUTY_CALCULATOR_VIEW_CHANGED = "Duty Calculator View Changed",
  DUTY_CALCULATOR_QUESTION_ANSWERED = "Duty Calculator Question Answered",
  DUTY_CALCULATOR_PREFERENCE_CLAIMED = "Duty Calculator Trade Preference Claimed",
  DUTY_CALCULATOR_RESULTS_COPIED = "Duty Calculator Results Copied",
  DUTY_CALCULATOR_EXAMPLE_SELECTED = "Duty Calculator Example Selected",
  DUTY_CALCULATOR_COMPARE_CHANGED = "Duty Calculator Compare Countries Changed",
  /** Duty estimate embedded in the explorer, a classification or an HTS code page, opened in the calculator */
  DUTY_ESTIMATE_OPENED_IN_CALCULATOR = "Duty Estimate Opened in Calculator",
  /** Tariff Tracker (/tariff-tracker). Was the Tariff Watcher tab, as "Tariff Watcher …" events */
  TARIFF_TRACKER_PRODUCTS_ADDED = "Tariff Tracker Products Added",
  TARIFF_TRACKER_PRODUCTS_REMOVED = "Tariff Tracker Products Removed",
  TARIFF_TRACKER_CSV_TEMPLATE_DOWNLOADED = "Tariff Tracker CSV Template Downloaded",
  TARIFF_TRACKER_EXAMPLE_USED = "Tariff Tracker Example Used",
  TARIFF_TRACKER_DATE_SET = "Tariff Tracker Date Set",
  TARIFF_TRACKER_PRODUCT_ADJUSTED = "Tariff Tracker Product Adjusted",
  TARIFF_TRACKER_ADJUSTMENTS_RESET = "Tariff Tracker Adjustments Reset",
  TARIFF_TRACKER_FILTERED = "Tariff Tracker Filtered",
  TARIFF_TRACKER_SORTED = "Tariff Tracker Sorted",
  TARIFF_TRACKER_EXPORTED = "Tariff Tracker Exported",
  TARIFF_TRACKER_PRODUCT_OPENED = "Tariff Tracker Product Opened",
  TARIFF_TRACKER_ANALYSIS_VIEWED = "Tariff Tracker Analysis Viewed",
  TARIFF_TRACKER_ANALYSIS_BASIS_CHANGED = "Tariff Tracker Analysis Basis Changed",
  TARIFF_TRACKER_ANALYSIS_ORIGIN_SELECTED = "Tariff Tracker Analysis Origin Selected",
  TARIFF_TRACKER_ANALYSIS_COUNTRIES_CHOSEN = "Tariff Tracker Analysis Countries Chosen",
  /** User copied the shareable Tariff Calculator link */
  DUTY_CALCULATOR_SHARE_RESULTS_COPIED = "Duty Calculator Share Results Copied",
  /** HTS Explorer (/explore and embedded Explore) */
  EXPLORER_FINISHED_LOADING = "Explorer Finished Loading",
  EXPLORER_COMPLETED_CODE_SEARCH = "Explorer Completed a Code Search",
  EXPLORER_CLEARED_SEARCH = "Explorer Cleared Search",
  EXPLORER_OPENED_CODES_TAB = "Explorer Opened Codes Tab",
  EXPLORER_OPENED_NOTES_TAB = "Explorer Opened Notes Tab",
  EXPLORER_COMPLETED_NOTES_SEARCH = "Explorer Completed a Notes Search",
  /** Hierarchy moves: deeper, back, breadcrumb, chapter, search, URL code, etc. */
  EXPLORER_NAVIGATED_TO_LEVEL = "Explorer Navigated to Level",
}

// Browser-side tracking functions
export const trackEvent = (
  eventName: MixpanelEvent,
  properties?: Record<string, any>,
) => {
  if (typeof window !== "undefined" && MIXPANEL_TOKEN) {
    mixpanel.track(eventName, properties)
  }
}

export const identifyUser = (
  userId: string,
  userProperties?: Record<string, any>,
) => {
  if (typeof window !== "undefined" && MIXPANEL_TOKEN) {
    mixpanel.identify(userId)
    if (userProperties) {
      mixpanel.people.set(userProperties)
    }
  }
}

export const resetUser = () => {
  if (typeof window !== "undefined" && MIXPANEL_TOKEN) {
    mixpanel.reset()
  }
}

/** Included on all subsequent events until changed (e.g. is_anonymous for segmentation). */
export const registerMixpanelSuperProperties = (
  properties: Record<string, unknown>,
) => {
  if (typeof window !== "undefined" && MIXPANEL_TOKEN) {
    mixpanel.register(properties)
  }
}
