"use client";

import { ArrowDownTrayIcon, CheckIcon, LinkIcon, LockClosedIcon } from "@heroicons/react/20/solid";
import * as tt from "@/components/ui/styles/tracker";
import { MixpanelEvent, trackEvent } from "@/libs/mixpanel";
import { signupHref } from "@/components/tariff-tracker/access/signup";
import { TariffFinder } from "../lib/useTariffFinder";
import { thisPageWith } from "./redirect";

// On the calculator's tab bar: download this calculation as a PDF, which takes a free account
// (sign-up comes back to this import with `export=pdf`, for the Tracker to offer the file), and
// copy a link to it, which is free
export const DownloadPdfButton = () => (
  <a
    href={signupHref(thisPageWith({ export: "pdf" }))}
    className={tt.button("secondary", "sm")}
    title="Free with an account"
    onClick={(e) => {
      // Built at click time, so it carries the inputs as they are now
      e.currentTarget.href = signupHref(thisPageWith({ export: "pdf" }));
      trackEvent(MixpanelEvent.LOCKED_FEATURE_CTA_CLICKED, { feature: "pdf-download", reason: "account", page: "calculator" });
    }}
  >
    <ArrowDownTrayIcon className="h-4 w-4" aria-hidden />
    Download PDF
    <LockClosedIcon className="h-3 w-3 text-base-content/40" aria-label="Free with an account" />
  </a>
);

export const ShareButton = ({ f }: { f: TariffFinder }) => (
  <button type="button" className={tt.button("secondary", "sm")} onClick={f.copyLink}>
    {f.copied ? <CheckIcon className="h-4 w-4 text-success" aria-hidden /> : <LinkIcon className="h-4 w-4" aria-hidden />}
    {f.copied ? "Link copied" : "Share"}
  </button>
);
