"use client";

import { ArrowRightIcon, ExclamationTriangleIcon } from "@heroicons/react/20/solid";
import { getVerifiedRange, isVerifiedDate } from "@/tariffs/engine-v2/revisions";
import { addDays } from "@/tariffs/engine-v2/history";
import * as ui from "@/components/ui/styles";
import { formatDate } from "../lib/format";

// Warns when an entry date is outside the verified tariff data, with a button to use the
// nearest verified date. For any entry date; the Tariff Finder's version is VerifiedNotice.
export const DateNotice = ({
  entryDate,
  onUseVerified,
}: {
  entryDate: string;
  onUseVerified: (date: string) => void;
}) => {
  if (isVerifiedDate(entryDate)) return null;
  const range = getVerifiedRange();
  const before = entryDate < range.from;
  // The last verified day, when a newer revision isn't verified yet
  const lastDay = range.to ? addDays(range.to, -1) : null;
  const nearest = before || !lastDay ? range.from : lastDay;
  return (
    <div
      role="status"
      className={`${ui.notice("warning")} flex flex-col sm:flex-row sm:items-center gap-3`}
    >
      <ExclamationTriangleIcon className="w-5 h-5 shrink-0 text-warning" aria-hidden />
      <p className={`${ui.bodySm} flex-1`}>
        <span className="font-semibold text-base-content">Tariff rules for {formatDate(entryDate)} aren&apos;t verified yet.</span>{" "}
        Our data is verified from {formatDate(range.from)} {lastDay ? `through ${formatDate(lastDay)}` : "to today"}. Changes{" "}
        {before ? "before" : "after"} that may be missing.
      </p>
      <button type="button" className={`${ui.button({ size: "sm" })} shrink-0`} onClick={() => onUseVerified(nearest)}>
        Use {formatDate(nearest)}
        <ArrowRightIcon className="w-4 h-4" />
      </button>
    </div>
  );
};
