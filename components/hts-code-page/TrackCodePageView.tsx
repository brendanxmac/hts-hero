"use client";

import { useEffect } from "react";
import { MixpanelEvent, trackEvent } from "@/libs/mixpanel";

// "HTS Code Page Viewed": once per code page shown, with the code, so the most-read codes and
// chapters can be reported without parsing page URLs. Rendered by app/hts/[code]/page.tsx.
export default function TrackCodePageView({ htsCode, chapter, digits }: { htsCode: string; chapter: string; digits: number }): null {
  useEffect(() => {
    trackEvent(MixpanelEvent.HTS_CODE_PAGE_VIEWED, { hts_code: htsCode, chapter, digit_count: digits });
  }, [htsCode, chapter, digits]);
  return null;
}
