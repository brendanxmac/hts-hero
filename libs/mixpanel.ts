import mixpanel from "mixpanel-browser";

// Initialize Mixpanel with your project token
// You'll need to replace this with your actual Mixpanel project token
const MIXPANEL_TOKEN = process.env.NEXT_PUBLIC_MIXPANEL_TOKEN || "";

// Browser-side Mixpanel initialization
if (typeof window !== "undefined" && MIXPANEL_TOKEN) {
  mixpanel.init(MIXPANEL_TOKEN, {
    debug: process.env.NODE_ENV === "development",
    track_pageview: true,
    persistence: "localStorage",
  });
}

export enum MixpanelEvent {
  TARIFF_IMPACT_CHECK = "tariff_impact_check",
  TARIFF_IMPACT_CHECK_FROM_SET = "tariff_impact_check_from_set",
  CLASSIFICATION_STARTED = "classification_started",
  CLASSIFICATION_COMPLETED = "classification_completed",
  SIGN_UP = "sign_up",
}

// Browser-side tracking functions
export const trackEvent = (
  eventName: MixpanelEvent,
  properties?: Record<string, any>
) => {
  if (typeof window !== "undefined" && MIXPANEL_TOKEN) {
    mixpanel.track(eventName, properties);
  }
};

export const identifyUser = (
  userId: string,
  userProperties?: Record<string, any>
) => {
  if (typeof window !== "undefined" && MIXPANEL_TOKEN) {
    mixpanel.identify(userId);
    if (userProperties) {
      mixpanel.people.set(userProperties);
    }
  }
};

export const resetUser = () => {
  if (typeof window !== "undefined" && MIXPANEL_TOKEN) {
    mixpanel.reset();
  }
};
