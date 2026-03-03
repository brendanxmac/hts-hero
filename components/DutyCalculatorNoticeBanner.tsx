"use client";

import { InformationCircleIcon } from "@heroicons/react/24/outline";
import { Crisp } from "crisp-sdk-web";
import config from "@/config";

const NOTICE_TEXT =
  "NOTE: This duty calculator has been updated to account for IEEPA tariffs being removed and the 10% Section 122 tariff being added. We will continue to monitor & update as the ruling aftermath unfolds.";

function openReportCrispOrEmail() {
  if (config.crisp?.id) {
    Crisp.chat.show();
    Crisp.chat.open();
  } else if (config.resend?.supportEmail) {
    window.open(
      `mailto:${config.resend.supportEmail}?subject=Issue with ${config.appName}`,
      "_blank"
    );
  }
}

type Variant = "banner" | "inline";

interface DutyCalculatorNoticeBannerProps {
  /** "banner" = full-width page strip with bottom border; "inline" = rounded card for use inside sections */
  variant?: Variant;
}

export function DutyCalculatorNoticeBanner({
  variant = "banner",
}: DutyCalculatorNoticeBannerProps) {
  const isBanner = variant === "banner";

  return (
    <div
      className={
        isBanner
          ? "w-full border-l-4 border-l-warning border-y border-r border-warning/30 bg-gradient-to-r from-warning/10 via-warning/5 to-transparent text-base-content px-4 py-3 sm:px-6 shadow-sm"
          : "w-full rounded-xl border border-warning/30 bg-gradient-to-br from-warning/10 via-base-100 to-warning/5 text-base-content px-3 py-2.5 mb-3 shadow-md shadow-warning/5"
      }
      role="status"
      aria-live="polite"
    >
      <div
        className={
          isBanner
            ? "max-w-6xl mx-auto flex items-start gap-3 sm:gap-4"
            : "flex items-start gap-2 sm:gap-3"
        }
      >
        <div
          className={
            isBanner
              ? "shrink-0 rounded-full bg-warning/20 p-1.5 text-warning"
              : "shrink-0 rounded-full bg-warning/20 p-1 text-warning"
          }
          aria-hidden
        >
          <InformationCircleIcon
            className={isBanner ? "h-5 w-5" : "h-4 w-4"}
            strokeWidth={2}
          />
        </div>
        <div
          className={
            isBanner
              ? "flex min-w-0 flex-col gap-2"
              : "flex min-w-0 flex-col gap-1.5"
          }
        >
          <p
            className={
              isBanner
                ? "text-sm sm:text-base font-semibold leading-snug text-base-content"
                : "text-xs sm:text-sm font-semibold leading-snug text-base-content"
            }
          >
            {NOTICE_TEXT}
          </p>
          <p
            className={
              isBanner
                ? "text-sm text-base-content/80"
                : "text-xs text-base-content/80"
            }
          >
            See an issue?{" "}
            <button
              type="button"
              onClick={openReportCrispOrEmail}
              className="font-semibold text-primary underline decoration-2 underline-offset-2 hover:text-primary/90 hover:decoration-primary/90 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:ring-offset-2 rounded-md transition-colors"
            >
              Report it here
            </button>{" "}
            so we can fix it and help everyone.
          </p>
        </div>
      </div>
    </div>
  );
}
