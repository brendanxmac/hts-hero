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
  CLICKED_TARIFF_IMPACT_UPGRADE = "Tariff Impact Upgrade Clicked",
  INITIATED_IMPACT_STARTER_CHECKOUT = "Impact Starter Checkout Clicked",
  INITIATED_IMPACT_STANDARD_CHECKOUT = "Impact Standard Checkout Clicked",
  INITIATED_IMPACT_PRO_CHECKOUT = "Impact Pro Checkout Clicked",
  INITIATED_CLASSIFY_PRO_CHECKOUT = "Classify Pro Checkout Clicked",
  CODE_SET_CREATED = "Code Set Created",
  TARIFF_IMPACT_CHECK = "Tariff Impact Check",
  CLASSIFICATION_STARTED = "Classification Started",
  CLASSIFICATION_COMPLETED = "Classification Completed",
  SIGN_UP = "Sign Up",
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
