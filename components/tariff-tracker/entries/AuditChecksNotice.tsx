"use client";

import { SparklesIcon } from "@heroicons/react/20/solid";
import * as ui from "@/components/ui/styles";
import { TRIAL_ALLOWANCE } from "@/components/pricing-calculator/lib/pricing";
import { useTrackerAccess } from "../access/accessContext";

// The trial's audit checks: how many are left (nothing on a plan, where they're unlimited)
export const AuditChecksNotice = () => {
  const { paid, auditsLeft } = useTrackerAccess();
  if (paid) return null;
  return (
    <div role="status" className={`${ui.notice(auditsLeft > 0 ? "primary" : "warning")} flex flex-col gap-3 sm:flex-row sm:items-center`}>
      <SparklesIcon className={`h-5 w-5 shrink-0 ${auditsLeft > 0 ? "text-primary" : "text-warning"}`} aria-hidden />
      <p className={`${ui.bodySm} flex-1`}>
        <span className="font-semibold text-base-content">
          {auditsLeft > 0
            ? `${auditsLeft} of ${TRIAL_ALLOWANCE.auditChecks} free audit checks left.`
            : `You've used your ${TRIAL_ALLOWANCE.auditChecks} free audit checks.`}
        </span>{" "}
        {auditsLeft > 0 ? "Each one checks one entry against the duty in force on its entry date." : "A plan audits every entry, without limit."}
      </p>
    </div>
  );
};
