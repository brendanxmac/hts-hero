import Mixpanel from "mixpanel";
import { MixpanelEvent } from "./mixpanel";

// Initialize Mixpanel with your project token
// You'll need to replace this with your actual Mixpanel project token
const MIXPANEL_TOKEN = process.env.NEXT_PUBLIC_MIXPANEL_TOKEN || "";

// Server-side Mixpanel initialization
let mixpanel: Mixpanel.Mixpanel | null = null;
if (MIXPANEL_TOKEN) {
  mixpanel = Mixpanel.init(MIXPANEL_TOKEN);
}

// Server-side tracking functions
export const trackEventServer = (
  eventName: MixpanelEvent,
  userId: string,
  properties?: Record<string, any>
) => {
  if (mixpanel) {
    mixpanel.track(eventName, {
      distinct_id: userId,
      ...properties,
    });
  }
};

export const identifyUserServer = (
  userId: string,
  userProperties?: Record<string, any>
) => {
  if (mixpanel) {
    mixpanel.people.set(userId, userProperties || {});
  }
};
