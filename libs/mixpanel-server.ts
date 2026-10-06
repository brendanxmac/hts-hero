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

// Like trackEventServer, but resolves once Mixpanel has the event (or after `timeoutMs`), for
// serverless handlers that can be frozen as soon as they respond
export const trackEventServerAsync = (
  eventName: MixpanelEvent,
  userId: string,
  properties?: Record<string, any>,
  timeoutMs = 1500
): Promise<void> =>
  new Promise((resolve) => {
    if (!mixpanel) return resolve();
    const timer = setTimeout(resolve, timeoutMs);
    mixpanel.track(eventName, { distinct_id: userId, ...properties }, () => {
      clearTimeout(timer);
      resolve();
    });
  });
