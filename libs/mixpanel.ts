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
  /** Duty / tariff calculator (TariffFinderPage) */
  DUTY_CALCULATOR_PAGE_LOADED = "Duty Calculator Page Loaded",
  DUTY_CALCULATOR_DEEP_LINK_OPENED = "Duty Calculator Deep Link Opened",
  DUTY_CALCULATOR_HTS_CODE_SELECTED = "Duty Calculator HTS Code Selected",
  DUTY_CALCULATOR_HTS_CODE_CLEARED = "Duty Calculator HTS Code Cleared",
  DUTY_CALCULATOR_EXPLORE_MODAL_OPENED = "Duty Calculator Explore Modal Opened",
  DUTY_CALCULATOR_EXPLORE_MODAL_CLOSED = "Duty Calculator Explore Modal Closed",
  DUTY_CALCULATOR_COUNTRY_CHANGED = "Duty Calculator Country Changed",
  DUTY_CALCULATOR_CUSTOMS_VALUE_SET = "Duty Calculator Customs Value Set",
  DUTY_CALCULATOR_UNITS_SET = "Duty Calculator Units Set",
  DUTY_CALCULATOR_CONTENT_PERCENTAGE_SET = "Duty Calculator Content Percentage Set",
  DUTY_CALCULATOR_RESULTS_VIEWED = "Duty Calculator Results Viewed",
  DUTY_CALCULATOR_SUPPORT_CLICKED = "Duty Calculator Support Clicked",
  /** User copied the shareable duty-calculator URL from CountryTariff */
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
