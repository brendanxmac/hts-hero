"use client";

import { ArrowRightIcon, ExclamationTriangleIcon } from "@heroicons/react/20/solid";
import { getLatestVerifiedRevision, isVerifiedDate } from "@/tariffs/engine-v2/revisions";
import * as ui from "@/components/ui/styles";
import { formatDate } from "../lib/format";

// Warns when an entry date is outside the verified tariff data, with a button to use the
// latest verified date. For any entry date; the Tariff Finder's version is VerifiedNotice.
export const DateNotice = ({
  entryDate,
  onUseVerified,
}: {
  entryDate: string;
  onUseVerified: (date: string) => void;
}) => {
  if (isVerifiedDate(entryDate)) return null;
  const latestVerified = getLatestVerifiedRevision();
  return (
    <div
      role="status"
      className={`${ui.notice("warning")} flex flex-col sm:flex-row sm:items-center gap-3`}
    >
      <ExclamationTriangleIcon className="w-5 h-5 shrink-0 text-warning" aria-hidden />
      <p className={`${ui.bodySm} flex-1`}>
        <span className="font-semibold text-base-content">Tariff rules for {formatDate(entryDate)} aren&apos;t verified yet.</span>{" "}
        Our data is verified for HTS {latestVerified.title} ({formatDate(latestVerified.from)} –{" "}
        {latestVerified.to ? formatDate(latestVerified.to) : "present"}). Changes outside that window may be missing.
      </p>
      <button type="button" className={`${ui.button({ size: "sm" })} shrink-0`} onClick={() => onUseVerified(latestVerified.from)}>
        Use {formatDate(latestVerified.from)}
        <ArrowRightIcon className="w-4 h-4" />
      </button>
    </div>
  );
};
