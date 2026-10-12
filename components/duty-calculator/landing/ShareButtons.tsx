"use client";

import { useState } from "react";
import { ArrowDownTrayIcon, CheckIcon, LinkIcon } from "@heroicons/react/20/solid";
import { useUser } from "@/contexts/UserContext";
import * as tt from "@/components/ui/styles/tracker";
import { MixpanelEvent, trackEvent } from "@/libs/mixpanel";
import { signupHref } from "@/components/tariff-tracker/access/signup";
import { TariffFinder } from "../lib/useTariffFinder";
import { ConversionDialog } from "../calculator/ConversionDialog";
import { thisPageWith } from "./redirect";

// On the calculator's tab bar: download this calculation as a PDF, which takes a free account,
// and copy a link to it, which is free. Signed out, Download opens the free account's pitch with
// the PDF picked out; sign-up comes back to this import with `export=pdf`, for the Tracker to
// offer the file.
export const DownloadPdfButton = () => {
  const { user } = useUser();
  const [open, setOpen] = useState(false);
  const download = () => {
    // Built at click time, so it carries the inputs as they are now
    window.location.href = signupHref(thisPageWith({ export: "pdf" }));
  };
  return (
    <>
      <button
        type="button"
        className={tt.button("secondary", "sm", "rounded")}
        onClick={() => {
          trackEvent(MixpanelEvent.LOCKED_FEATURE_CTA_CLICKED, { feature: "pdf-download", reason: user ? "signed-in" : "account", page: "calculator" });
          if (user) download();
          else setOpen(true);
        }}
      >
        <ArrowDownTrayIcon className="h-4 w-4" aria-hidden />
        Download
      </button>
      <ConversionDialog
        open={open}
        view="account"
        account={{ title: "Download this estimate, free", highlight: "pdf", cta: "Create my free account and download" }}
        onClose={() => setOpen(false)}
        onCreateAccount={download}
        page="calculator"
      />
    </>
  );
};

export const ShareButton = ({ f }: { f: TariffFinder }) => (
  <button type="button" className={tt.button("secondary", "sm")} onClick={f.copyLink}>
    {f.copied ? <CheckIcon className="h-4 w-4 text-success" aria-hidden /> : <LinkIcon className="h-4 w-4" aria-hidden />}
    {f.copied ? "Link copied" : "Share"}
  </button>
);
