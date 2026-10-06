import { ReactNode } from "react";
import { HtsElement } from "@/interfaces/hts";
import { mono } from "@/components/ui/font";
import { isVerifiedDate } from "@/tariffs/engine-v2/revisions";
import { formatDate } from "../lib/format";
import { TariffFinder } from "../lib/useTariffFinder";
import { ShareButtons } from "./ShareButtons";
import { ViewSwitch } from "./ViewSwitch";

// The results' heading: the code, origins, date and transport, with the view switch, any actions
// the host adds (the Tariff Tracker's "Add to catalog") and sharing
export const ResultsHeader = ({
  f,
  result,
  selectedElement,
  country,
  allowCompare = true,
  actions,
}: {
  f: TariffFinder;
  allowCompare?: boolean;
  actions?: ReactNode;
  result: NonNullable<TariffFinder["result"]>;
  selectedElement: HtsElement;
  country: NonNullable<TariffFinder["country"]>;
}) => (
  <div
    id="duty-results"
    className="flex flex-wrap items-end justify-between gap-4 scroll-mt-4"
  >
    <div className="min-w-0">
      <h2
        id="results-heading"
        className="text-2xl font-semibold tracking-tight text-base-content"
      >
        Duty Estimate
      </h2>
      <p className="mt-1 text-sm text-base-content/70">
        <span
          className={`${mono.className} font-semibold text-base-content`}
        >
          {selectedElement.htsno}
        </span>
        {" · "}
        {f.comparing
          ? f.compareEntries
            .map((e) => `${e.country.flag} ${e.country.name}`)
            .join(" vs ")
          : `${country.flag} ${country.name}`}
        {" · "}
        {formatDate(result.asOf)}
        {" · "}
        {f.transportLabel}
      </p>
      {/* Which edition of the schedule the numbers come from: freshness people can check */}
      {f.revisionForDate && (
        <p className="mt-0.5 text-xs text-base-content/60">
          Rates from HTS {f.revisionForDate.title}
          {isVerifiedDate(result.asOf) ? ", verified" : ""}
        </p>
      )}
    </div>
    <div className="flex flex-wrap sm:flex-nowrap w-full sm:w-auto items-center gap-2">
      <ViewSwitch f={f} className="basis-full sm:basis-auto" allowCompare={allowCompare} />
      {actions}
      <ShareButtons f={f} />
    </div>
  </div>
);
