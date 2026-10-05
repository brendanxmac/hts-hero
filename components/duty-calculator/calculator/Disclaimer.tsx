"use client";

import { MixpanelEvent, trackEvent } from "@/libs/mixpanel";
import * as ui from "@/components/ui/styles";

// Fine print under the calculator
export const Disclaimer = () => (
  <p className={`${ui.caption} text-center leading-relaxed max-w-2xl mx-auto`}>
    All figures shown are estimates based on the details provided and may not be complete nor correct. <br /> Spot something wrong?{" "}
    <a
      href="mailto:support@htshero.com"
      className={ui.link}
      target="_blank"
      rel="noopener noreferrer"
      onClick={() => trackEvent(MixpanelEvent.DUTY_CALCULATOR_SUPPORT_CLICKED)}
    >
      Tell us
    </a>{" "}
    and we&apos;ll fix it.
  </p>
);
